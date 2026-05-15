from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import redirect, render
from django.http import HttpResponse, HttpResponseNotFound
from django.urls import reverse_lazy
from django.views.generic import CreateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import RegisterForm
from django.contrib.auth.views import LoginView
from .models import ToDoList
from django.http import JsonResponse
import json
from django.contrib.auth import logout
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from .forms import ChangeUsernameForm
from django.contrib.auth import login

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
    success_url = reverse_lazy('profile')

    def form_valid(self, form):
        user =form.save()
        login(self.request, user)
        messages.success(self.request, f'Добро пожаловать, {user.username}!')
        return redirect(self.success_url)
    

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
    
def show_tasks(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            name = request.POST.get('name')
            if name:
                deadline = request.POST.get('deadline') or None
                ToDoList.objects.create(
                    user = request.user,
                    task_name = name,
                    status = False,
                    dead_line = deadline
                )
            return redirect('tasks') #перенаправление на ту же страницу
        else:
            tasks = ToDoList.objects.filter(user=request.user).order_by('dead_line')
            tasks = sorted(tasks, key=lambda t: (t.dead_line is None, t.dead_line)) #задачи без даты убираем вниз
            return render(request, 'website/table.html', {'tasks': tasks})
    else:
        return render(request, 'welcome.html')
    
def is_complete(request, task_id):
    task = ToDoList.objects.get(id=task_id, user=request.user)
    task.status = True
    task.save()
    return redirect('tasks')

def not_completed(request, task_id):
    task = ToDoList.objects.get(id=task_id, user=request.user)
    task.status = False
    task.save()
    return redirect('tasks')

def delete_task(request, task_id):
    if request.method == 'POST':
        task = ToDoList.objects.get(id=task_id, user=request.user)
        task.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'succes': False})

def toggle_status(request, task_id):
    if request.method == 'POST':
        task = ToDoList.objects.get(id=task_id, user=request.user)
        data = json.loads(request.body)
        task.status = data.get('status', False)
        task.save()
        return JsonResponse({'success': True})
    return JsonResponse({'succes': False})
def edit_task(request, task_id):
    if request.method == 'POST':
        task = ToDoList.objects.get(id=task_id, user=request.user)
        data = json.loads(request.body)
        task.task_name = data.get('name', task.task_name)
        task.save()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False})
    
def timer_page(request):
    return render(request, 'website/timer.html')

def task_time(request, task_id):
    if request.method == 'POST':
        try:
            task = ToDoList.objects.get(id=task_id, user=request.user)
            data = json.loads(request.body)
            sec = data.get('seconds', 0)
            task.spent_time += sec
            task.save()
            return JsonResponse({'success': True, 'total_time': task.spent_time})
        except ToDoList.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Task not found'})
    return JsonResponse({'success': False, 'error': 'Invalid method'})

def statistics_page(request):
    if not request.user.is_authenticated:
        return redirect('login')
    tasks= ToDoList.objects.filter(user=request.user)
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status=True).count()

    if total_tasks > 0:
        percent = round(completed_tasks / total_tasks * 100)
    else:
        percent = 0
    return render(request, 'website/statistics.html',{
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'percent': percent,
    })

def profile_page(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'website/profile.html')

def exit(request):
    logout(request)
    return redirect('welcome')

def password_change(request):
    if request.method == 'POST':
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, request.user)
            messages.success(request, 'Успешная смена пароля.')
            return redirect('profile')
    else:
        form = PasswordChangeForm(user=request.user)
    return render(request, 'password_change.html', {'form':form})
def username_change(request):
    if not request.user.is_authenticated:
        return redirect('login')
    if request.method == 'POST':
        form = ChangeUsernameForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Имя пользователя успешно изменено.')
            return redirect('profile')
    else:
        form = ChangeUsernameForm(instance=request.user)
    return render(request, 'website/username_change.html', {'form': form})

def test_base(request):
    return render(request, 'website/test_base.html')