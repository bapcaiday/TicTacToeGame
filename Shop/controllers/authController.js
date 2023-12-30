const jwt=require("jsonwebtoken");
const db=require("../db/config")
const User=require("../models/user")

class AuthController{

    async logout(req,res,next){
        try {
            const isLogin = !!req.cookies.token;
        
            if (isLogin) {
              res.clearCookie("token");
            }
        
            res.redirect("/");
          } catch (error) {
            next(error);
          }
    }

    async login(req,res,next){
        res.redirect('https://localhost:3113/auth/login');
    }
    async dashboard(req,res,next){
      res.render('dashboard');
  }

    async callback(req,res,next){
      const token = req.query.token;
      var data;
      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          // Xử lý lỗi khi giải mã không thành công
          return res.status(401).json({ msg: 'Invalid token' });
        }
        data=decoded;
        // Token hợp lệ, decoded chứa thông tin đã đặt vào token khi tạo
        //res.send({ msg: 'Token decoded successfully', data: decoded });
      });

      const newUser=new User({
        username:data.username,
        fullname:data.fullname,
        avatar:data.avatar
      });

      const user=User.getByUn(newUser.username);
      if (!user){
        const rs=User.insert(newUser);
        if (!rs){
            return res.status(400).json({
                msg: "Có lỗi trong quá trình đăng nhập, vui lòng thử lại.",
              });
       }
      }
      res.cookie('token',token,{maxAge:data.tokenLife*1000||360000, httpOnly:true });
      res.redirect("/")

    }

    async home(req,res,next){
        res.render('home');
    }
   
}

module.exports=new AuthController;