let chatForm = '';
// const dotenv = require('dotenv');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const userInfo = document.getElementById('userinfo');
const chatWindow = document.getElementById('chat-window');

let recieverid = '';
let chatUsersList = [];
let chatMsgs = [];
let activeChatUser = '';
let users = [];
let roomusers = [];
let chatkey = '';
let handle = 0;
let isConnected = 0;

let socket = io.connect('', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
});

//As number of times reconnect calls number of users connect via socket in room
function reconnect(){
    console.log('reconnect called....');
    if (!isConnected){
        isConnected = 1;
        socket.on('connect', function () {
            //reload window for fresh socket id
            window.location.reload();
            
            if (room != 'none') {
                socket.emit('joinRoom', { username, room, roomid, userId, img, email });
                isConnected = 0;
            } else {
                socket.emit('userJoin', { username, room, roomid, userId, email });
            }
           
        }); 
    }
    
}

socket.on('disconnect', function () {
    console.log('disconnected from server ');
    if (!isConnected) {
        setTimeout(function () {             
                reconnect();   
        }, 3000);
    }    
});

// Join chatroom
if(room != 'none'){
    socket.emit('joinRoom', { username, room, roomid, userId, email, img });
}else{
    socket.emit('userJoin', { username, room, roomid, userId, email, img });
}

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    //outputRoomName(room);    
    getRoomAndUsers(users, room);
});

socket.on('allusers', (usr) => {    
    //update local user array    
    users = usr;                
    getRoomAndUsers(users, room);
});

function getRoomAndUsers(users, room){    
    const indx = users.findIndex(user => user.email === email);
    console.log('indx: ',indx);    
    if (indx != -1) {
        users.splice(indx, 1)[0];
    }
        
    if (room !== 'none'){        
        outputRoomUsers(users);
    }else if(room == 'none'){        
        outputUsers(users);
    }    
}

function outputRoomUsers(users) {        
    roomName.innerHTML = room;
    userList.innerHTML = `${users.map(user => `<li><a href="javascript:void(0)" data-userid="${user.id}" data-username="${user.username}"> ${user.username}</a></li>`).join('')}`;
}


// Message from server
socket.on('msgs', message => {                
    let chatkey = message.chatkey;
    
    if (chatMsgs[chatkey]) { 
        chatMsgs[chatkey].push(message);
    }else{
        chatMsgs[chatkey] = [message];
    }         

    if (activeChatUser == message.receiverid || activeChatUser == message.senderid){
        outputMessage(message, message.msgclass);                            
    }

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('message', message => {
    console.log('socket on message', message);
    if(room != 'none') { 
        outputChatroomMessage(message);
    }else{
        alert(message.text);
        window.location.reload();
    }    

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Submit form and send message to server
function sendMsg(e){
    e.preventDefault();        
    let msg = e.target.elements.msg.value;
    let t = new Date();    
    msgclass = false;
    console.log('on submit message');
    console.log('msg ', msg, 'recieverid ', recieverid, 'chatkey ', ' receiver_userid' + receiver_userid, ' chatkey:' + receiver_userid, 't ', t);
    // emit message to server
    if (room != 'none') {
        socket.emit('chatMessage', msg);
    } else {
        socket.emit('privateMessage', { msg, recieverid, receiver_userid, chatkey, t, msgclass});
    }

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();    
}

// Output message to DOM
function outputMessage(message, msgclass) {
    
    if (!message) {
        return;
    }

    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(msgclass);
    div.innerHTML = `<p class="meta">${message.sender_username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);

}

// Output message to DOM
function getMessageHistory(messages, msgclass) 
{         
    
    if (!messages) {
        return;
    }

    let created_date = new Date(messages.createdAt);            
    
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = created_date.getFullYear();    
    var month = months[created_date.getMonth()];        
    var date = created_date.getDate();        
    var hour = created_date.getHours();    
    var min = created_date.getMinutes();    
    var sec = created_date.getSeconds();    
    var time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;    // final date with time, you can use this according your requirement                          
       
    const divElem = document.createElement('div');
    const msgElem = document.createElement('div');
    const wrapper = document.createElement('div');
    divElem.classList.add('message-content');
    msgElem.classList.add('message-row');
    msgElem.classList.add(msgclass);
    wrapper.classList.add('wrapper-msg');
    msgElem.innerHTML += `<p class="message-text">${messages.message}</p>`;
    if (msgclass == 'other-message') {
        divElem.innerHTML += `<img src="${messages.senderId[0].profile_img}" alt="user-profile">`;
        msgElem.innerHTML += `<p class="message-time">${messages.senderId[0].displayName} <br><span>${time}</span></p>`;
    }else{
        msgElem.innerHTML += `<p class="message-time">${time}</p>`;
    }                                

    divElem.appendChild(msgElem);
    if (msgclass == 'other-message') {
        wrapper.appendChild(divElem);
        document.querySelector('.chat-messages').appendChild(wrapper);
    }else{
        document.querySelector('.chat-messages').appendChild(divElem);
    }    
    
}

// Output message to Chatroom
function outputChatroomMessage(message) {
    
    if (!message) {
        return;
    }
    
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p><p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    console.log(room);
    userList.innerHTML += `<li><a href="#"  data-username="${room}"> ${room}</a></li>`;
}

// Add users to DOM
function outputUsers(users) {    
    console.log('output users ',users);
    userInfo.innerHTML = '';
    userList.innerHTML = '';
    userInfo.innerHTML =  username;
    userList.innerHTML = `${users.map(user => `<li><img src="${user.img}" alt="user-profile" /><a href="javascript:void(0)" onclick="startChat(this)" data-socketid="${user.id}" data-userid="${user.userId}" data-roomid="${user.roomId}" data-username="${user.username}" data-email="${user.email}"> ${user.username}</a></li>`).join('')}`;
}

function loadUserChatWindow()
{   
    chatWindow.innerHTML = `<div class="chat-messages"></div><div class= "chat-form-container"><form id="chat-form" onsubmit="sendMsg(event); return false;"><input id="msg" type="text" placeholder="Enter Message" required autocomplete="off" /><input id="sender_userId" type="hidden" value="${userId}"><input type="submit" value="Submit" class="send-btn"></form></div>`;    
    chatWindow.style.display = "block";
    chatForm = document.getElementById('chat-form');    
}

function startChat(e){    
    //Load user chat window
    loadUserChatWindow();         
    
    //Remove active class
    removeActiveClass();
    e.className = 'active';
    activeChatUser = e.dataset.userid; //The chat is going on with
    receiver_userid = e.dataset.userid;
    receiver_email = e.dataset.email;
    recieverid = receiver_socketid = e.dataset.socketid;
    roomid = e.dataset.roomid;    
   
    // recieverid = receiver_socketid;    
    
    chatkey = userId + '-' + activeChatUser; //channelid        
    chatkey2 = activeChatUser + '-' + userId; //channelid        
    //e.classList.add('active-chatuser')    
    document.querySelector('.chat-messages').innerHTML = '';    

    //call api to get chat messages
    fetch(`/getprivatechat?channelid1=${chatkey}&channelid2=${chatkey2}`)
        .then((resp) => resp.json())
        .then(function (data) {                        
            data.forEach((chatmsg) => {
                let msgclass = (chatmsg.channelId == chatkey) ? 'you-message' : 'other-message';
                getMessageHistory(chatmsg, msgclass);
            });
        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
        }); 
       
    
    var reschatHistory = httpGet(`/getprivatechat?channelid=${chatkey}`);    
    getMessageHistory(chatMsgs[chatkey]);    
    getMessageHistory(chatMsgs[username]);
}

 
function removeActiveClass() {
    var elems = userList.querySelectorAll(".active");
    [].forEach.call(elems, function (el) {
        el.classList.remove("active");
    });
}




