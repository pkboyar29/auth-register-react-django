from django.urls import path
from .views import UserRegistrationView, UserAuthView

urlpatterns = [
   path('register/', UserRegistrationView.as_view(), name='register-user'),
   path('auth/', UserAuthView.as_view(), name='authorization-user')
]