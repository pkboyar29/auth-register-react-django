from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from .models import User

class UserRegistrationView(APIView):
   def post(self, request):

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
      if user.password == request.data.get('password'):
         return Response("Successful", status=status.HTTP_200_OK)
      else:
         return Response("Passwords don't match", status=status.HTTP_401_UNAUTHORIZED)