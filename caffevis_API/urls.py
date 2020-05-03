from django.urls import path
from .views import *

app_name = "caffevis_API"
urlpatterns = [
	path("", main_page, name="main_page"),
	path("api/input_frame/", update_input_frame, name="input_frame"),
	path("api/prob_layer/", prob_label, name="prob_layer"),
	path("api/layer_data/", layer_data, name="layer_data"),
	path("api/back_pane/", get_back_pane_data, name="back_pane"),
	path("api/update_selected_unit/", update_selected_unit, name="update_selected_unit"),
	path("api/update_back_mode/", update_back_mode, name="update_back_mode"),
	path("api/change_layer/", change_selected_layer, name="change_layer"),
]
