const passport = require('passport');
const { Strategy } = require('passport-strategy');

module.exports = class MyStrategy extends Strategy {
    constructor(verify, options){
        super();
        this.name = 'thuS'; // Set a name for your strategy
        this.verify = verify; // Set the verify function for authentication
        // Any additional options or configuration can be handled here
        this.userNameField=(options && options.username) ? options.username:'username';
        this.passwordField=(options && options.password) ? options.password:'psw';
        passport.strategies[this.name] = this; // Register the strategy with
    }
    authenticate(req, options){
        const un=req.body[this.userNameField];
        const pw=req.body[this.passwordField];
        this.verify(un,pw,(err,user) => {
            if (err){
                return this.fail(err);
                
            }
            if (!user){
                return this.fail("invalid auth");
            }
            
            this.success(user);
        })
    }
};
