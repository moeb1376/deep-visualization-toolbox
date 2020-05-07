from base64 import b64encode
from time import sleep

from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
import os

from django.views.decorators.csrf import csrf_exempt
from django_eventstream import send_event

from live_vis import LiveVis
import threading
from .clean_data import clean_data_functions

try:
	import settings
except:
	print('\nError importing settings.py. Check the error message below for more information.')
	print("If you haven't already, you'll want to copy one of the settings_local.template-*.py files")
	print('to settings_local.py and edit it to point to your caffe checkout. E.g. via:')
	print()
	print('  $ cp models/caffenet-yos/settings_local.template-caffenet-yos.py settings_local.py')
	print('  $ < edit settings_local.py >\n')
	raise

lv = LiveVis(settings)
app = lv.apps["CaffeVisApp"]
live_vis_thread = threading.Thread(target=lv.run_loop)
live_vis_thread.setDaemon(True)


def main_page(request):
	context = {}
	if not live_vis_thread.is_alive():
		live_vis_thread.start()
	while lv.preprocess < 3:
		continue
	lv.preprocess = 0
	while len(app.base_data.keys()) < 1:
		continue
	if app.base_data["netLayerInfo"] is None:
		app.base_data["netLayerInfo"] = clean_net_layer_info(lv.nets_layer_info)
	with app.data_available_lock:
		datas = app.base_data["probLabel"][:]
	for data in datas:
		data[1] = 1 if data[1] else 0
	context["prob_label"] = datas
	context["net_layer_info"] = clean_net_layer_info(lv.nets_layer_info)
	app.state.restart_web_app()
	return render(request, "template.html", context)


def clean_net_layer_info(nets_layer_info):
	result = {}
	for net in nets_layer_info:
		for key, item in net.items():
			if key == "data":
				continue
			result[key] = item['data_shape']
	return result


def update_input_frame(request):
	_, data = lv.input_updater.get_frame()
	shape = data.shape
	data = data.tolist()
	return JsonResponse({"image_data": data, "shape": shape})


def prob_label(request):
	while app is None:
		continue
	if app.new_data_available["prob_label"]:
		with app.data_available_lock:
			datas = app.data_webapp["prob_label"][:]
		for data in datas:
			data[1] = 1 if data[1] else 0
		app.new_data_available["prob_label"] = False
		return JsonResponse({"data": datas}, status=200)
	else:
		return JsonResponse({}, status=400)


def layer_data(request):
	print(app.new_data_available["layer_data"], app.state.new_layer_data)
	if app.new_data_available["layer_data"] and app.state.new_layer_data:
		data = app.data_webapp["layer_data"]
		shape = data.shape
		print(b64encode(data[0]))
		data = data.tolist()
		selected_layer = app.state.layer
		app.new_data_available["layer_data"] = False
		app.state.new_layer_data = False
		return JsonResponse({"data": data, "shape": shape, "selected_layer": selected_layer})
	elif app.state.base_data.get("old_layer_data", None) is not None:
		data = app.state.base_data.get("old_layer_data", None)
		shape = data.shape
		data = data.tolist()
		selected_layer = app.state.layer
		return JsonResponse({"data": data, "shape": shape, "selected_layer": selected_layer})


def get_back_pane_data(request):
	with app.data_available_lock:
		data = app.data_webapp["backDrawImage"]
	shape = data.shape
	data = data.tolist()
	app.new_data_available["backDrawImage"] = False
	return JsonResponse({"data": data, "shape": shape})


@csrf_exempt
def update_selected_unit(request):
	number = request.POST.get("number", None)
	if number is None:
		return HttpResponseBadRequest()
	app.state.change_selected_unit(int(number))
	return JsonResponse({}, status=200)


@csrf_exempt
def update_back_mode(request):
	toggle = request.POST.get("toggle", False)
	if toggle == "true":
		app.state.toggle_back_mode()
	return JsonResponse({}, status=200)


@csrf_exempt
def change_selected_layer(request):
	name = request.POST.get("name", None)
	if name is not None:
		idx = int(name.split("_")[-1]) - 1
		app.state.change_selected_layer(idx)
		return JsonResponse({}, status=200)
	return HttpResponseBadRequest()


@csrf_exempt
def change_input_image(request):
	command = request.POST.get("command", None)
	if command == "next":
		if lv.input_updater.static_file_mode:
			lv.input_updater.increment_static_file_idx(1)
		else:
			lv.input_updater.toggle_input_mode()
		app.state.new_layer_data = True
		return JsonResponse({}, status=200)
	elif command == "before":
		if lv.input_updater.static_file_mode:
			lv.input_updater.increment_static_file_idx(-1)
		else:
			lv.input_updater.toggle_input_mode()
		app.state.new_layer_data = True
		return JsonResponse({}, status=200)
