from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.users.auth_backend import CookieJWTAuthentication
from .models import Services
from .serializers import ServiceSerializer
from apps.users.models import User
from apps.teams.models import Teams
class ServiceAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, pk=None, *args, **kwargs):
        cur_user = request.user

        if pk:
            try:
                service = Services.objects.get(pk=pk)
            except Services.DoesNotExist:
                return Response({"detail": "Service not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ServiceSerializer(service)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Role-based filtering
        if cur_user.role == "admin":
            services = Services.objects.filter(department=cur_user.department)
        elif cur_user.role == "teamLeader":
            services = Services.objects.filter(teams=cur_user.team)
        elif cur_user.role == "user":
            services = Services.objects.filter(users=cur_user)
        else:
            services = Services.objects.all()

        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, pk=None, *args, **kwargs):
        try:
            service = Services.objects.get(pk=pk)
        except Services.DoesNotExist:
            return Response({"detail": "Service not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ServiceSerializer(service, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk=None, *args, **kwargs):
        try:
            service = Services.objects.get(pk=pk)
        except Services.DoesNotExist:
            return Response({"detail": "Service not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ServiceSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None, *args, **kwargs):
        try:
            service = Services.objects.get(pk=pk)
        except Services.DoesNotExist:
            return Response({"detail": "Service not found."}, status=status.HTTP_404_NOT_FOUND)

        service.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class AssignServicesAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        service_ids = request.data.get("service_ids", [])
        team_id = request.data.get("team_id")
        user_id = request.data.get("user_id")
        if not service_ids:
            return Response({"detail": "service_ids list is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not team_id and not user_id:
            return Response({"detail": "Provide either team_id or user_id."}, status=status.HTTP_400_BAD_REQUEST)

        updated_services = []

        services = Services.objects.filter(id__in=service_ids)

        if team_id:
            try:
                team = Teams.objects.get(id=team_id)
            except Teams.DoesNotExist:
                return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        for service in services:
            if team_id:
                service.teams.add(team)
            if user_id:
                service.users.add(user)
            updated_services.append(service)

        serializer = ServiceSerializer(updated_services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    patch = put 

class RemoveServicesAPIView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        service_ids = request.data.get("service_ids", [])
        team_id = request.data.get("team_id")
        user_id = request.data.get("user_id")

        if not service_ids:
            return Response({"detail": "service_ids list is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not team_id and not user_id:
            return Response({"detail": "Provide either team_id or user_id."}, status=status.HTTP_400_BAD_REQUEST)

        updated_services = []
        services = Services.objects.filter(id__in=service_ids)

        team = None
        user = None

        if team_id:
            try:
                team = Teams.objects.get(id=team_id)
            except Teams.DoesNotExist:
                return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        for service in services:
            if team:
                service.teams.remove(team)
                team_users = User.objects.filter(team=team)
                for member in team_users:
                    service.users.remove(member)
            if user:
                service.users.remove(user)
            updated_services.append(service)

        serializer = ServiceSerializer(updated_services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    patch = put

