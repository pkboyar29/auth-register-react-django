from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CustomUserSerializer
from .models import CustomUser
from django.conf import settings
import requests
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

class UserRegistrationView(APIView):
   def post(self, request):

      request.data['password'] = make_password(request.data['password'])

      if CustomUser.objects.filter(username=request.data.get('login')).exists():
         return Response("User with this login already exists", status=status.HTTP_403_FORBIDDEN)

      serializer = CustomUserSerializer(data=request.data)
      if serializer.is_valid(): # валидация на стороне сервера
         user = serializer.save() # создаст новый объект модели или обновит существующий объект модели

         refresh_token = RefreshToken.for_user(user)
         access_token = refresh_token.access_token

         return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh_token)
         }, status=status.HTTP_201_CREATED)

      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
class UserAuthView(APIView):
   def post(self, request):

      if CustomUser.objects.filter(username=request.data.get('login')).count() == 0:
         return Response("User with this login doesn't exist", status=status.HTTP_404_NOT_FOUND)
      
      user = CustomUser.objects.get(username=request.data.get('login'))
      if check_password(request.data.get('password'), user.password):

         refresh_token = RefreshToken.for_user(user)
         access_token = refresh_token.access_token

         return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh_token)
         }, status=status.HTTP_200_OK)
      else:
         return Response("Passwords don't match", status=status.HTTP_401_UNAUTHORIZED)

class UserDetailView(APIView):
   
   @permission_classes([IsAuthenticated])
   def get(self, request):
      data = { # это словарь python, однако при передачи его в Response, DRF его преобразует в json строку
         'theme': request.user.theme,
         'first-name': request.user.first_name
      }
      return Response(data, status=status.HTTP_200_OK)
      
class UserChangeThemeView(APIView):

   @permission_classes([IsAuthenticated])
   def post(self, request):
      request.user.theme = request.data.get('theme')
      request.user.save()

      return Response('Theme changed successfully', status=status.HTTP_200_OK)
   
class UserCheckRecaptchaTokenView(APIView):
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
      
class TestView(APIView):
   def get(self, request):
      users = CustomUser.objects.all()
      serializer = CustomUserSerializer(users, many=True)
      return Response(serializer.data)