module.exports = function(){

    var keyInSession = '__auth__';
    var allVUser = {};
    return{
        changeSession : function(oldSession, newSession){
            if(allVUser[oldSession]){
                var u = allVUser[oldSession];
                delete allVUser[oldSession];
                allVUser[newSession] = u;
            }
        },
        attempt : function(data){
            if(!$Session.isStart()){
                throw new Error('Session is not start');
            }
            var user, password,
                    callback_success = data.success,
                    callback_error = data.error;

            if(data.loginUsingId) {
                clause['id'] = data.loginUsingId;
            }
            else if(data.user){
                if (authBy == 'email' || authBy == 'login-email')
                    clause[$Environement.auth.email_colname] = data.user[$Environement.auth.email_colname];
                else
                    clause[$Environement.auth.login_colname] = data.user[$Environement.auth.login_colname];

                clause[$Environement.auth.login_colname] = data.user.passsword;
            }
            else{
                user = data.user, password = data.password;
                var vUser = undefined;
                if ($Environement.auth.model == 'User')
                    vUser = new User();
                else
                    vUser = eval('return new ' + $Environement.auth.model + '();');

                var clause = {}, authBy = $Environement.auth.authBy;

                var reg = new RegExp('^[a-zA-Z\\.0-9_-]+@[a-zA-Z0-9_-]{2,}\\.[a-z]{2,4}$', 'ig');
                if (reg.test(user) && (authBy == 'email' || authBy == 'login-email')) {
                    clause[$Environement.auth.email_colname] = user;
                }
                else if (authBy == 'login' || authBy == 'login-email') {
                    clause[$Environement.auth.login_colname] = user;
                }

                if (empty(clause))
                    throw new Error('User is required fot the authentification')

                clause[$Environement.auth.password_colname] = password;
                //clause[$Environement.auth.password_colname] = $Hash.make(password);
            }
            vUser.where(clause).get(function(){
                            if(this.rowCount() > 0){
                                allVUser[$Session.id()] = vUser;
                                callback_success();
                            }
                            else callback_error();
                        });

        },
        user : function(){
            return allVUser[$Session.id()];
        },
        id : function(){
            return this.use().id;
        },
        check : function(id){
            if(id != undefined){
                return this.id() == id;
            }
            return this.user() != undefined;
        },
        guest : function(){
            return !this.check();
        },
        logout: function(){
            if(allVUser[$Session.id()])
                delete allVUser[$Session.id()];
        }
    };
}();