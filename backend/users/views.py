from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegisterSerializer, UserSerializer
from .models import LoginHistory

User = get_user_model()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

class RegisterView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "success": True,
                "data": UserSerializer(user).data,
                "message": "User registered successfully"
            }, status=status.HTTP_201_CREATED)
        
        first_error_field = list(serializer.errors.keys())[0]
        first_error_msg = serializer.errors[first_error_field][0]
        return Response({
            "success": False,
            "error": first_error_field,
            "message": f"{first_error_field}: {first_error_msg}",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        if not email or not password:
            return Response({
                "success": False,
                "error": "credentials",
                "message": "Email and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user is not None:
            if not user.is_active:
                LoginHistory.objects.create(user=user, email=email, ip_address=ip, user_agent=user_agent, status='failed')
                return Response({
                    "success": False,
                    "error": "auth",
                    "message": "Account is disabled"
                }, status=status.HTTP_400_BAD_REQUEST)

            LoginHistory.objects.create(user=user, email=email, ip_address=ip, user_agent=user_agent, status='success')
            refresh = RefreshToken.for_user(user)
            return Response({
                "success": True,
                "data": {
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "user": UserSerializer(user).data
                },
                "message": "Login successful"
            }, status=status.HTTP_200_OK)

        # Failed login - try to find user for history
        try:
            failed_user = User.objects.get(email=email)
        except User.DoesNotExist:
            failed_user = None
        LoginHistory.objects.create(user=failed_user, email=email, ip_address=ip, user_agent=user_agent, status='failed')

        return Response({
            "success": False,
            "error": "credentials",
            "message": "Invalid email or password"
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                "success": True,
                "data": {},
                "message": "Logged out successfully"
            }, status=status.HTTP_200_OK)
        except (InvalidToken, TokenError):
            return Response({
                "success": True,
                "data": {},
                "message": "Logged out"
            }, status=status.HTTP_200_OK)


class MeView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({
            "success": True,
            "data": UserSerializer(request.user).data,
            "message": "User retrieved successfully"
        }, status=status.HTTP_200_OK)


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return Response({
                "success": True,
                "data": {"access": response.data['access']},
                "message": "Token refreshed successfully"
            }, status=status.HTTP_200_OK)
        except (InvalidToken, TokenError) as e:
            return Response({
                "success": False,
                "error": "token",
                "message": str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
