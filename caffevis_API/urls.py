from django.urls import path
from .views import *

app_name = "caffevis_API"
urlpatterns = [
	path("", main_page, name="main_page"),
	path("api/input_frame/", update_input_frame, name="input_frame"),
	path("api/prob_layer/", prob_label, name="prob_layer"),
	path("api/layer_data/", layer_data, name="layer_data"),
	path("api/back_pane/", update_back_pane, name="back_pane"),
]
