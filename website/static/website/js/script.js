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