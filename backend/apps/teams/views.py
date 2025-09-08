from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated,AllowAny
from apps.users.auth_backend import CookieJWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Teams
from .serializers import TeamSerializer
class TeamAPIView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]
    def get(self,request,pk=None,*args,**kwargs):
        department_id=request.query_params.get("department_id")
        if department_id:
            teams=Teams.objects.filter(department=department_id)
        elif pk:
            try:
                team = Teams.objects.get(pk=pk)
            except Teams.DoesNotExist:
                return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = TeamSerializer(team)  # many=False by default
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            teams=Teams.objects.all()
        serializer=TeamSerializer(teams,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    def post(self,request,*args,**kwargs):
        serializer=TeamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def put(self,request,pk=None,*args,**kwargs):
        try:
            team=Teams.objects.get(pk=pk)
        except Teams.DoesNotExist:
            return Response({"detail":"Team not found."},status=status.HTTP_404_NOT_FOUND)
        serializer=TeamSerializer(team,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def patch(self,request,pk=None,*args,**kwargs):
        try:
            team=Teams.objects.get(pk=pk)
        except Teams.DoesNotExist:
            return Response({"detail":"Team not found."},status=status.HTTP_404_NOT_FOUND)
        serializer=TeamSerializer(team,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,pk=None,*args,**kwargs):
        try:
            team=Teams.objects.get(pk=pk)
        except Teams.DoesNotExist:
            return Response({"detail":"Team not found."},status=status.HTTP_404_NOT_FOUND)
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


        