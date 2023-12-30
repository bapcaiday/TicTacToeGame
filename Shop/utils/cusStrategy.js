const passport = require('passport');
const { Strategy } = require('passport-strategy');
module.exports = class MyStrategy extends Strategy {
    constructor (AuthConfig, verify, options) {
        super();
        this.name = 'MyOauth2';
        this.verify = verify
        this.AuthConfig = AuthConfig;
        passport.strategies[this.name] = this;
    }
    authenticate(req, options) {
        if (req.body['isLogin']) {
            const queryOptions = {
                clientID: this.AuthConfig.clientID,
                clientSecret: this.AuthConfig.clientSecret,
                callbackURL: this.AuthConfig.callbackURL,
            }
            const authorizationURL = this.AuthConfig.authorizationURL;
            const queries = new URLSearchParams (queryOptions);
            const res = req.res;
            res.redirect(`${authorizationURL}?${queries}`);
        } else {
            const token = req.query.token;
            this.verify(token, (err,rs) => {
                console.log(rs);
                if(err) return this.fail(err);
                return this.success(rs);
            });
        }
    }
};