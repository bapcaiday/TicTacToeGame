const express=require('express');
const route=express.Router();

const AuthController=require('../controllers/authController');

route.get('/login',AuthController.login);


module.exports=route;