document.querySelectorAll('.checkbox').forEach(checkbox =>{
    checkbox.addEventListener('change', function(){
        const task_id = this.dataset.id;
        const is_checked = this.checked;
    
        fetch(`/toggle/${task_id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'

            },
            body: JSON.stringify({ status: is_checked })
        }).then(response =>{
            if (response.ok){
                const task = this.nextElementSibling;
                if (task) {
                    task.classList.toggle('completed', is_checked );
                }
            }
        });
    });
});
function getCookie(name){
    let csrf= null;
    if (document.cookie && document.cookie !== ''){
        const cookies = document.cookie.split(';');
        for (let i = 0; i<cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')){
                csrf = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return csrf;
}
document.querySelectorAll('.edit').forEach(button =>{
    button.addEventListener('click', function() {
        const task_id = this.dataset.id;
        const task_element = this.closest('li').querySelector('.task')
        const task_text = task_element.innerText;
        const new_text = prompt("Редактировать:", task_text);
        if (new_text && new_text !== task_text){
            fetch(`/edit/${task_id}/`,{
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: new_text})
            }).then(response => {
                if (response.ok){
                    task_element.innerText = new_text;
                }
            });
        }
    });
});


document.querySelectorAll('.delete').forEach(button =>{
    button.addEventListener('click', function() {
        const task_id = this.dataset.id;
        if (confirm('Подтвердите удаление')){
            fetch(`/delete/${task_id}/`,{
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok){
                    this.closest('li').remove();
                }
            });
        }
    });
});

class Timer{
    constructor(mode, ifDone, display){
        this.mode = mode; //тип таймера
        this.ifDone = ifDone; //что делаем, если таймер закончился
        this.remainingSec = 0;
        this.intervalId = null;
        this.display = display;
    }
    set(remainingSec){  //запускаем таймер
        this.remainingSec = remainingSec;
        this.updateDisplay(); 

    }
    updateDisplay(){
        const hours = Math.floor(this.remainingSec / 3600);
        const minutes = Math.floor((this.remainingSec % 3600) / 60);
        const seconds = this.remainingSec % 60;
        this.display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2,'0')}`;
    }
    start(){
        if (this.intervalId) return;
        this.intervalId = setInterval(() => {
            if (this.remainingSec <= 0) {
                this.stop();
                if (this.ifDone){
                    this.ifDone();
                }
            } else{
                this.remainingSec--;
                this.updateDisplay();
            }
        }, 1000); //перевод в секунды
    }stop(){
        if (this.intervalId){
            clearInterval(this.intervalId)
            this.intervalId = null;
        }
    }
}
class TimerModal{
    constructor(modalId, hourId, minutId, secondId, displayId){
        this.modal = document.getElementById(modalId);
        this.hours = document.getElementById(hourId);
        this.minutes = document.getElementById(minutId);
        this.seconds = document.getElementById(secondId);
        this.display = document.getElementById(displayId);
        this.currentTask = null;
        this.currentTimer = null;
        this.init();
    }
    init(){
        const closebotton = this.modal.querySelector('.close');
        if (closebotton){
            closebotton.onclick = () => this.closeModal();
        }
    }
    openModal(taskId){
        this.currentTask = taskId;
        this.modal.style.display = 'flex';
        this.display.textContent ='00:00:00';
        this.hours.value=0;
        this.minutes.value = 0;
        this.seconds.value = 0;
        if (this.currentTimer) this.currentTimer.stop();
    }
    closeModal(){
        this.modal.style.display = 'none';
        if (this.currentTimer) this.currentTimer.stop();
        this.currentTimer = null;
    }
    startTimer(onComplete) {
        const hours = parseInt(this.hours.value) || 0;
        const minutes = parseInt(this.minutes.value) || 0;
        const seconds = parseInt(this.seconds.value) || 0;
        const total = hours * 3600 + minutes * 60 + seconds;

        if (total > 0){
            if (this.currentTimer) this.currentTimer.stop();
            const savedTotal = total;
            this.currentTimer = new Timer('simple', () => {
                if (onComplete) onComplete(this.currentTask, savedTotal);
                this.closeModal();
            }, this.display);
            this.currentTimer.set(total);
            this.currentTimer.start();
        } else {
            alert('add time');
        }
    }

}
document.addEventListener('DOMContentLoaded', () => {

    const modal = new TimerModal('timerModal', 'hours', 'minutes', 'seconds', 'modalTimer');

    document.querySelectorAll('.timer').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.openModal(btn.dataset.id);
        });
    });

    const startButton = document.querySelector('.starttimer');
    if (startButton) {
        startButton.addEventListener('click', () => {
            modal.startTimer((taskId, totalSeconds) => {
                fetch(`/task/${taskId}/time/`,{
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ seconds: totalSeconds})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success){
                        const newTime = document.getElementById(`time-${taskId}`);
                        if (newTime){
                            const allTime = data.total_time;
                            const seconds = allTime % 60;
                            const minutes = Math.floor((allTime % 3600) / 60);
                            const hours = Math.floor(allTime / 3600);
                            const formattedTime =`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                            newTime.querySelector('span').textContent = formattedTime;
                        }
                        alert(`Время успешно сохранено`);
                    } else {
                    alert(`Возникла ошибка при сохранении времени`);
                    }
                });
            });
        });
    }

    const pauseButton = document.querySelector('.pausetimer');
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            if (modal.currentTimer) modal.currentTimer.stop();
        });
    }

    const endButton = document.querySelector('.endtimer');
    if (endButton) {
        endButton.addEventListener('click', () => modal.closeModal());
    }


    const calendarBtn = document.getElementById('calendarBtn');
    const dateInp = document.getElementById('chooseDate')
    if (calendarBtn && dateInp ){
        const flatpick = flatpickr(dateInp, {
            dateFormat: "Y-m-d",
        });
        calendarBtn.addEventListener('click', () => {
            flatpick.open();
            
        });
    }
});

document.querySelectorAll('.subject-icon').forEach(icon =>{
    icon.addEventListener('click', function(e) {
        e.stopPropagation();
        const picker = this.closest('.subject-picker');
        const dropdown = picker.querySelector('.subject-dropdown');
        document.querySelectorAll('.subject-dropdown').forEach(d =>{
            if (d !== dropdown) d.style.display = 'none';
        });

        dropdown.style.display = dropdown.style.display === "none" ? 'block' : 'none';
    });
});
document.querySelectorAll('.subject-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', function(){
            const taskId = this.dataset.id;
            const newTaskType = this.value;
            const icon = this.closest('.subject-picker').querySelector('.subject-icon');
            fetch(`/task/${taskId}/set-type/`,{
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task_type: newTaskType})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success){
                    if(data.task_type_display){
                        icon.innerHTML = '📚 ' + data.task_type_display;
                    }else{
                        icon.innerHTML = '📚';
                    }
                }
            });
     
            this.style.display = 'none';
        });
        dropdown.addEventListener('blur', function(){
            setTimeout(() =>{
                this.style.display = 'none';

            }, 200);
        });
    });

    document.addEventListener('click', function(){
        if (!e.target.closest('.subject-picker')) {
            document.querySelectorAll('.subject-dropdown').forEach(d => {
                d.style.display = 'none';
        });
    }
    });


    
             
                