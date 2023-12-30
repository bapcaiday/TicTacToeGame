const db = require("../db/config");
const bcrypt = require("bcrypt");
const User=require('../models/user')
const jwt=require("jsonwebtoken")

class AuthController{
    async login(req,res,next){ 
        res.render("account/signin", {
            clientQuery: req.query
        });
    }

    async signup(req,res,next){ 
        res.render("account/signup");
    }

    async check(req,res,next){ 
        try{
            const { username, password, tokenLife } = req.body;
            const user=User.getByUn(username);
        if (!user){
            return res.status(401).json({ msg: "Tên đăng nhập không tồn tại." });
        }

        let isPasswordValid =await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
           return res.status(401).json({ msg: "Mật khẩu không chính xác." });
        }
        const token_auth=jwt.sign({username:user.username},process.env.SECRET_KEY, { expiresIn: tokenLife || process.env.ACCESS_TOKEN_LIFE});
        res.cookie('token',token_auth,{maxAge:tokenLife*1000||360000, httpOnly:true });
        const token = jwt.sign({username:user.username,fullname:user.fullname,avatar:user.avatar,tokenLife: tokenLife},process.env.SECRET_KEY);
        return res.json({
            msg: "thanh cong",
            token: token,
        })
        }
        catch (error){
            next(error);
        }

    }
    async store(req,res,next){
        try{
           const { username, password, fullname } = req.body;
           const image="";
           const user=User.getByUn(username);
           if (user){
             res.status(409).json({ msg: "Tên tài khoản đã tồn tại." });
           }
           else{
            
            const hashPassword =await bcrypt.hash(password,parseInt(process.env.SALT_ROUNDS));
            
            const newUser=new User({
                username:username,
                password:hashPassword,
                fullname:fullname,
                avatar:image
            });
            const rs=User.insert(newUser);
            if (!rs){
                return res.status(400).json({
                    msg: "Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.",
                  });
            }
            res.send("Sign up successfully");
            }
        }
        catch(error){
            next(error);
        }
    }
}

module.exports=new AuthController;