// -------------------------------- Global Variables --------------------------------
let username;
let typed_username;
let visibility_mode;
let recipient_user;
let messages_array;
const participants_url = 'https://mock-api.driven.com.br/api/v6/uol/participants ';
const status_url = 'https://mock-api.driven.com.br/api/v6/uol/status';
const messages_url = 'http://mock-api.driven.com.br/api/v6/uol/messages/';
const visibility_options = ['Público', 'Reservadamente'];
const user_options = ['Todos', 'João', 'Maria'];
let ping_time_interval;


let DOM_entry_screen = document.querySelector('.entry_screen');
let DOM_username_input = document.querySelector('.entry_screen input');
let DOM_invalid_user_name_popup = document.querySelector('.invalid_username_popup');
let DOM_loading_screen = document.querySelector('.loading_screen');
let DOM_page_content = document.querySelector('.page_content');
let DOM_top_menu = document.querySelector('.top_menu');
let DOM_message_container = document.querySelector('.message_container');
let DOM_side_menu = document.querySelector('.side_menu');
let DOM_shaded_screen = document.querySelector('.shaded_screen');
let DOM_visibility_menu = document.querySelector('.visibility_menu');
let DOM_user_menu = document.querySelector('.user_menu');


// -------------------------------- Functions --------------------------------
function SERVER_process_username_answer(answer) {

    if(answer.status == 200){
        username = typed_username;
        start_ping_server_interval();
        fetch_messages_from_server();
        DOM_entry_screen.classList.toggle('hidden');
        DOM_loading_screen.classList.toggle('hidden');
        setTimeout(function(){ DOM_loading_screen.classList.toggle('hidden');
                               DOM_page_content.classList.toggle('hidden');}, 2000);
    }
    else{
        return;
    }
}
function SERVER_process_username_error(error){
    if (error.response.status == 400){
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


function move_side_menu(mode) {
    if (mode == 'show'){
        DOM_side_menu.style.right = 0;
    }
    else if (mode == 'hide'){
        DOM_side_menu.style.right = "-259px";
        
    }
    DOM_shaded_screen.classList.toggle('hidden');
}


function change_visibility(i) {
    const DOM_visibility_options = DOM_visibility_menu.querySelectorAll('.option');
    for (let j = 0; j < DOM_visibility_options.length; j++) {
        DOM_visibility_options[j].querySelector('.option_content').innerHTML = `<p>${visibility_options[j]}</p>`;
    }
    DOM_visibility_options[i].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
    visibility_mode = visibility_options[i];
}


function change_user(i){
    const DOM_user_options = DOM_user_menu.querySelectorAll('.option');
    for (let j = 0; j < DOM_user_options.length; j++) {
        DOM_user_options[j].querySelector('.option_content').innerHTML = `<p>${user_options[j]}</p>`;
    }
    DOM_user_options[i].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
    recipient_user = user_options[i];
}









function SERVER_process_fetch_messages_answer(answer) {
    console.log(answer);
    //messages_array = answer.data;
}
function fetch_messages_from_server(){
    const SERVER_fetch_messages_promise = axios({
                                            method: 'get',
                                            url: messages_url,
                                            headers: {                  
                                                "Access-Control-Allow-Origin": "*",
                                                "Access-Control-Allow-Headers": "Authorization", 
                                                "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE" ,
                                                "Content-Type": "application/json;charset=UTF-8"                   
                                            }
                                          })
    console.log('SERVER_fetch_messages_promise', SERVER_fetch_messages_promise);
    SERVER_fetch_messages_promise.then(SERVER_process_fetch_messages_answer);
}


// -------------------------------- Main --------------------------------