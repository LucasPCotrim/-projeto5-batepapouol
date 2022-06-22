// -------------------------------- Global Variables --------------------------------
let username;
let typed_username;
const participants_url = 'https://mock-api.driven.com.br/api/v6/uol/participants ';
const status_url = 'https://mock-api.driven.com.br/api/v6/uol/status';
let ping_time_interval;

let DOM_entry_screen = document.querySelector('.entry_screen');
let DOM_username_input = document.querySelector('.entry_screen input');
let DOM_invalid_user_name_popup = document.querySelector('.invalid_username_popup');
let DOM_loading_screen = document.querySelector('.loading_screen');
let DOM_page_content = document.querySelector('.page_content');


// -------------------------------- Functions --------------------------------
function SERVER_process_username_answer(answer) {

    if(answer.status == 200){
        console.log('status == 200');
        username = typed_username;
        start_ping_server_interval();
        DOM_entry_screen.classList.toggle('hidden');
        DOM_loading_screen.classList.toggle('hidden');
        setTimeout(function(){ DOM_loading_screen.classList.toggle('hidden');
                               DOM_page_content.classList.toggle('hidden');}, 2000);
    }
    else{
        console.log('status != 200');
        return;
    }
}
function SERVER_process_username_error(error){
    if (error.response.status == 400){
        console.log('status == 400');
        console.log('This Username is already taken');
        DOM_invalid_user_name_popup.style.opacity = 0.6;
        DOM_invalid_user_name_popup.innerHTML = "Nome já está em uso! Digite outro";
        setTimeout(function(){ DOM_invalid_user_name_popup.style.opacity = 0;
                               DOM_invalid_user_name_popup.innerHTML = ""; }, 2000);
    }
}
function log_in(){
    typed_username = DOM_username_input.value;
    DOM_username_input.value = '';
    
    if (typed_username.trim().length === 0 || !String(typed_username)){
        console.log('Please insert a valid name');
        DOM_invalid_user_name_popup.style.opacity = 0.6;
        DOM_invalid_user_name_popup.innerHTML = "Insira um nome de usuário válido"
        setTimeout(function(){ DOM_invalid_user_name_popup.style.opacity = 0;
                               DOM_invalid_user_name_popup.innerHTML = ""; }, 2000);
    }
    else {
        DOM_invalid_user_name_popup.style.opacity = 0;
        DOM_invalid_user_name_popup.innerHTML = "";

        const SERVER_user_name_sent_promise = axios({
                                                method: 'post',
                                                url: participants_url,
                                                data: {
                                                  name: typed_username,
                                                }
                                              });
        SERVER_user_name_sent_promise.then(SERVER_process_username_answer)
                                     .catch(SERVER_process_username_error);
    }

}

function start_ping_server_interval(){
    ping_time_interval = setInterval(function () {
                                        axios({
                                            method: 'post',
                                            url: status_url,
                                            data: {
                                            name: username,
                                            }
                                        });
                                        console.log('ping')
                                     }, 5000);
}








// -------------------------------- Main --------------------------------