from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import ScamReport, ScamFile
from .serializers import ScamReportSerializer
from .filters import ScamReportFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from users.permissions import IsAdminUserOnly, IsOwnerOrAdmin
from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'per_page'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "success": True,
            "data": data,
            "pagination": {
                "page": self.page.number,
                "total_pages": self.page.paginator.num_pages,
                "total_items": self.page.paginator.count,
                "per_page": self.page_size
            }
        })

class ScamReportViewSet(viewsets.ModelViewSet):
    queryset = ScamReport.objects.all()
    serializer_class = ScamReportSerializer
    pagination_class = CustomPagination
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = ScamReportFilter
    ordering_fields = ['created_at', 'updated_at', 'report_count']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search', 'by_type']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsOwnerOrAdmin]
        elif self.action in ['destroy']:
            permission_classes = [IsAdminUserOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ['list', 'search', 'by_type']:
            return queryset.filter(status='approved')
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUserOnly])
    def pending(self, request):
        queryset = ScamReport.objects.filter(status='pending')
        # Allow searching pending list as well
        search_query = request.query_params.get('search', '')
        if search_query:
            queryset = queryset.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))
        
        # Allow filtering by type
        scam_type = request.query_params.get('scam_type', '')
        if scam_type:
            queryset = queryset.filter(scam_type__iexact=scam_type)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search(self, request):
        query = request.query_params.get('q', '')
        queryset = ScamReport.objects.filter(status='approved')
        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query))
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='type/(?P<scam_type>[^/.]+)', permission_classes=[permissions.AllowAny])
    def by_type(self, request, scam_type=None):
        queryset = ScamReport.objects.filter(status='approved', scam_type__iexact=scam_type)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class AdminReportActionView(views.APIView):
    permission_classes = [IsAdminUserOnly]

    def put(self, request, pk, action_type):
        try:
            report = ScamReport.objects.get(pk=pk)
        except ScamReport.DoesNotExist:
            return Response({
                "success": False,
                "error": "not_found",
                "message": "Report not found"
            }, status=status.HTTP_404_NOT_FOUND)

        if action_type == 'approve':
            report.status = 'approved'
            report.save()
            return Response({
                "success": True,
                "data": ScamReportSerializer(report).data,
                "message": "Report approved successfully"
            })
        elif action_type == 'reject':
            report.status = 'rejected'
            report.save()
            return Response({
                "success": True,
                "data": ScamReportSerializer(report).data,
                "message": "Report rejected successfully"
            })
        else:
            return Response({
                "success": False,
                "error": "invalid_action",
                "message": "Invalid admin action"
            }, status=status.HTTP_400_BAD_REQUEST)

class AdminStatsView(views.APIView):
    permission_classes = [IsAdminUserOnly]

    def get(self, request):
        pending_count = ScamReport.objects.filter(status='pending').count()
        approved_count = ScamReport.objects.filter(status='approved').count()
        rejected_count = ScamReport.objects.filter(status='rejected').count()
        total_count = ScamReport.objects.count()
        
        return Response({
            "success": True,
            "data": {
                "pending": pending_count,
                "approved": approved_count,
                "rejected": rejected_count,
                "total": total_count
            },
            "message": "Admin stats retrieved successfully"
        })
