from django.contrib import admin
from django.utils.html import format_html
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Count
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta
import csv
from .models import ScamReport, ScamFile


class ScamFileInline(admin.TabularInline):
    model = ScamFile
    extra = 0
    readonly_fields = ('file_url', 'file_name', 'file_size_display', 'uploaded_at')
    fields = ('file_url', 'file_name', 'file_size_display', 'uploaded_at')

    def file_size_display(self, obj):
        if obj.file_size:
            if obj.file_size > 1024 * 1024:
                return f"{obj.file_size / (1024*1024):.1f} MB"
            return f"{obj.file_size / 1024:.0f} KB"
        return "—"
    file_size_display.short_description = 'File Size'


def send_report_email(report, action):
    """Send email notification to user when their report is approved or rejected."""
    if not report.user or not report.user.email:
        return

    subject_map = {
        'approved': f'✅ Your scam report has been approved — ScamAlert',
        'rejected': f'❌ Your scam report was not approved — ScamAlert',
    }

    message_map = {
        'approved': f"""
Hi {report.user.username},

Great news! Your scam report titled "{report.title}" has been reviewed and approved.

It is now live on ScamAlert and helping protect others in the community.

View your report: {settings.FRONTEND_URL}/reports/{report.id}

Thank you for helping keep our community safe!

— The ScamAlert Team
        """,
        'rejected': f"""
Hi {report.user.username},

Thank you for submitting a report to ScamAlert.

Unfortunately, your report titled "{report.title}" did not meet our publishing guidelines and has not been approved.

This may be because:
- The report lacked sufficient detail
- The content could not be verified
- It did not match our scam categories

You are welcome to submit a new report with more details.

— The ScamAlert Team
        """,
    }

    try:
        send_mail(
            subject=subject_map[action],
            message=message_map[action].strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[report.user.email],
            fail_silently=True,
        )
    except Exception:
        pass


@admin.register(ScamReport)
class ScamReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'scam_type_badge', 'submitted_by_user', 'status_badge', 'report_count', 'has_evidence', 'created_at')
    list_filter = ('status', 'scam_type', 'created_at')
    search_fields = ('title', 'description', 'contact_used', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'report_count', 'evidence_preview', 'submitted_by_user')
    ordering = ('-created_at',)
    inlines = [ScamFileInline]
    actions = ['approve_reports', 'reject_reports', 'export_as_csv']
    list_per_page = 20

    fieldsets = (
        ('📋 Report Info', {
            'fields': ('title', 'scam_type', 'description', 'contact_used')
        }),
        ('📊 Status', {
            'fields': ('status', 'report_count')
        }),
        ('🖼 Evidence', {
            'fields': ('evidence_file', 'evidence_preview')
        }),
        ('👤 Submitted By', {
            'fields': ('user', 'submitted_by_user', 'created_at', 'updated_at'),
        }),
    )

    def submitted_by_user(self, obj):
        if obj.user:
            return format_html(
                '<span style="font-weight:600;">{}</span><br><small style="color:#888;">{}</small>',
                obj.user.username, obj.user.email
            )
        return '—'
    submitted_by_user.short_description = 'Submitted By'

    def scam_type_badge(self, obj):
        colors = {
            'phishing': '#ef4444',
            'fake_job': '#3b82f6',
            'catfish': '#ec4899',
            'investment': '#f97316',
            'shopping': '#8b5cf6',
            'tech_support': '#eab308',
            'other': '#6b7280',
        }
        color = colors.get(obj.scam_type, '#6b7280')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.get_scam_type_display()
        )
    scam_type_badge.short_description = 'Type'

    def status_badge(self, obj):
        colors = {'pending': '#f59e0b', 'approved': '#22c55e', 'rejected': '#ef4444'}
        icons = {'pending': '⏳', 'approved': '✅', 'rejected': '❌'}
        color = colors.get(obj.status, '#gray')
        icon = icons.get(obj.status, '')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">{} {}</span>',
            color, icon, obj.status.upper()
        )
    status_badge.short_description = 'Status'

    def has_evidence(self, obj):
        if obj.evidence_file:
            return True
        return False
    has_evidence.short_description = 'Evidence'
    has_evidence.boolean = True

    def evidence_preview(self, obj):
        if obj.evidence_file:
            if obj.evidence_file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                return format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-height:200px;max-width:400px;border-radius:8px;border:1px solid #e5e7eb;" /></a>',
                    obj.evidence_file, obj.evidence_file
                )
            return format_html('<a href="{}" target="_blank" style="color:#E03535;">📄 View Document</a>', obj.evidence_file)
        return '—'
    evidence_preview.short_description = 'Evidence Preview'

    @admin.action(description='✅ Approve selected reports and notify users')
    def approve_reports(self, request, queryset):
        pending = queryset.filter(status='pending')
        count = 0
        for report in pending:
            report.status = 'approved'
            report.save()
            send_report_email(report, 'approved')
            count += 1
        self.message_user(request, f'✅ {count} report(s) approved and users notified by email.')

    @admin.action(description='❌ Reject selected reports and notify users')
    def reject_reports(self, request, queryset):
        pending = queryset.filter(status='pending')
        count = 0
        for report in pending:
            report.status = 'rejected'
            report.save()
            send_report_email(report, 'rejected')
            count += 1
        self.message_user(request, f'❌ {count} report(s) rejected and users notified by email.')

    @admin.action(description='📥 Export selected reports as CSV')
    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="scam_reports.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Title', 'Type', 'Status', 'Submitted By', 'Email', 'Contact Used', 'Created At'])
        for r in queryset:
            writer.writerow([
                r.id, r.title, r.scam_type, r.status,
                r.user.username if r.user else '',
                r.user.email if r.user else '',
                r.contact_used,
                r.created_at.strftime('%Y-%m-%d %H:%M'),
            ])
        return response


@admin.register(ScamFile)
class ScamFileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'report', 'file_size_display', 'uploaded_at')
    search_fields = ('file_name', 'report__title')
    readonly_fields = ('uploaded_at',)

    def file_size_display(self, obj):
        if obj.file_size > 1024 * 1024:
            return f"{obj.file_size / (1024*1024):.1f} MB"
        return f"{obj.file_size / 1024:.0f} KB"
    file_size_display.short_description = 'Size'
