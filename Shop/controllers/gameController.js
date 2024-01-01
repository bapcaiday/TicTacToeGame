const jwt=require("jsonwebtoken");
const db=require("../db/config")
const User=require("../models/user");
const Board=require("../models/board");
const fs = require("fs");



class GameController{
    async index(req,res,next){
        try {
            const isLogin = !!req.cookies.token;
            if (isLogin) {
                const data=jwt.verify(req.cookies.token,process.env.SECRET_KEY);
                res.render('homepage',{isLogin:isLogin,username:data.username});
            }
            else{
                res.redirect("/");
            }
          } catch (error) {
            next(error);
          }
        
    }

    async create(req,res,next){
        try {
            
            const isLogin = !!req.cookies.token;
            if (isLogin) {
               const data=jwt.verify(req.cookies.token,process.env.SECRET_KEY);
                res.render('game/create',{isLogin:isLogin,username:data.username})
            }
            else{
                res.redirect("/");
            }
          } catch (error) {
            next(error);
          }
        
    }

    async start(req,res,next){
      try {
        
          const isLogin = !!req.cookies.token;
          if (isLogin) {
            const data=jwt.verify(req.cookies.token,process.env.SECRET_KEY);

            const idBoard=parseInt(req.params.id);

            const currentBoard=Board.getByUn(idBoard);
            if (currentBoard && (currentBoard.status=="create" || currentBoard.status=="waiting" ))
            {
              if (currentBoard.player==null || currentBoard.creator==data.username){
                if (currentBoard.size==3){
                  res.render('game/board3x3',{isLogin:isLogin,username:data.username, table: idBoard})
                 }
                 else if (currentBoard.size==4){
                  res.render('game/board4x4',{isLogin:isLogin,username:data.username, table: idBoard})
                 }
              }
              else{
                console.log("Board is full!");
                res.redirect('/game/index');
              }
            }
            else {
              console.log("Table unfound or had started");
              res.redirect('/game/index');
            }

             
              
          }
          else{
              res.redirect("/");
          }
        } catch (error) {
          next(error);
        }
      
  }

    async play(req,res,next){
        try {
            const index=Board.getLastId();
            const size=req.params.size;
          
            const isLogin = !!req.cookies.token;
            if (isLogin) {
               const data=jwt.verify(req.cookies.token,process.env.SECRET_KEY);
               const currentUser=User.getByUn(data.username);

               if (!currentUser.isCreator){
                const newBoard=new Board({
                  id:index,
                  status:"create",
                  creator:data.username,
                  player:null,
                  size:size,
                  winner: null
                 });
                 const rs=Board.insert(newBoard);  

                 User.changeStatus(data.username,true);

                 res.redirect(`/game/table/${index}`);
               }
               else{
                console.log("User is creating table");
                res.redirect('/game/index');
               }

            }
            else{
                res.redirect("/");
            }
          } catch (error) {
            next(error);
          }
        
    }

    async ranking(req,res,next){
      try {
        const isLogin = !!req.cookies.token;
        if (isLogin) {
            const users=db.getAll().Users;
            users.sort(function(a,b){
              return b.scores - a.scores;
            });
            var topPlayers = users.slice(0, 3);
            const data=jwt.verify(req.cookies.token,process.env.SECRET_KEY);
            res.render('ranking',{isLogin:isLogin,users:topPlayers, username: data.username});
        }
        else{
            res.redirect("/");
        }
      } catch (error) {
        next(error);
      }
    }
   
}

module.exports=new GameController;