from inertia import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


def user_home(request):
    return render(request, 'user/HomeUSER', props={})


def user_map(request):
    return render(request, 'user/MapUSER', props={})


def user_reports(request):
    return render(request, 'user/ReportesUSER', props={})


def user_profile(request):
    return render(request, 'user/PerfilUser', props={})


def user_help(request):
    return render(request, 'user/AyudaUSER', props={})


def user_settings(request):
    return render(request, 'user/ajustesUSER', props={})


@csrf_exempt
def create_report(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        data = {}

    # Echo back minimal info for testing
    return JsonResponse({
        'ok': True,
        'message': 'Reporte guardado',
        'received': data.get('title') or data.get('desc') or 'ok'
    })

# Admin pages (Inertia)
def admin_home(request):
    return render(request, 'admin/HomeADM', props={})


def admin_reports(request):
    return render(request, 'admin/ReportesADM', props={})


def admin_profile(request):
    return render(request, 'admin/profileADM', props={})


def admin_users(request):
    return render(request, 'admin/UsuariosADM', props={})


def admin_settings(request):
    return render(request, 'admin/ajustesADM', props={})