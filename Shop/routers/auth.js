const express=require('express');
const route=express.Router();
const upload=require('../middlewares/upload');

const AuthController=require('../controllers/authController');

route.get('/login',AuthController.login);
route.get('/logout',AuthController.logout);
route.get('/callback',AuthController.callback);
route.get('/profile/:id',AuthController.profile);
route.put('/profile/:id',upload.single('avatar'),AuthController.edit);
route.get('/',AuthController.home);

module.exports=route;