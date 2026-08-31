from django.contrib import admin
from .models import DigitalCertificate

@admin.register(DigitalCertificate)
class DigitalCertificateAdmin(admin.ModelAdmin):
    list_display = ("certificate_code", "student", "course", "final_score", "issued_at", "is_revoked")
    list_filter = ("is_revoked", "course")
    search_fields = ("certificate_code", "student__full_name", "student__username", "blockchain_hash")
