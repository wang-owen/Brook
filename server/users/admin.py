from django.contrib import admin
from .models import User


# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "username",
        "email",
        "date_joined",
        "last_login",
        "is_superuser",
        "is_staff",
    ]


admin.site.register(User, UserAdmin)
