from django.contrib import admin
from .models import ToDoList
from .models import Subject
# Register your models here.

admin.site.register(ToDoList)
admin.site.register(Subject)

