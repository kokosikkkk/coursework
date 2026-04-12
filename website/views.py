from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound
from django.urls import reverse_lazy
from django.views.generic import CreateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import RegisterForm
from django.contrib.auth.views import LoginView


# Create your views here.
class WelcomeWebsite(TemplateView):
    template_name = "website/welcome.html"

def pageNotFound(request, exeption):
    return HttpResponseNotFound('<h1>Страница не найдена</h1>')

def about(request):
    return render(request, 'website/about.html')

#def login(request):
 #   return HttpResponse("Страница входа")

def register(request):
    return HttpResponse("Страница регистрации")

class DataMixin:
    def get_user_context(self, title = None,**kwargs):
        context = {}
        if title:
            context["title"] = title
        return context

class RegisterUser(DataMixin, CreateView):
    form_class = RegisterForm
    template_name = 'website/register.html'
    success_url = reverse_lazy('login')

    def get_context_data(self, object_list = None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title="Регистрация")
        return dict(list(context.items()) + list(c_def.items()))
    
class LoginUser(DataMixin, LoginView):
    form_class = AuthenticationForm
    template_name = 'website/login.html'
    
    def get_context_data(self, object_list = None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title="Авторизация")
        return dict(list(context.items()) + list(c_def.items()))
    
    