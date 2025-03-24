from rest_framework import serializers
from .models import CustomUser, UsersSubscriptions


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser  # модель, которую следует сериализовать
        fields = "__all__"  # все поля модели будут включены в сериализатор


class UserSerializerResponse(serializers.ModelSerializer):
    is_subscribed = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["id", "username", "first_name", "last_name", "is_subscribed"]

    def get_is_subscribed(self, obj):
        request = self.context.get("request")

        return UsersSubscriptions.objects.filter(
            subscriber=request.user, subscription=obj.id
        ).exists()


class UserSubscribeSerializerRequest(serializers.Serializer):
    subscription_user = serializers.IntegerField(
        help_text="Пользователь, на которого мы подписываемся / от которого мы отписываемся"
    )
