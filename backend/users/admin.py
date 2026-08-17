from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.http import HttpResponse
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
import csv
from .models import CustomUser, LoginHistory


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_admin_badge', 'is_active_badge', 'report_count', 'last_login', 'created_at')
    list_filter = ('is_admin', 'is_active', 'created_at')
    search_fields = ('username', 'email')
    ordering = ('-created_at',)
    actions = ['make_admin', 'remove_admin', 'deactivate_users', 'activate_users', 'export_users_csv']
    list_per_page = 25

    fieldsets = UserAdmin.fieldsets + (
        ('ScamAlert Info', {
            'fields': ('is_admin', 'created_at'),
        }),
    )
    readonly_fields = ('created_at', 'last_login', 'date_joined', 'report_count_display')

    def is_admin_badge(self, obj):
        if obj.is_admin:
            return format_html('<span style="background:#E03535;color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">ADMIN</span>')
        return format_html('<span style="color:#9ca3af;">User</span>')
    is_admin_badge.short_description = 'Role'

    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color:#22c55e;font-weight:600;">● Active</span>')
        return format_html('<span style="color:#ef4444;font-weight:600;">● Banned</span>')
    is_active_badge.short_description = 'Status'

    def report_count(self, obj):
        count = obj.reports.count()
        return format_html('<span style="font-weight:600;">{}</span>', count)
    report_count.short_description = 'Reports'

    def report_count_display(self, obj):
        return obj.reports.count()
    report_count_display.short_description = 'Total Reports Submitted'

    @admin.action(description='🔑 Make selected users admin')
    def make_admin(self, request, queryset):
        updated = queryset.update(is_admin=True, is_staff=True)
        self.message_user(request, f'{updated} user(s) promoted to admin.')

    @admin.action(description='👤 Remove admin from selected users')
    def remove_admin(self, request, queryset):
        updated = queryset.update(is_admin=False, is_staff=False)
        self.message_user(request, f'{updated} user(s) removed from admin.')

    @admin.action(description='🚫 Ban (deactivate) selected users')
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} user(s) banned.')

    @admin.action(description='✅ Unban (activate) selected users')
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user(s) activated.')

    @admin.action(description='📥 Export selected users as CSV')
    def export_users_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Username', 'Email', 'Is Admin', 'Is Active', 'Reports', 'Joined'])
        for u in queryset:
            writer.writerow([
                u.id, u.username, u.email,
                u.is_admin, u.is_active,
                u.reports.count(),
                u.created_at.strftime('%Y-%m-%d'),
            ])
        return response


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ('email', 'username_display', 'status_badge', 'ip_address', 'browser_display', 'timestamp')
    list_filter = ('status', 'timestamp')
    search_fields = ('email', 'ip_address', 'user__username')
    readonly_fields = ('user', 'email', 'ip_address', 'user_agent', 'status', 'timestamp')
    ordering = ('-timestamp',)
    list_per_page = 30

    def has_add_permission(self, request):
        return False  # Login history is read-only

    def has_change_permission(self, request, obj=None):
        return False  # Cannot edit login history

    def username_display(self, obj):
        if obj.user:
            return obj.user.username
        return format_html('<span style="color:#9ca3af;">Unknown</span>')
    username_display.short_description = 'Username'

    def status_badge(self, obj):
        if obj.status == 'success':
            return format_html('<span style="background:#22c55e;color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">✓ SUCCESS</span>')
        return format_html('<span style="background:#ef4444;color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">✗ FAILED</span>')
    status_badge.short_description = 'Status'

    def browser_display(self, obj):
        agent = obj.user_agent or ''
        if 'Chrome' in agent:
            return '🌐 Chrome'
        elif 'Firefox' in agent:
            return '🦊 Firefox'
        elif 'Safari' in agent:
            return '🧭 Safari'
        elif 'Edge' in agent:
            return '🌀 Edge'
        return '❓ Unknown'
    browser_display.short_description = 'Browser'
