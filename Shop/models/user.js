const db=require('../db/config')
const fs = require('fs');



module.exports=class User{
    constructor({fullname,username,avatar}){
        this.fullname=fullname;
        this.username=username;
        this.avatar=avatar;    
    }

    static getByUn(un){
        const data=db.getAll();
        const foundUser = data.Users.find(user => user.username === un);
        return foundUser;
    }

    static insert(user){
        const data=db.getAll();
        data.Users.push(user);
       
        return db.update(data);
    }
}