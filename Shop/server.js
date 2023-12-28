require("dotenv").config();
const path=require('path');
const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const cookieparser=require("cookie-parser")
const port = process.env.GAME_PORT;
const bodyparser = require("body-parser");

const route=require("./routers");

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

route(app);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode | 500;
    res.status(statusCode).send(err.message);
  });

app.listen(port, () => console.log(`Shop server listening on port ${port}`));
  