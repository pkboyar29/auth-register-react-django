from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
   class Meta:
      model = CustomUser # модель, которую следует сериализовать
      fields = '__all__' # все поля модели будут включены в сериализатор