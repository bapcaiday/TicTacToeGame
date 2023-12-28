class AuthController{
    async login(req,res,next){ 
        //console.log(req.cookies.username);
        res.render('account/signin');
    }
}

module.exports=new AuthController;