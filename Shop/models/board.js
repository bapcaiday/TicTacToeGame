const db=require('../db/config')
const fs = require('fs');
const Users=require('../models/user')



module.exports=class Board{
    constructor({id,status,creator,player,size,winner}){
        this.id=id;
        this.status=status;
        this.creator=creator;
        this.player=player;
        this.size=size;
        this.winner=winner;    
    }

    static getByUn(un){
        const data=db.getAll();
        const foundUser = data.Boards.find(user => user.id === un);
        return foundUser;
    }

    static getLastId(){
        const data=db.getAll();
        if (data.Boards.length>0){
            const foundUser = data.Boards[data.Boards.length -1]
            const index=parseInt(foundUser.id);
            return index+1;
        }
        else{
            return 1;
        }
        
    }

    static delete(id){
        const jsonData=db.getAll();
        const boards = jsonData.Boards;

        const update = boards.filter(user => user.id !== id);
        jsonData.Boards = updatedUsers;

        const rs=db.update(jsonData);
    }

    static insert(user){
        const data=db.getAll();
        data.Boards.push(user);
       
        return db.update(data);
    }

    static updateWinner(un, value){
        const jsonData=db.getAll();
        const tables = jsonData.Boards;
        
        // Tìm kiếm người dùng trong mảng
        const foundUser = tables.find(user => user.id === un);
        // Nếu người dùng được tìm thấy, thay đổi thuộc tính isCreator
         if (foundUser) {
              foundUser.winner = value;
              
         
         const rs=db.update(jsonData);
         
     } else {
            console.log(`User ${un} not found`);
      }
    }

    static changeStatus(un, value){
        const jsonData=db.getAll();
        const tables = jsonData.Boards;
        
        // Tìm kiếm người dùng trong mảng
        const foundUser = tables.find(user => user.id === un);
        // Nếu người dùng được tìm thấy, thay đổi thuộc tính isCreator
         if (foundUser) {
              foundUser.status = value;
              const rs=db.update(jsonData);
              if (value=="end"){
                 Users.changeStatus(foundUser.creator,false);
              }
         
        
         
     } else {
            console.log(`Table ${un} not found`);
      }
    }
}