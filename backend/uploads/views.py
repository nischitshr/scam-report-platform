from rest_framework import views, status, permissions
from rest_framework.response import Response
from .utils import upload_file_to_s3_or_local
import os

class FileUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({
                "success": False,
                "error": "file",
                "message": "No file uploaded"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        file_obj = request.FILES['file']
        
        # Max size: 5MB
        if file_obj.size > 5 * 1024 * 1024:
            return Response({
                "success": False,
                "error": "file",
                "message": "File size exceeds 5MB limit"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.pdf']:
            return Response({
                "success": False,
                "error": "file",
                "message": "File must be jpg, png, or pdf"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            file_url = upload_file_to_s3_or_local(file_obj)
            
            if file_url.startswith('/'):
                file_url = request.build_absolute_uri(file_url)
                
            return Response({
                "success": True,
                "data": {
                    "file_url": file_url,
                    "file_name": file_obj.name,
                    "file_size": file_obj.size
                },
                "message": "File uploaded successfully"
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "success": False,
                "error": "upload",
                "message": f"Upload failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
