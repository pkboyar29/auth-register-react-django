from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

class UserRegistrationView(APIView):
   def post(self, request):
      serializer = UserSerializer(data=request.data)
      if serializer.is_valid(): # валидация на стороне сервера
         serializer.save() # создаст новый объект модели или обновит существующий объект модели
         return Response("Successful", status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)