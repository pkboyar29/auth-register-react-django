from django.urls import path
from .views import UserRegistrationView, UserAuthView, UserDetailView

urlpatterns = [
   path('register', UserRegistrationView.as_view(), name='register-user'),
   path('auth', UserAuthView.as_view(), name='authorization-user'),
   path('user/<str:login>', UserDetailView.as_view(), name='get-user-theme-firstName')
]