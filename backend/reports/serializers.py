from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ScamReport, ScamFile

User = get_user_model()

class ScamFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScamFile
        fields = ('id', 'file_url', 'file_name', 'file_size', 'uploaded_at')

class ScamReportSerializer(serializers.ModelSerializer):
    submitted_by = serializers.CharField(source='user.username', read_only=True)
    files = ScamFileSerializer(many=True, read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)

    class Meta:
        model = ScamReport
        fields = (
            'id', 'user_id', 'title', 'description', 'scam_type', 'contact_used', 
            'status', 'created_at', 'updated_at', 'report_count', 
            'evidence_file', 'submitted_by', 'files'
        )
        read_only_fields = ('id', 'status', 'created_at', 'updated_at', 'report_count', 'user_id')

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters")
        if len(value) > 200:
            raise serializers.ValidationError("Title must be at most 200 characters")
        return value

    def validate_description(self, value):
        if len(value) < 20:
            raise serializers.ValidationError("Description must be at least 20 characters")
        if len(value) > 2000:
            raise serializers.ValidationError("Description must be at most 2000 characters")
        return value

    def validate_contact_used(self, value):
        if len(value) > 200:
            raise serializers.ValidationError("Contact information must be at most 200 characters")
        return value
