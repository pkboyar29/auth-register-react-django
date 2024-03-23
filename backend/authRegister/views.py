from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from .models import User
from django.conf import settings
import requests
from django.contrib.auth.hashers import make_password, check_password

class UserRegistrationView(APIView):
   def post(self, request):

      request.data['password'] = make_password(request.data['password'])

      if User.objects.filter(login=request.data.get('login')).exists():
         return Response("User with this login already exists", status=status.HTTP_403_FORBIDDEN)

      serializer = UserSerializer(data=request.data)
      if serializer.is_valid(): # валидация на стороне сервера
         serializer.save() # создаст новый объект модели или обновит существующий объект модели
         return Response("Successful", status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
class UserAuthView(APIView):
   def post(self, request):

      if User.objects.filter(login=request.data.get('login')).count() == 0:
         return Response("User with this login doesn't exist", status=status.HTTP_404_NOT_FOUND)
      
      user = User.objects.get(login=request.data.get('login'))
      if check_password(request.data.get('password'), user.password):
         return Response("Successful", status=status.HTTP_200_OK)
      else:
         return Response("Passwords don't match", status=status.HTTP_401_UNAUTHORIZED)

class UserDetailView(APIView):
   def get(self, request, login):
      
      try:
         user = User.objects.get(login=login)
         data = { # это словарь python, однако при передачи его в Response, DRF его преобразует в json строку
            'theme': user.theme,
            'first-name': user.first_name
         }
         return Response(data, status=status.HTTP_200_OK)
      except User.DoesNotExist:
         return Response('User not found', status=status.HTTP_404_NOT_FOUND)
      
class UserChangeTheme(APIView):
   def post(self, request, login):
      user = User.objects.get(login=login)
      user.theme = request.data.get('theme')
      user.save()

      return Response('Theme changed successfully', status=status.HTTP_200_OK)
   
class UserCheckRecaptchaToken(APIView):
   def post(self, request):
      token = request.data.get('token')
      secretKey = settings.RECAPTCHA_SECRET_KEY
      verifyUrl = "https://www.google.com/recaptcha/api/siteverify"

      data = {
         'secret': secretKey,
         'response': token
      }

      response = requests.post(verifyUrl, data=data)
      
      if response.status_code == 200:
         result = response.json()
         if result['success']:
            return Response("Token is valid", status=status.HTTP_200_OK)
         else:
            return Response("Token isn't valid", status=status.HTTP_404_NOT_FOUND)
      else:
         return Response("Error by verifying reCAPTCHA token", status=status.HTTP_500_INTERNAL_SERVER_ERROR)