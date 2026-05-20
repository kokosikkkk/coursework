let barChart = null;
let lineChart = null;
let currentMode = 'tasks';
let currentFilter = 'all';


function formatTime(seconds){
    if(!seconds) return '0 сек';
    let sec=  seconds %  60;
    let minutes = Math.floor(seconds/60);
    let hours = Math.floor(minutes/60);
    if (minutes > 0){
        return minutes + 'мин' + sec+ 'сек';
    }
    if (hours > 0){
        return hours + 'ч' + minutes + 'мин' + sec + 'сек';

    }
    return sec + 'сек';
}

function fetchFilteredData(callback){
    const url = `/statistics/data/?task_type=${currentFilter}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        window.statisticLabels = data.dates;
        window.statisticData = data.count_comp_tasks;
        window.statisticTime = data.time;
        if (callback) callback();
    })
    .catch(error => {
        console.error('Ошибка при загрузки данных:', error);
    });
}
function createBarChart(data, label, color, yTitle, isTime=false){
    let canvas = document.getElementById('barChart');
    let ctx = canvas.getContext('2d');

    if (barChart){
        barChart.destroy();
    }
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: window.statisticLabels,      
            datasets: [{
                label: label,
                data: data,
                backgroundColor: color,
                borderColor: '#2c2a29',
                borderWidth: 1
            }]
        },
        options: {
            scales:{
                y:{
                    beginAtZero: true,
                    title: {display:true, text: yTitle}
                }
            },
            
            plugins:{
                tooltip: {
                    callbacks:{
                        label: function(context){
                            let value = context.raw;
                            if (isTime){
                                return formatTime(value);
                            }
                            return value + ' задач';
                        }
                    }
                }
            }
        }
    });
}

function createLineChart(){
    let canvas = document.getElementById('lineChart');
    let ctx = canvas.getContext('2d');

    if (lineChart){
        lineChart.destroy();
    }

    let maxTasks = Math.max(...window.statisticData);
    let maxIndex = window.statisticData.indexOf(maxTasks);
    let productiveDayText = window.statisticLabels[maxIndex] || '-';
    let productiveDay = document.getElementById('productiveDay');
    
    if (productiveDay){
        productiveDay.textContent = productiveDayText;
    }

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: window.statisticLabels,      
            datasets: [{
                label: 'Выполненные задачи',
                data: window.statisticData,
                backgroundColor: 'rgba(44, 42, 41, 0.05)',
                borderColor: '#2c2a29',
                borderWidth: 2.5,
                fill: true,
                tension: 0.2,
                pointRadius: 5,
                pointBackgroundColor: '#2c2a29',
                pointBorderColor: 'white',
                pointBorderWidth: 2
            },
            {
                label: 'Затраченное время',
                data: window.statisticTime,
                backgroundColor: 'rgba(192, 106, 92, 0.05)',
                borderColor: '#c06a5c',
                borderWidth: 2.5,
                fill: true,
                tension: 0.2,
                pointRadius: 5,
                pointBackgroundColor: '#c06a5c',
                pointBorderColor: 'white',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales:{
                y:{
                    beginAtZero: true,
                    title: {display: true, text: 'Задачи (шт) / время (сек)'}
                },
                x: {
                    title: { display:true, text: 'Дата'}
                }
            },
            plugins:{
                tooltip: {
                    callbacks:{
                        label: function(context){
                            let value = context.raw;
                            let label = context.dataset.label || '';
                            if (label.includes('время')){
                                return label + ': ' + formatTime(value);
                            }
                            return label + ': ' + value + ' задач';
                        }
                    }
                }
            }
        }
    });
}
function updateAllCharts(){
    if (currentMode == "tasks"){
        createBarChart(window.statisticData, 'Выполненные задачи', 'rgba(44, 42, 41, 0.7)', 'Количество задач', false);
    }else{
        createBarChart(window.statisticTime, 'Затраченное время', 'rgba(192, 106, 92, 0.5)', 'Секунды', true);
    }
    createLineChart();
}
document.addEventListener('DOMContentLoaded', function(){
    updateAllCharts();
    
    document.getElementById('showTasks').addEventListener('click', function(){
        currentMode = 'tasks';
        updateAllCharts();
        this.classList.add('active');
        document.getElementById('showTime').classList.remove('active');

    });
    document.getElementById('showTime').addEventListener('click', function() {
        currentMode = 'time';
        updateAllCharts();
        this.classList.add('active')
        document.getElementById('showTasks').classList.remove('active');
    });
    document.getElementById('taskTypeFilter').addEventListener('change', function() {
        currentFilter = this.value;
        fetchFilteredData(function() {
            updateAllCharts();
        });
    });
});

