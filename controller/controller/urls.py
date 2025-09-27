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
    path('autority/home', views.authority_home, name='authority_home'),
    path('autority/reportes', views.authority_reports, name='authority_reports'),
    path('autority/profile', views.authority_profile, name='authority_profile'),
    path('autority/ajustes', views.authority_settings, name='authority_settings'),
    # Autoridad routes (Inertia)
    path('admin/home', views.admin_home, name='admin_home'),
    path('admin/reportes', views.admin_reports, name='admin_reports'),
    path('admin/profile', views.admin_profile, name='admin_profile'),
    path('admin/usuarios', views.admin_users, name='admin_users'),
    path('admin/ajustes', views.admin_settings, name='admin_settings'),
    # Simple API endpoint for testing backend submit
    path('api/reports', views.create_report, name='create_report'),
]

