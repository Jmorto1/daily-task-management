from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.users.auth_backend import CookieJWTAuthentication
from .models import Activities
from .serializers import ActivitySerializer
class ActivityAPIView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]
    def get(self,request,pk=None,*args,**kwargs):
        if pk:
            try:
                activity=Activities.objects.get(pk=pk)

            except Activities.DoesNotExist:
                return Response({"detail": "Activity not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ActivitySerializer(activity)
            return Response(serializer.data, status=status.HTTP_200_OK)
        activity=Activities.objects.all()
        serializer=ActivitySerializer(activity,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def post(self,request,*args,**kwargs):
        serializer=ActivitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, pk=None, *args, **kwargs):
        try:
            activity = Activities.objects.get(pk=pk)
        except Activities.DoesNotExist:
            return Response({"detail": "Activity not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActivitySerializer(activity, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def patch(self, request, pk=None, *args, **kwargs):
        try:
            activity = Activities.objects.get(pk=pk)
        except Activities.DoesNotExist:
            return Response({"detail": "Activity not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ActivitySerializer(activity, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None, *args, **kwargs):
        try:
            activity = Activities.objects.get(pk=pk)
        except Activities.DoesNotExist:
            return Response({"detail": "Service not found."}, status=status.HTTP_404_NOT_FOUND)

        activity.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
