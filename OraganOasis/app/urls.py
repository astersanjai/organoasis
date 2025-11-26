from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.signin, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('availability/', views.availability, name='availability'),
    path('dashboard/donor-form/', views.donorform, name='donorform'),
    path('ai-search/', views.ai_search, name='ai_search'),
    path('transfer/out/', views.transfer_out, name='transfer_out'),
    path('transfer/in/', views.transfer_in, name='transfer_in'),
    path('reports/', views.reports, name='reports'),
    path('settings/', views.settings, name='settings'),
    path('frontend/<str:page_name>', views.frontend_page, name='frontend_page'),
]
