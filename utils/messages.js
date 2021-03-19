const moment = require('moment');

function formatMessage(username, text)
{
  return {      
      username,
      text,
      time: moment().format('h:mm a')
  }
}

function formatPrivateMessage(id, sender_username, senderid, receiver_username, receiverid, chatkey, text, msgclass){
  return {
    id,
    sender_username,
    senderid,
    receiver_username,
    receiverid,
    chatkey,
    text,
    time: moment().format('h:mm a'),
    msgclass
  }
}

module.exports = {
  formatMessage,
  formatPrivateMessage
};