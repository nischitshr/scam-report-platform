from django_filters import rest_framework as filters
from django.db.models import Q
from .models import ScamReport

class ScamReportFilter(filters.FilterSet):
    scam_type = filters.CharFilter(field_name='scam_type', lookup_expr='iexact')
    status = filters.CharFilter(field_name='status', lookup_expr='iexact')
    search = filters.CharFilter(method='filter_by_search')

    class Meta:
        model = ScamReport
        fields = ['scam_type', 'status']

    def filter_by_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) | Q(description__icontains=value)
        )
