// -------------------------------- Global Variables --------------------------------
let username;
let typed_username;
let visibility_mode = 'Público';
let recipient_user_index = 0;
let messages_array;
let participants_array = ['Todos'];
const participants_url = 'https://mock-api.driven.com.br/api/v6/uol/participants ';
const status_url = 'https://mock-api.driven.com.br/api/v6/uol/status';
const messages_url = 'https://mock-api.driven.com.br/api/v6/uol/messages/';
const visibility_options = ['Público', 'Reservadamente'];
let ping_time_interval;
let refresh_chat_time_interval;
let refresh_participants_time_interval;


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
let DOM_bottom_menu = document.querySelector('.bottom_menu');
let DOM_message_input = document.querySelector('.bottom_menu input');


// -------------------------------- Functions --------------------------------
function SERVER_process_username_answer(answer) {

    if(answer.status == 200){
        username = typed_username;
        start_ping_server_interval();
        fetch_messages_from_server();
        fetch_participants_from_server();
        start_chat_refresh_interval();
        start_participants_refresh_interval();
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
}


function change_user(i){
    const DOM_user_options = DOM_user_menu.querySelectorAll('.option');
    for (let j = 0; j < DOM_user_options.length; j++) {
        DOM_user_options[j].querySelector('.option_content').innerHTML = `<p>${participants_array[j]}</p>`;
    }

    if (participants_array[i] != username){
        DOM_user_options[i].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
        recipient_user_index = i;
    }
    console.log('recipient_user = ', participants_array[recipient_user_index]);
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
    console.log('fill_chat()');
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
        else if (message_type == 'private_message' && (username == message_to || username == message_from)){
            message_div = `
                        <div class="message private">
                            <span class="time">(${message_time})</span>
                            <span class="message_content"><span class="username">${message_from}</span> reservadamente para <span class="username">${message_to}:</span> ${message_text}</span>
                        </div>
                         `;
            DOM_message_container.innerHTML += message_div;
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
    console.log('SERVER_fetch_messages_promise', SERVER_fetch_messages_promise);
    SERVER_fetch_messages_promise.then(SERVER_process_fetch_messages_answer);
}




function start_chat_refresh_interval(){
    refresh_chat_time_interval = setInterval(function () {
                                    fetch_messages_from_server();
                                    console.log('refresh_chat');
                                }, 3000);
}








function SERVER_process_message_sent_answer(answer){
    if(answer.status == 200){
        console.log('Message Sent successfully!')
        fetch_messages_from_server();
    }
    else{
        return;
    }
}
function SERVER_process_message_sent_error(error){
    console.log('Error: Message was not sent successfully')
    console.log(error);
    window.location.reload();
}
function send_message(){
    const message_content = DOM_message_input.value;
    let message_to;
    let message_type;
    DOM_message_input.value = '';

    if(typed_username.trim().length != 0 && String(typed_username)){
        message_to = participants_array[recipient_user_index];
        if (visibility_mode=='Público'){
            message_type = 'message'
        }
        else{
            message_type = 'private_message';
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
}




function SERVER_process_fetch_participants_answer(answer){
    console.log('answer = ', answer);
    const data = answer.data;
    participants_array = ['Todos'];
    for (let i = 0; i < data.length; i++) {
        participants_array.push(data[i].name);
    }
    console.log('participants_array = ', participants_array);
    fill_side_menu_with_participants();
}
function fetch_participants_from_server(){
    const SERVER_fetch_participants_promise = axios.get(participants_url);
    SERVER_fetch_participants_promise.then(SERVER_process_fetch_participants_answer)
                                     .catch(function (error){
                                        console.log(error);
                                        console.log('Could not get participants from server!');
                                        throw new Error('Could not get participants from server!');
                                     });
}

function start_participants_refresh_interval(){
    refresh_participants_time_interval = setInterval(function () {
                                                        fetch_participants_from_server();
                                                        console.log('refresh_participants');
                                                        console.log(participants_array);
                                                    }, 10000);
}



function fill_side_menu_with_participants(){
    DOM_user_menu.innerHTML = '';
    for (let i = 0; i < participants_array.length; i++) {
        const participant_div = `<div class="option" onclick="change_user(${i})" data-identifier="participant">
                                    <ion-icon name="person-circle"></ion-icon>
                                    <div class="option_content">
                                        ${participants_array[i]}
                                    </div>
                                </div>`;
        DOM_user_menu.innerHTML += participant_div;
    }
    const DOM_user_options = DOM_user_menu.querySelectorAll('.option');
    DOM_user_options[recipient_user_index].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
}


// -------------------------------- Main --------------------------------