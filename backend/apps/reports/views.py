from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Reports
from .serializers import ReportSerializer
from apps.users.auth_backend import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated
class ReportListCreateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self, user):
        if user.role == "admin":
            return Reports.objects.filter(user__department=user.department)
        elif user.role == "teamLeader":
            return Reports.objects.filter(user__team=user.team)
        elif user.role=="user":
            return Reports.objects.filter(user=user)
        return Reports.objects.all()

    def get(self, request):
        queryset = self.get_queryset(request.user)
        serializer = ReportSerializer()  # no data passed
        data = serializer.to_representation(queryset)  # call manually
        return Response(data, status=status.HTTP_200_OK)

    
    def post(self, request):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save()
            return Response(ReportSerializer(report).to_representation(report), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ReportDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Reports.objects.get(pk=pk)
        except Reports.DoesNotExist:
            return None
    def get(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReportSerializer(report, data=request.data)
        if serializer.is_valid():
            report = serializer.save()
            return Response(ReportSerializer(report).to_representation(report), status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            report = serializer.save()
            return Response(ReportSerializer(report).to_representation(report), status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        report = self.get_object(pk)
        if not report:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        report.delete()
        return Response({"detail": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
