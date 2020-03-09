from django.urls import path
from .views import *

app_name = "caffevis_API"
urlpatterns = [
	path("", main_page, name="main_page"),
	path("api/input_frame", update_input_frame, name="update_input_frame")
]
