from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
   class Meta:
      model = User # модель, которую следует сериализовать
      fields = '__all__' # все поля модели будут включены в сериализатор