from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny
from apps.users.auth_backend import CookieJWTAuthentication
from .models import Departments
from .serializers import DepartmentSerializer

class DepartmentListCreateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()] 
    def get(self, request):
        departments = Departments.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        permission_classes = [IsAuthenticated]
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DepartmentRetrieveUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Departments.objects.get(pk=pk)
        except Departments.DoesNotExist:
            return None

    def get(self, request, pk):
        department = self.get_object(pk)
        if not department:
            return Response({"detail": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DepartmentSerializer(department)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        department = self.get_object(pk)
        if not department:
            return Response({"detail": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DepartmentSerializer(department, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        department = self.get_object(pk)
        if not department:
            return Response({"detail": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DepartmentSerializer(department, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk):
        department = self.get_object(pk)
        count=Departments.objects.count()
        if not department:
            return Response({"detail": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        if count<2:
            return Response({"detail":" department deletion is forbidden"},status=status.HTTP_403_FORBIDDEN)
        department.delete()
        return Response({"detail": "Department deleted"}, status=status.HTTP_204_NO_CONTENT)