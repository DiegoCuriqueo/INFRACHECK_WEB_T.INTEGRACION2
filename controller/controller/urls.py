"""
URL configuration for controller project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.user_home, name='root'),
    path('user/home', views.user_home, name='user_home'),
    path('user/map', views.user_map, name='user_map'),
    path('user/reportes', views.user_reports, name='user_reports'),
    path('user/perfil', views.user_profile, name='user_profile'),
    path('user/ayuda', views.user_help, name='user_help'),
    path('user/ajustes', views.user_settings, name='user_settings'),
    # Simple API endpoint for testing backend submit
    path('api/reports', views.create_report, name='create_report'),
]
