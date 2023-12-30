const express=require('express');
const route=express.Router();

const GameController=require('../controllers/gameController');


route.get('/index',GameController.index);
route.get('/create',GameController.create);
route.get('/play',GameController.play);

module.exports=route;