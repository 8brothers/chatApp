const dotenv = require('dotenv');
const { formatMessage, formatPrivateMessage } = require('../utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getAllUsers,
    getUserById,
} = require('../utils/users');
dotenv.config();
const Chat = require('../models/Chat');

function socketio(io){

    // Run when client connects
    io.on('connection', socket => {
        console.log('User connected');        

        socket.on('userJoin', ({ username, room, roomid ,userId, email, img }) => {                        
            const user = userJoin(socket.id, username, room, roomid, userId, email, img ,'online');            
            socket.join(user.room);         
            //Broadcast to all users  
            getAllUsers().then((data) => {               
                io.emit('allusers', data);
            });                              
                      
        });        

        // Listen for chatMessage
        socket.on('privateMessage', ({ msg, recieverid, receiver_userid, chatkey, t, msgclass }) => {
            //if (recieverid == null) then save the message into DB for that user            
            let sender = getCurrentUser(socket.id);            
            let receiver = '';
            console.log('recieverid typeof : ',typeof recieverid);
            console.log('recieverid: ', recieverid);
            if ((recieverid != undefined) && (recieverid != 'null') && (recieverid != null)){
                receiver = getCurrentUser(recieverid);
                console.log('if receiver: ', receiver, typeof (recieverid));           
            }else{
                console.log('receiver_userid: ', receiver_userid);
                receiver = getUserById(receiver_userid);
                console.log('receiver_userid: ', receiver);                
            }           
            

            try {
                let chat = new Chat({
                    message: msg,
                    msgtimestamp: t,
                    senderId: sender.userId,
                    receiverId: receiver.userId,
                    chatroomId: sender.roomId,
                    channelId: chatkey,
                    msgclass: msgclass
                });

                chat.save();
                //console.log(chat);
            }
            catch (err) {
                console.log("Not able to save chat");
            };

            //save message to db
            io.to(receiver.id).emit('msgs', formatPrivateMessage(sender.id, sender.username, sender.userId, receiver.username, receiver.userId, chatkey, msg, 'other-message'));
            io.to(sender.id).emit('msgs', formatPrivateMessage(sender.id, sender.username, sender.userId, receiver.username, receiver.userId, chatkey, msg, 'you-message')); 
                        
        });

        socket.on('joinRoom', ({ username, room, roomId, userId, email, img }) => {
            const user = userJoin(socket.id, username, room, roomId, userId, email, img, 'online');
            socket.join(user.room);

            // Broadcast when a user connect
            if (user.room != 'none') {
                // Welcome current user
                socket.emit('message', formatMessage(process.env.BOT_NAME, 'Welcome to oChat!'));

                socket.broadcast
                    .to(user.room)
                    .emit('message', formatMessage(process.env.BOT_NAME, `${user.username} has joined the chat`));

                console.log(user);
                // Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }            
        });


        // Listen for chatMessage
        socket.on('chatMessage', msg => {
            const user = getCurrentUser(socket.id);
            console.log('chatMessages', user);
            if (user.room != 'none') {
                //before emiting save chat to DB
                io.to(user.room).emit('message', formatMessage(user.username, msg));
            }
        });

        // Runs when client disconnects
        socket.on('disconnect', () => {
            console.log('User disconnected');

            const user = userLeave(socket.id);            
            if (user) {

                //Private users left chat/disconnect
                io.to(user.room).emit('allusers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });                                

                if(user.room != 'none'){
                    io.to(user.room).emit(
                        'message',
                        formatMessage(process.env.BOT_NAME, `${user.username} has left the chat`)
                    );

                    // Send users and room info
                    io.to(user.room).emit('roomUsers', {
                        room: user.room,
                        users: getRoomUsers(user.room)
                    });
                }
                
            }
        });


    });

}

module.exports = socketio;