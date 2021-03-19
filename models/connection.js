const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const databaseName = "chatapp";
const server = process.env.MONGO_SERVER_IP;
const dbConn = `mongodb://${server}/${databaseName}`;

class Database{

    constructor(){
       this._connect(); 
    }

    _connect(){

        try{
            mongoose.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => console.log('DB Connected!'))
            .catch(err => {
                console.error('DB Connection Error: ', err);
            });
        }catch(err){
            console.log(err);
        }
        
    }
}

module.exports = new Database();