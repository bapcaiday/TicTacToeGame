require("dotenv").config();
const path=require('path');
const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const cookieparser=require("cookie-parser")
const port = process.env.GAME_PORT;
const bodyparser = require("body-parser");
const passport = require('passport');
const MyStrategy = require('./utils/cusStrategy');
const route=require("./routers");
const User = require('./models/user');
const jwt = require('jsonwebtoken');
app.use('/public/image',express.static(__dirname+'/public/image'));
app.use('/public/js',express.static(__dirname+'/public/js'));
app.use('/public/css',express.static(__dirname+'/public/css'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
//app.use(methodOverride('_method'));

app.engine(
    'hbs',
    exphbs.engine({
        extname: '.hbs',
    })
);
app.set('view engine','hbs');
app.set('views',path.join(__dirname,'views'));

const session=require('express-session')
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }));


app.use(cookieparser());

// Khởi tạo và sử dụng MyStrategy trong Passport
passport.use(new MyStrategy({
  clientID: '21185',
  clientSecret: '21185',
  callbackURL: 'http://localhost:21185/auth/login/callback',
  authorizationURL: 'https://localhost:3113/auth/login'
}, (token, done) => {
  var data;
      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          // Xử lý lỗi khi giải mã không thành công
          done(err);
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
      // res.cookie('token',token,{maxAge:data.tokenLife*1000||360000, httpOnly:true });
      done(null,user);
  // Xác thực token và gọi callback done
  // done(null, user) nếu xác thực thành công, done(err) nếu xác thực thất bại
}));

passport.serializeUser((user, done) => {
  done(null, user.username);
});
passport.deserializeUser(async (username, done) => {
  const user = await User.getByUn(username);

  done(null, user)
});

// Sử dụng Passport middleware trong ứng dụng Express
app.use(passport.initialize());
app.use(passport.session());

// Xử lý route đăng nhập
app.post('/auth/login', passport.authenticate('MyOauth2'));

// Xử lý callback khi xác thực thành công
app.get('/auth/login/callback', passport.authenticate('MyOauth2', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/login'
}));
route(app);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode | 500;
    res.status(statusCode).send(err.message);
  });

app.listen(port, () => console.log(`Shop server listening on port ${port}`));
  