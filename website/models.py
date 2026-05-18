from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.
class ToDoList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task_name = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    status = models.BooleanField(default=False)
    dead_line = models.DateField(null=True, blank=True)
    spent_time = models.IntegerField(default=0, verbose_name="секунды")
    created_at = models.DateTimeField(auto_now_add=True)
    updates_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null= True, blank=True)

    def get_time(self):
        all_time = self.spent_time
        seconds = all_time % 60
        minutes = (all_time % 3600) // 60
        hours = all_time//3600
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    
    def save( self, *args, **kwargs):
        if self.status and not self.completed_at:
            self.comleted_at = timezone.now()
        elif not self.status and self.completed_at:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.task_name