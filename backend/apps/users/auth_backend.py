from django.contrib.auth.backends import BaseBackend
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class PhoneBackend(BaseBackend):
    def authenticate(self, request, phone_number=None, password=None, **kwargs):
        try:
            user = User.objects.get(phone_number=phone_number)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try to get token from header first (for API clients)
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                try:
                    validated_token = self.get_validated_token(raw_token)
                    return self.get_user(validated_token), validated_token
                except (InvalidToken, AuthenticationFailed):
                    pass
        
        # If no header token, try to get from cookie
        raw_token = request.COOKIES.get("access_token")
        if raw_token is None:
            return None
        
        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, AuthenticationFailed) as e:
            print(f"Token validation failed: {e}")
            return None

User = get_user_model()

class AdminPhoneBackend(ModelBackend):
    """
    Custom backend for Django admin to authenticate using phone_number
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to find user by phone_number (which is the username field)
            user = User.objects.get(phone_number=username)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            # Fall back to the default behavior for superusers
            try:
                return super().authenticate(request, username=username, password=password, **kwargs)
            except:
                return None
        return None