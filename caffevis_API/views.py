from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
import os

from django.views.decorators.csrf import csrf_exempt

from live_vis import LiveVis

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


def main_page(request):
	context = {}
	import threading
	live_vis_thread = threading.Thread(target=lv.run_loop)
	live_vis_thread.setDaemon(True)
	live_vis_thread.start()
	while lv.preprocess < 3:
		continue
	lv.preprocess = 0
	if app.new_data_available["prob_label"]:
		for data in app.data_webapp["prob_label"]:
			data[1] = 1 if data[1] else 0
		context["prob_label"] = app.data_webapp['prob_label']
	if app.new_data_available["net_layer_info"]:
		context["net_layer_info"] = clean_net_layer_info(lv.nets_layer_info)

	print(context)
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
	print(app.new_data_available)
	if app.new_data_available["prob_label"]:
		print(app.data_webapp["prob_label"])
		for data in app.data_webapp["prob_label"]:
			data[1] = 1 if data[1] else 0
		print(app.data_webapp["prob_label"])
		return JsonResponse({"data": app.data_webapp["prob_label"]})
	else:
		return JsonResponse({"data": "none"})


def layer_data(request):
	if app.new_data_available["layer_data"]:
		data = app.data_webapp["layer_data"]
		shape = data.shape
		data = data.tolist()
		selected_layer = app.state.layer
		return JsonResponse({"data": data, "shape": shape, "selected_layer": selected_layer})


@csrf_exempt
def update_back_pane(request):
	print("in back pane")
	print(request.POST)
	number = request.POST.get("number", None)
	if number is None:
		return HttpResponseBadRequest()
	app.state.selected_unit = int(number)
	app.state.cursor_area = "bottom"
	app.state.back_enabled = True
	app.state.drawing_stale = True
	app.state.back_stale = True
	while not app.new_data_available.get("back_draw_image", False):
		continue
	print("after while in back pane")
	data = app.data_webapp["back_draw_image"]
	shape = data.shape
	data = data.tolist()
	app.new_data_available["back_draw_image"] = False
	return JsonResponse({"data": data, "shape": shape})
