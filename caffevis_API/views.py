from django.http import JsonResponse
from django.shortcuts import render
import os
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


def main_page(request):
	import threading
	live_vis_thread = threading.Thread(target=lv.run_loop)
	live_vis_thread.setDaemon(True)
	live_vis_thread.start()
	while not lv.preprocess:
		continue
	print("frame data", lv.input_updater.get_frame()[1].shape)
	return render(request, "template.html", {"layer_info": clean_net_layer_info(lv.nets_layer_info)})


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
