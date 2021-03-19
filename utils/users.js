const fetch = require("node-fetch");
const User = require('../models/User');
const dotenv = require('dotenv');
const users = [];
let data = '';
let usr_data = {};
let pushFlag = false;
dotenv.config();

// Join user to chat
async function userJoin(id, username, room, roomId, userId, email, img ,status = '') {
    const joinuser = { id, username, room, roomId, userId, email, img ,status }; 
   
    return new Promise((resolve, reject) => {
        fetch(process.env.APP_URL + '/getusers')
            .then((resp) => resp.json())
            .then(function (data) {
                data.forEach((usr) => {
                    console.log('userJoin::usr: ', usr);
                    //console.log('users: ', users);
                    let isUserExist = users.find(user => user.userId == usr._id);
                    console.log('userJoin::isUserExist: ', isUserExist);
                    if (!isUserExist || isUserExist == undefined) {                        
                        usr_data = { id: null, username: usr.displayName, room: 'none', roomId: '603756de6633ad75b3684c10', userId: usr._id, email: usr.email, img: usr.profile_img, status: 'offline' };                    
                        users.push(usr_data);
                    }                                        
                });

                let index = users.findIndex(u => u.email === joinuser.email);
                users[index].id = joinuser.id;
                users[index].status = 'online';
                
                resolve(joinuser);

            })
            .catch(function (error) {
                reject(error)
            });
    })    
        
}

async function getExistingUsersFromDB()
{       
    return new Promise((resolve, reject) => {
        fetch(process.env.APP_URL+'/getusers')
            .then((resp) => resp.json())
            .then(function (data) {                
                data.forEach((usr) => {   
                    console.log('getExistingUsersFromDB::usr: ', usr);
                    console.log('getExistingUsersFromDB::users: ', users);                                     
                    let isUserExist = users.find(user => user.userId == usr._id);
                    console.log('getExistingUsersFromDB::isUserExist: ', isUserExist);                                     
                    if (!isUserExist || isUserExist == undefined)
                    {
                        usr_data = { id: null, username: usr.displayName, room: 'none', roomId: '603756de6633ad75b3684c10', userId: usr._id, email: usr.email, img: usr.profile_img, status: 'offline' };                        
                        users.push(usr_data);                            
                    }                                           
                });
                resolve(users);

            })
            .catch(function (error) {
                reject(error)                                
            });
    })
    
}

async function getAllUsers(){  
   
    let promise = await getExistingUsersFromDB();
    let pdata = promise.filter(user => user.room === 'none');

    return pdata;
}

// Get current user
function getCurrentUser(id) {
    //console.log('currentUser', users);
    return users.find(user => user.id === id);
}

function getUserById(id) {
    return users.find(user => user.userId == id);
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        //update the status of user online to offline
        users[index].status = 'offline';
        return users.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getAllUsers,
    getUserById,
};