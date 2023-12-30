const jwt=require("jsonwebtoken");
const db=require("../db/config")
const User=require("../models/user");
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

    async play(req,res,next){
        try {
            const isLogin = !!req.cookies.token;
            if (isLogin) {
               const data=jwt.verify(req.cookies.token,process.env.SECRET_KEY);
                res.render('game/board',{isLogin:isLogin,username:data.username})
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