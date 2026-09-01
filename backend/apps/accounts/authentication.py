import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_LIFETIME = timedelta(minutes=60)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)

def generate_tokens_for_user(user):
    """
    Sinh cặp Access Token và Refresh Token bảo mật chuẩn JWT cho người dùng.
    """
    now = datetime.now(timezone.utc)
    
    access_payload = {
        "user_id": str(user.id),
        "username": user.username,
        "role": user.role,
        "token_type": "access",
        "iat": int(now.timestamp()),
        "exp": int((now + ACCESS_TOKEN_LIFETIME).timestamp()),
    }
    
    refresh_payload = {
        "user_id": str(user.id),
        "username": user.username,
        "token_type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int((now + REFRESH_TOKEN_LIFETIME).timestamp()),
    }
    
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    return {
        "access": access_token,
        "refresh": refresh_token,
        "access_expires_at": (now + ACCESS_TOKEN_LIFETIME).isoformat(),
        "refresh_expires_at": (now + REFRESH_TOKEN_LIFETIME).isoformat(),
    }

def verify_refresh_token(token_str):
    """
    Xác thực Refresh Token để cấp phát Access Token mới.
    """
    try:
        payload = jwt.decode(token_str, settings.SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed("Refresh token đã hết hạn. Vui lòng đăng nhập lại.")
    except jwt.PyJWTError:
        raise exceptions.AuthenticationFailed("Refresh token không hợp lệ.")

    if payload.get("token_type") != "refresh":
        raise exceptions.AuthenticationFailed("Loại token không hợp lệ, yêu cầu refresh token.")

    user_id = payload.get("user_id")
    try:
        user = User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        raise exceptions.AuthenticationFailed("Người dùng không tồn tại hoặc đã bị khóa.")

    return user

class JWTAuthentication(authentication.BaseAuthentication):
    """
    Xác thực Authorization: Bearer <access_token>
    """
    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()
        if not auth_header:
            return None

        if len(auth_header) == 1:
            raise exceptions.AuthenticationFailed("Header Authorization không hợp lệ. Thiếu token.")
        elif len(auth_header) > 2:
            raise exceptions.AuthenticationFailed("Header Authorization chứa khoảng trắng dư thừa.")

        prefix = auth_header[0].decode("utf-8")
        if prefix.lower() != self.keyword.lower():
            return None

        token_str = auth_header[1].decode("utf-8")
        return self.authenticate_credentials(token_str)

    def authenticate_credentials(self, token_str):
        try:
            payload = jwt.decode(token_str, settings.SECRET_KEY, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Phiên làm việc (JWT) đã hết hạn. Vui lòng làm mới token hoặc đăng nhập lại.")
        except jwt.PyJWTError:
            raise exceptions.AuthenticationFailed("Mã xác thực JWT không hợp lệ.")

        if payload.get("token_type") != "access":
            raise exceptions.AuthenticationFailed("Mã xác thực phải là Access Token.")

        user_id = payload.get("user_id")
        if not user_id:
            raise exceptions.AuthenticationFailed("Payload JWT không chứa định danh người dùng.")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed("Người dùng trong phiên không tồn tại.")

        if not user.is_active:
            raise exceptions.AuthenticationFailed("Tài khoản người dùng đã bị khóa.")

        return (user, token_str)

    def authenticate_header(self, request):
        return self.keyword
