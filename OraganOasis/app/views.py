from django.shortcuts import render, redirect
from django.http import Http404

# Create your views here.
def home(request):
    return render(request, 'home.html')

# Create your views here.
def chatbot(request):
    return render(request, 'chatbot.html')

# Create your views here.
def donorform(request):
    return render(request, 'donorform.html')

# Create your views here.
def madddonot(request):
    return render(request, 'madddonot.html')

# Create your views here.
def mainpage(request):
    return render(request, 'mainpage.html')

def dashboard(request):
    return render(request, 'dashboard.html')
    # return render(request, 'mainpage.html')

# Create your views here.
def mavalabilitypage(request):
    return render(request, 'mavalabilitypage.html')

# Login view
def signin(request):
    if request.method == 'POST':
        # TODO: Add authentication logic here
        return redirect('dashboard')
    return render(request, 'signin.html')

# Hospital registration view
def signup(request):
    if request.method == 'POST':
        # TODO: Add registration logic here
        return redirect('login')
    return render(request, 'signup.html')

# Create your views here.
def support(request):
    return render(request, 'support.html')

# Create your views here.
def tt(request):
    return render(request, 'tt.html')

# Create your views here.
def dashboard(request):
    return render(request, 'dashboard.html')

# AI Search page
def ai_search(request):
    return render(request, 'frontend/ai_search.html')


# Availability page (explicit route)
def availability(request):
    """Render the frontend availability demo page at /availability/"""
    return render(request, 'frontend/availability.html')


# Transfer Out page
def transfer_out(request):
    """Render the transfer out (dispatch) page."""
    return render(request, 'tt.html')


# Transfer In page
def transfer_in(request):
    """Render the transfer in (arrival) page."""
    return render(request, 'ttin.html')


# Reports page
def reports(request):
    """Render the transfer reports page."""
    return render(request, 'report.html')


# Settings page
def settings(request):
    """Render the settings page with theme controls."""
    return render(request, 'settings.html')


def frontend_page(request, page_name):
    """Serve specific frontend templates under /frontend/<name>.html safely.

    Only templates listed in allowed_pages are exposed to avoid arbitrary file access.
    """
    allowed_pages = {
        'home.html', 'login.html', 'signup.html', 'dashboard.html', 'add_donor.html',
        'availability.html', 'ai_search.html', 'transfer_report.html', 'settings.html'
    }
    if page_name in allowed_pages:
        return render(request, f'frontend/{page_name}')
    raise Http404(f'Page {page_name} not found')