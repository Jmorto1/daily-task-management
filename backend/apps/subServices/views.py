from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.users.auth_backend import CookieJWTAuthentication
from .models import SubServices
from .serializers import SubServiceSerializer
class SubServiceAPIView(APIView):
    authentication_classes=[CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]
    def get(self,request,pk=None,*args,**kwargs):
        if pk:
            try:
                subService=SubServices.objects.get(pk=pk)

            except SubServices.DoesNotExist:
                return Response({"detail": "SubService not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = SubServiceSerializer(subService)
            return Response(serializer.data, status=status.HTTP_200_OK)
        subService=SubServices.objects.all()
        serializer=SubServiceSerializer(subService,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def post(self,request,*args,**kwargs):
        serializer=SubServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, pk=None, *args, **kwargs):
        try:
            subService = SubServices.objects.get(pk=pk)
        except SubServices.DoesNotExist:
            return Response({"detail": "SubService not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SubServiceSerializer(subService, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def patch(self, request, pk=None, *args, **kwargs):
        try:
            subService = SubServices.objects.get(pk=pk)
        except SubServices.DoesNotExist:
            return Response({"detail": "SubService not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SubServiceSerializer(subService, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None, *args, **kwargs):
        try:
            subService = SubServices.objects.get(pk=pk)
        except SubServices.DoesNotExist:
            return Response({"detail": "Service not found."}, status=status.HTTP_404_NOT_FOUND)

        subService.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
