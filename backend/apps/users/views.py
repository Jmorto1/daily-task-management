from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import UserDetailSerializer, UserCreateSerializer
from .auth_backend import CookieJWTAuthentication

User = get_user_model()

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone_number = request.data.get("phone_number")
        password = request.data.get("password")

        if not phone_number or not password:
            return Response(
                {"detail": "Phone number and password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, phone_number=phone_number, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        if user.status=="pending":
            return Response(
                {"detail": "pending"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        # Create response
        response = Response({
            "user": UserDetailSerializer(user).data,
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)

        # Store tokens in HttpOnly cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=3600,
            path='/',
        )
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Strict',
            max_age=7*24*3600,
            path='/',
        )
        return response
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        response = Response({"detail": "Logged out"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        user = request.user
        return Response(UserDetailSerializer(user).data)
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Try to get refresh token from cookie if not in body
        if 'refresh' not in request.data:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                request.data['refresh'] = refresh_token
        
        response = super().post(request, *args, **kwargs)
        
        if 'access' in response.data:
            response.set_cookie(
                key='access_token',
                value=response.data['access'],
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=3600,
                path='/',
            )
            
        return response
class UserCRUDView(APIView):
    authentication_classes = [CookieJWTAuthentication]

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()] 
        return [IsAuthenticated()] 
    def get(self, request):
        try:
            cur_user = request.user

            if cur_user.role == "sysAdmin":
                users = User.objects.exclude(id=cur_user.id)

            elif cur_user.role == "admin":
                users = User.objects.filter(department=cur_user.department).exclude(id=cur_user.id)

            elif cur_user.role == "teamLeader":
                users = User.objects.filter(team=cur_user.team).exclude(id=cur_user.id)

            else:
                return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

            serializer = UserDetailSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error in UserCRUDView.get:", e)
            return Response({"detail": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)
    def post(self,request):
        serializer=UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        errors = serializer.errors
        if "phone_number" in errors:
            return Response({
        "field": "phone_number",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
        return Response({
        "field": "",
        "errors": serializer.errors
    },status=status.HTTP_400_BAD_REQUEST)
    def put(self,request):
        user_id=request.data.get("id")
        if not user_id:
            return Response({"datail":"user id is required"},status=status.HTTP_400_BAD_REQUEST)
        user=get_object_or_404(User,id=user_id)
        serializer=UserDetailSerializer(user,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def patch(self,request):
        user_id=request.data.get("id")
        if not user_id:
            return Response({
        "field": "phone_number",
        "errors": serializer.errors
    },status=status.HTTP_400_BAD_REQUEST)
        user=get_object_or_404(User,id=user_id)
        serializer=UserDetailSerializer(user,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        errors = serializer.errors
        if "phone_number" in errors:
            return Response({
        "field": "phone_number",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request):
        user_id=request.data.get("id")
        if not user_id:
            return Response({"datail":"user id is required"},status=status.HTTP_400_BAD_REQUEST)
        user=get_object_or_404(User,id=user_id)
        user.delete()
        return Response(
            {"detail": "User deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

