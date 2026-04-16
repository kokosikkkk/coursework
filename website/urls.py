from django.urls import path
from .views import LoginUser, WelcomeWebsite, about, RegisterUser, show_tasks, is_complete, not_completed, delete

urlpatterns = [
    path('',WelcomeWebsite.as_view(), name='welcome'),
    path('about/', about, name='about'),
    path('register/',  RegisterUser.as_view(), name='register'), 
    path('login/', LoginUser.as_view() , name='login'),
    path('tasks/', show_tasks, name='tasks'),
    path('complete/<int:task_id>/', is_complete, name='complete'),
    path('not-complite/<int:task_id>/', not_completed, name='not_complete'),
    path('delite/<int:task_id>/', delete, name='delete'),
]
