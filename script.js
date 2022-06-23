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

//----------------------------------------------------------------------------------------
// Function: log_in()
// Description: Function called to log in user after username is typed.
//              Treats errors in case username is invalid.
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------
// Function: set_up_chat()
// Description: Sets up time intervals and fetches messages and participants when entering chat
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function set_up_chat(){
    start_ping_server_interval();
    fetch_messages_from_server();
    fetch_participants_from_server();
    start_chat_refresh_interval();
    start_participants_refresh_interval();
}

//----------------------------------------------------------------------------------------
// Function: SERVER_process_username_answer(answer)
// Description: Treats answer received by 'participants_url' API (then function).
//
// Inputs:
// - answer: Answer received by 'participants_url' API
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function SERVER_process_username_answer(answer) {

    // Status == OK
    if(answer.status == 200){
        username = typed_username;
        set_up_chat();
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
    // Else (do nothing)
    else{
        return;
    }
}

//----------------------------------------------------------------------------------------
// Function: SERVER_process_username_error(error)
// Description: Treats error received by 'participants_url' API (catch function).
//
// Inputs:
// - error: Error received by 'participants_url' API
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function SERVER_process_username_error(error){
    
    if (error.response.status == 400){
        DOM_invalid_user_name_popup.style.opacity = 0.8;
        DOM_invalid_user_name_popup.innerHTML = "Nome já está em uso! Digite outro";
        setTimeout(function(){ DOM_invalid_user_name_popup.style.opacity = 0;
                               DOM_invalid_user_name_popup.innerHTML = ""; }, 2000);
    }
}

//----------------------------------------------------------------------------------------
// Function: start_ping_server_interval()
// Description: Starts the time interval to ping 'status_url' server every 5s.
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------
// Function: move_side_menu(mode)
// Description: Moves the side menu when user clicks icon or shaded area
//
// Inputs:
// - mode: 'show' displays the side menu and 'hide' move it outside of view
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function move_side_menu(mode) {

    if (mode == 'show'){
        DOM_side_menu.style.right = 0;
    }
    else if (mode == 'hide'){
        DOM_side_menu.style.right = "-259px";
        
    }

    DOM_shaded_screen.classList.toggle('hidden');
}

//----------------------------------------------------------------------------------------
// Function: change_visibility(i)
// Description: Changes the visibility option according to which option was clicked by the user
//
// Inputs:
// - i: Index of chosen visibility option.
//
// Outputs: none;
//----------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------
// Function: change_recipient(i)
// Description: Changes the recipient according to the one clicked by the user in the side menu.
//
// Inputs:
// - i: Index of chosen recipient.
//
// Outputs: none;
//----------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------
// Function: scroll_last_message_into_view()
// Description: Scrolls into view the last message in chat.
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function scroll_last_message_into_view(){

    const messages = DOM_message_container.querySelectorAll('.message');
    const last_message = messages[messages.length - 1];

    last_message.scrollIntoView();
}

//----------------------------------------------------------------------------------------
// Function: fill_chat()
// Description: Fills chat with retrieved messages stored in 'messages_array' variable.
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------
// Function: fetch_messages_from_server()
// Description: Gets all messages from 'messages_url' API
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function fetch_messages_from_server(){

    const SERVER_fetch_messages_promise = axios.get(messages_url);
    SERVER_fetch_messages_promise.then(SERVER_process_fetch_messages_answer);
}

//----------------------------------------------------------------------------------------
// Function: SERVER_process_fetch_messages_answer(answer)
// Description: Treats success when trying to fetch messages from server (then function).
//              Fills chat with retrieved messages in case of success.
//
// Inputs: answer: answer received by 'messages_url' API
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function SERVER_process_fetch_messages_answer(answer) {

    messages_array = answer.data;
    fill_chat();
}

//----------------------------------------------------------------------------------------
// Function: start_chat_refresh_interval()
// Description: Starts the time interval to refresh chat every 3s
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function start_chat_refresh_interval(){

    refresh_chat_time_interval = setInterval(function () {
                                    fetch_messages_from_server();
                                    console.log('fetching messages from server');
                                }, 3000);
}

//----------------------------------------------------------------------------------------
// Function: send_message()
// Description: Sends a message written by user in 'DOM_message_input'
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------------
// Function: SERVER_process_message_sent_answer(answer)
// Description: Treats success when trying to send message to server (then function).
//              Fetches messages from server in case of success (answer.status == 200)
//
// Inputs: answer: answer received by 'messages_url' API
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function SERVER_process_message_sent_answer(answer){

    if(answer.status == 200){
        fetch_messages_from_server();
    }
    else{
        return;
    }
}

//----------------------------------------------------------------------------------------
// Function: SERVER_process_message_sent_error(error)
// Description: Treats error when trying to send message to server (catch function).
//              Resets application in case of error.
//
// Inputs: error: error received by 'messages_url' API
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function SERVER_process_message_sent_error(error){

    window.location.reload();
}

//----------------------------------------------------------------------------------------
// Function: fetch_participants_from_server()
// Description: Gets active participants from API 'participants_url' and treats error
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function fetch_participants_from_server(){

    const SERVER_fetch_participants_promise = axios.get(participants_url);
    SERVER_fetch_participants_promise.then(SERVER_process_fetch_participants_answer)
                                     .catch(function (error){
                                        throw new Error('Could not get participants from server!');
                                     });
}

//----------------------------------------------------------------------------------------
// Function: SERVER_process_fetch_participants_answer(answer)
// Description: Gets active participants from API 'participants_url' (success case (then function))
//
// Inputs:
//  - answer: Answer returned by server
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function SERVER_process_fetch_participants_answer(answer){

    const data = answer.data;
    participants_array = ['Todos'];
    for (let i = 0; i < data.length; i++) {
        participants_array.push(data[i].name);
    }
    fill_side_menu_with_participants();
}

//----------------------------------------------------------------------------------------
// Function: start_participants_refresh_interval()
// Description: Starts the time interval to refresh active participants every 10s
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function start_participants_refresh_interval(){

    refresh_participants_time_interval = setInterval(function () {
                                                        fetch_participants_from_server();
                                                        console.log('fetching participants from server');
                                                    }, 10000);
}

//----------------------------------------------------------------------------------------
// Function: fill_side_menu_with_participants()
// Description: Fills side menu with active participants
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
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
            show_invalid_message_popup('Destinatário anterior ausente, favor escolher outro!');
            DOM_message_input_placeholder.innerHTML = `
                                                        Escreva Aqui...
                                                      `;
        }
    }
}

//----------------------------------------------------------------------------------------
// Function: show_invalid_message_popup(message_string)
// Description: Shows a opop up error message when user tries to send a message
//              Possible errors:
//                  - 'Mensagem inválida!'
//                  - 'Não é possível enviar uma mensagem privada para todos!'
//                  - 'Não é possível enviar mensagens para próprio usuário!'
//                  - 'Escolha um destinatário primeiro!'
//                  - 'Destinatário ausente do chat!'
//                  - 'Destinatário anterior ausente, favor escolher outro!'
//
// Inputs:
//  - message_string: String containing pop up error message to be shown
//
// Outputs: none;
//----------------------------------------------------------------------------------------
function show_invalid_message_popup(message_string){

    DOM_invalid_message_popup.style.opacity = 0.8;
    DOM_invalid_message_popup.innerHTML = message_string;
    setTimeout(function(){ DOM_invalid_message_popup.style.opacity = 0;
                           DOM_invalid_message_popup.innerHTML = ""; }, 2000);
}

//----------------------------------------------------------------------------------------
// Function: initialize_application()
// Description: Initializes global state variables and login enter EventListener
//
// Inputs: none
//
// Outputs: none;
//----------------------------------------------------------------------------------------
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


