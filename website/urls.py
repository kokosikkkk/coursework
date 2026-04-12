from django.urls import path
from .views import LoginUser, WelcomeWebsite, about, RegisterUser

urlpatterns = [
    path('',WelcomeWebsite.as_view(), name='welcome'),
    path('about/', about, name='about'),
    path('register/',  RegisterUser.as_view(), name='register'), 
    path('login/', LoginUser.as_view() , name='login'),
]
