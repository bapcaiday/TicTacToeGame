const express=require('express');
const route=express.Router();

const AuthController=require('../controllers/authController');

route.get('/login',AuthController.login);
route.get('/logout',AuthController.logout);
route.get('/callback',AuthController.callback);
route.get('/',AuthController.home);

module.exports=route;