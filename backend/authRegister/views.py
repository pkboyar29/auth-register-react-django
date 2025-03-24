from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    CustomUserSerializer,
    UserSerializerResponse,
    UserSubscribeSerializerRequest,
)
from .models import CustomUser, UsersSubscriptions
from django.conf import settings
import requests
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.db import IntegrityError


class UserRegistrationView(APIView):
    def post(self, request):

        request.data["password"] = make_password(request.data["password"])

        if CustomUser.objects.filter(username=request.data.get("login")).exists():
            return Response(
                "User with this login already exists", status=status.HTTP_403_FORBIDDEN
            )

        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():  # валидация на стороне сервера
            user = (
                serializer.save()
            )  # создаст новый объект модели или обновит существующий объект модели

            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            return Response(
                {
                    "access_token": str(access_token),
                    "refresh_token": str(refresh_token),
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAuthView(APIView):
    def post(self, request):

        if (
            CustomUser.objects.filter(username=request.data.get("username")).count()
            == 0
        ):
            return Response(
                "User with this username doesn't exist",
                status=status.HTTP_404_NOT_FOUND,
            )

        user = CustomUser.objects.get(username=request.data.get("username"))
        if check_password(request.data.get("password"), user.password):

            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token

            return Response(
                {
                    "access_token": str(access_token),
                    "refresh_token": str(refresh_token),
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                "Passwords don't match", status=status.HTTP_401_UNAUTHORIZED
            )


class UserView(APIView):

    @permission_classes([IsAuthenticated])
    def get(self, request):
        users = CustomUser.objects.all()

        return Response(
            UserSerializerResponse(users, many=True, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class UserSubscribeView(APIView):
    @permission_classes([IsAuthenticated])
    def post(self, request):
        serializer = UserSubscribeSerializerRequest(data=request.data)

        if serializer.is_valid():
            subscription_user_id = serializer.data.get("subscription_user")

            if request.user.id == subscription_user_id:
                return Response(
                    "Нельзя подписаться на самого себя",
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                UsersSubscriptions.objects.create(
                    subscriber=request.user, subscription_id=subscription_user_id
                )
                return Response(
                    {"message": "Вы успешно подписались"},
                    status=status.HTTP_200_OK,
                )
            except IntegrityError:
                return Response(
                    {"error": "Такая подписка уже существует"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserUnsubcribeView(APIView):
    @permission_classes([IsAuthenticated])
    def post(self, request):
        serializer = UserSubscribeSerializerRequest(data=request.data)

        if serializer.is_valid():
            subscription_user_id = serializer.data.get("subscription_user")

            subcription = UsersSubscriptions.objects.filter(
                subscriber=request.user, subscription=subscription_user_id
            )

            if subcription.exists():
                subcription.delete()

                return Response("Вы успешно отписались", status=status.HTTP_200_OK)
            else:
                return Response(
                    "Вы не подписаны на этого пользователя",
                    status=status.HTTP_400_BAD_REQUEST,
                )

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):

    @permission_classes([IsAuthenticated])
    def get(self, request):
        data = {  # это словарь python, однако при передачи его в Response, DRF его преобразует в json строку
            "id": request.user.id,
            "theme": request.user.theme,
            "first-name": request.user.first_name,
            "subscribers_amount": len(
                UsersSubscriptions.objects.filter(subscription=request.user.id)
            ),
            "subscriptions_amount": len(
                UsersSubscriptions.objects.filter(subscriber=request.user.id)
            ),
        }
        return Response(data, status=status.HTTP_200_OK)


class UserChangeThemeView(APIView):

    @permission_classes([IsAuthenticated])
    def post(self, request):
        request.user.theme = request.data.get("theme")
        request.user.save()

        return Response("Theme changed successfully", status=status.HTTP_200_OK)


class UserCheckRecaptchaTokenView(APIView):
    def post(self, request):
        token = request.data.get("token")
        secretKey = settings.RECAPTCHA_SECRET_KEY
        verifyUrl = "https://www.google.com/recaptcha/api/siteverify"

        data = {"secret": secretKey, "response": token}

        response = requests.post(verifyUrl, data=data)

        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                return Response("Token is valid", status=status.HTTP_200_OK)
            else:
                return Response("Token isn't valid", status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                "Error by verifying reCAPTCHA token",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
