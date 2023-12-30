const authRouter=require('./auth')
const gameRouter=require('./game')


function route(app){
    app.use('/game',gameRouter);
    app.use('/',authRouter);
    
}

module.exports=route;