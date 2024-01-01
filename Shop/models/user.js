const db=require('../db/config')
const fs = require('fs');




module.exports=class User{
    constructor({fullname,username,avatar,isCreator,scores}){
        this.fullname=fullname;
        this.username=username;
        this.avatar=avatar;   
        this.isCreator=isCreator;
        this.scores=scores;
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

    static changeStatus(un, value){
        const jsonData=db.getAll();
        const users = jsonData.Users;

        // Tìm kiếm người dùng trong mảng
        const foundUser = users.find(user => user.username === un);
        // Nếu người dùng được tìm thấy, thay đổi thuộc tính isCreator
         if (foundUser) {
              foundUser.isCreator = value;
              console.log(foundUser);
              const rs=db.update(jsonData);
         
     } else {
            console.log(`User ${un} not found`);
      }
    }

    static update(un, username,fullname,avatar){
        const jsonData=db.getAll();
        const users = jsonData.Users;

        // Tìm kiếm người dùng trong mảng
        const foundUser = users.find(user => user.username === un);
        // Nếu người dùng được tìm thấy, thay đổi thuộc tính isCreator
         if (foundUser) {
              foundUser.username = username;
              foundUser.fullname = fullname;
              foundUser.avatar=avatar;
              const rs=db.update(jsonData);
         
       } else {
            console.log(`User ${un} not found`);
        }
    }

    static getScore(un){
        const jsonData=db.getAll();
        const users = jsonData.Users;
        
        // Tìm kiếm người dùng trong mảng
        const foundUser = users.find(user => user.username === un);
        // Nếu người dùng được tìm thấy, thay đổi thuộc tính isCreator
         if (foundUser) {
              foundUser.scores +=1;
         
         const rs=db.update(jsonData);
         
     } else {
            console.log(`User ${un} not found`);
      }
    }
    
}