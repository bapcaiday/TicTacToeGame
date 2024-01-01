const express=require('express');
const route=express.Router();

const GameController=require('../controllers/gameController');


route.get('/index',GameController.index);
route.get('/ranking',GameController.ranking);
route.get('/create',GameController.create);
route.get('/play/:size',GameController.play);
route.get('/table/:id',GameController.start);

module.exports=route;