// -------------------------------- Global Variables --------------------------------


// API URLs
const participants_url = 'https://mock-api.driven.com.br/api/v6/uol/participants ';
const status_url = 'https://mock-api.driven.com.br/api/v6/uol/status';
const messages_url = 'https://mock-api.driven.com.br/api/v6/uol/messages/';

// State variables
let username;
let typed_username;
let visibility_mode;
let recipient_user;
let messages_array;
let participants_array;
let visibility_options;
let ping_time_interval;
let refresh_chat_time_interval;
let refresh_participants_time_interval;

// DOM elements
let DOM_entry_screen = document.querySelector('.entry_screen');
let DOM_username_input = document.querySelector('.entry_screen input');
let DOM_invalid_user_name_popup = document.querySelector('.invalid_username_popup');
let DOM_invalid_message_popup = document.querySelector('.invalid_message_popup');
let DOM_loading_screen = document.querySelector('.loading_screen');
let DOM_page_content = document.querySelector('.page_content');
let DOM_top_menu = document.querySelector('.top_menu');
let DOM_message_container = document.querySelector('.message_container');
let DOM_side_menu = document.querySelector('.side_menu');
let DOM_shaded_screen = document.querySelector('.shaded_screen');
let DOM_visibility_menu = document.querySelector('.visibility_menu');
let DOM_user_menu = document.querySelector('.user_menu');
let DOM_bottom_menu = document.querySelector('.bottom_menu');
let DOM_message_input = document.querySelector('.bottom_menu textarea');
let DOM_message_input_placeholder = document.querySelector('.bottom_menu .placeholder');


// -------------------------------- Functions --------------------------------
function SERVER_process_username_answer(answer) {

    if(answer.status == 200){
        username = typed_username;
        start_ping_server_interval();
        fetch_messages_from_server();
        fetch_participants_from_server();
        start_chat_refresh_interval();
        start_participants_refresh_interval();
        DOM_message_input.addEventListener("keyup", ({key}) => {
                                                        if (key === "Enter") {
                                                            send_message();
                                                        }
                                                    });
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
        DOM_invalid_user_name_popup.style.opacity = 0.8;
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
                                        console.log('ping');
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

    if (recipient_user != undefined){
        if (visibility_mode == 'Público'){
            DOM_message_input_placeholder.innerHTML = `
                                                        Escreva Aqui...
                                                            <div>
                                                                Enviando para ${recipient_user}
                                                            </div>
                                                      `;
        }
        else{
            DOM_message_input_placeholder.innerHTML = `
                                                        Escreva Aqui...
                                                            <div>
                                                                Enviando para ${recipient_user} (reservadamente)
                                                            </div>
                                                      `;
        }
    }
    else{
        DOM_message_input_placeholder.innerHTML = `
                                                    Escreva Aqui...
                                                  `;
    }
}


function change_recipient(i){
    const DOM_user_options = DOM_user_menu.querySelectorAll('.option');
    for (let j = 0; j < DOM_user_options.length; j++) {
        DOM_user_options[j].querySelector('.option_content').innerHTML = `<p>${participants_array[j]}</p>`;
    }

    DOM_user_options[i].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
    recipient_user = participants_array[i];

    if (visibility_mode == 'Público'){
        DOM_message_input_placeholder.innerHTML = `
                                                        Escreva Aqui...
                                                            <div>
                                                                Enviando para ${recipient_user}
                                                            </div>
                                                      `;
    }
    else{
        DOM_message_input_placeholder.innerHTML = `
                                                        Escreva Aqui...
                                                            <div>
                                                                Enviando para ${recipient_user} (reservadamente)
                                                            </div>
                                                      `;
    }
    
}





function scroll_last_message_into_view(){
    const messages = DOM_message_container.querySelectorAll('.message');
    const last_message = messages[messages.length - 1];
    last_message.scrollIntoView();
    // scrollIntoView() not working without the Timeout
    // setTimeout(function(){
    //     last_message.scrollIntoView();
    // }, 2000);
}


function fill_chat(){
    let message_div;
    DOM_message_container.innerHTML = '';
    for (let i = 0; i < messages_array.length; i++) {
        const message_type = messages_array[i].type;
        const message_time = messages_array[i].time;
        const message_from = messages_array[i].from;
        const message_text = messages_array[i].text;
        const message_to = messages_array[i].to;
        
        if (message_type == 'status'){
            message_div = `
                        <div class="message status">
                            <span class="time">(${message_time})</span>
                            <span class="message_content"><span class="username">${message_from}</span> ${message_text}</span>
                        </div>
                         `;
            DOM_message_container.innerHTML += message_div;
        }
        else if (message_type == 'message'){
            message_div = `
                        <div class="message regular">
                            <span class="time">(${message_time})</span>
                            <span class="message_content"><span class="username">${message_from}</span> para <span class="username">${message_to}:</span> ${message_text}</span>
                        </div>
                         `;
            DOM_message_container.innerHTML += message_div;
        }
        else if (message_type == 'private_message'){
            if (username == message_to || username == message_from){
                message_div = `
                        <div class="message private">
                            <span class="time">(${message_time})</span>
                            <span class="message_content"><span class="username">${message_from}</span> reservadamente para <span class="username">${message_to}:</span> ${message_text}</span>
                        </div>
                         `;
                DOM_message_container.innerHTML += message_div;
            }
        }
        else{
            throw new Error('Invalid message type!');
        }
    }
    scroll_last_message_into_view();
}


function SERVER_process_fetch_messages_answer(answer) {
    messages_array = answer.data;
    fill_chat();
}
function fetch_messages_from_server(){
    const SERVER_fetch_messages_promise = axios.get(messages_url);
    SERVER_fetch_messages_promise.then(SERVER_process_fetch_messages_answer);
}




function start_chat_refresh_interval(){
    refresh_chat_time_interval = setInterval(function () {
                                    fetch_messages_from_server();
                                    console.log('fetching messages from server');
                                }, 3000);
}








function SERVER_process_message_sent_answer(answer){
    if(answer.status == 200){
        fetch_messages_from_server();
    }
    else{
        return;
    }
}
function SERVER_process_message_sent_error(error){
    window.location.reload();
}

function send_message(){
    let message_content = DOM_message_input.value;
    let message_to;
    let message_type;
    DOM_message_input.value = '';

    if(message_content.trim().length != 0 && String(message_content)){

        if (recipient_user != undefined){
            let recipient_user_index = participants_array.indexOf(recipient_user);
            if (recipient_user_index != -1){
                message_to = participants_array[recipient_user_index];
            }
            else{
                show_invalid_message_popup('Destinatário ausente do chat!');
                DOM_message_input_placeholder.innerHTML = `
                                                            Escreva Aqui...
                                                          `;
                return;
            }
        }
        else{
            show_invalid_message_popup('Escolha um destinatário primeiro!');
            return;
        }
        
        if(message_to == username){
            show_invalid_message_popup('Não é possível enviar mensagens para próprio usuário!');
            return;
        }

        if (visibility_mode=='Público'){
            message_type = 'message'
        }
        else{
            message_type = 'private_message';
            if(message_to == 'Todos'){
                show_invalid_message_popup('Não é possível enviar uma mensagem privada para todos!');
                return;
            }
        }
        const SERVER_message_sent_promise = axios({
                                                method: 'post',
                                                url: messages_url,
                                                data: {
                                                    from: username,
                                                    to: message_to,
                                                    text: message_content,
                                                    type: message_type
                                                }
                                            });
        SERVER_message_sent_promise.then(SERVER_process_message_sent_answer)
                                   .catch(SERVER_process_message_sent_error);
    }
    else{
        show_invalid_message_popup('Mensagem inválida!');
        return;
    }
}




function SERVER_process_fetch_participants_answer(answer){
    const data = answer.data;
    participants_array = ['Todos'];
    for (let i = 0; i < data.length; i++) {
        participants_array.push(data[i].name);
    }
    fill_side_menu_with_participants();
}
function fetch_participants_from_server(){
    const SERVER_fetch_participants_promise = axios.get(participants_url);
    SERVER_fetch_participants_promise.then(SERVER_process_fetch_participants_answer)
                                     .catch(function (error){
                                        throw new Error('Could not get participants from server!');
                                     });
}

function start_participants_refresh_interval(){
    refresh_participants_time_interval = setInterval(function () {
                                                        fetch_participants_from_server();
                                                        console.log('fetching participants from server');
                                                    }, 10000);
}



function fill_side_menu_with_participants(){
    DOM_user_menu.innerHTML = '';
    for (let i = 0; i < participants_array.length; i++) {
        const participant_div = `<div class="option" onclick="change_recipient(${i})" data-identifier="participant">
                                    <ion-icon name="person-circle"></ion-icon>
                                    <div class="option_content">
                                        ${participants_array[i]}
                                    </div>
                                </div>`;
        DOM_user_menu.innerHTML += participant_div;
    }
    const DOM_user_options = DOM_user_menu.querySelectorAll('.option');
    if (recipient_user != undefined){
        let recipient_user_index = participants_array.indexOf(recipient_user);
        if (recipient_user_index != -1){
            DOM_user_options[recipient_user_index].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
        }
        else{
            recipient_user = undefined;
        }
        
    }
    
}


function show_invalid_message_popup(message_string){
    DOM_invalid_message_popup.style.opacity = 0.8;
    DOM_invalid_message_popup.innerHTML = message_string;
    setTimeout(function(){ DOM_invalid_message_popup.style.opacity = 0;
                           DOM_invalid_message_popup.innerHTML = ""; }, 2000);
}




function initialize_application(){

    // Set global variables
    visibility_mode = 'Público';
    recipient_user = undefined;
    participants_array = ['Todos'];
    visibility_options = ['Público', 'Reservadamente']



    // Add EventListener to let user log in with 'enter' key
    DOM_entry_screen.addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            log_in();
        }
    });
}




// -------------------------------- Main --------------------------------

initialize_application();


