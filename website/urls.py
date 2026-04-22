from django.urls import path
from .views import LoginUser, WelcomeWebsite, about, RegisterUser, show_tasks, is_complete, not_completed, delete_task, toggle_status, edit_task

urlpatterns = [
    path('',WelcomeWebsite.as_view(), name='welcome'),
    path('about/', about, name='about'),
    path('register/',  RegisterUser.as_view(), name='register'), 
    path('login/', LoginUser.as_view() , name='login'),
    path('tasks/', show_tasks, name='tasks'),
    path('complete/<int:task_id>/', is_complete, name='complete'),
    path('not-complite/<int:task_id>/', not_completed, name='not_complete'),
    path('delete/<int:task_id>/', delete_task, name='delete'),
    path('toggle/<int:task_id>/', toggle_status, name= 'toggle_status' ),
    path('edit/<int:task_id>/', edit_task, name="edit_task"),
]
