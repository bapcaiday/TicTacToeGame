const express=require('express');
const route=express.Router();

const AuthController=require('../controllers/authController');

route.post('/login',AuthController.check);
route.post('/signup',AuthController.store);
route.get('/login',AuthController.login);
route.get('/signup',AuthController.signup);


module.exports=route;