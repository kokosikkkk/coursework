from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class ToDoList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task_name = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    status = models.BooleanField(default=False)
    dead_line = models.DateField(null=True, blank=True)
    spent_time = models.IntegerField(default=0, verbose_name="секунды")