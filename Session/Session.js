var self = undefined;

module.exports = self = function(){ //es ===> express session

    //This function use the glabal variable $ExpressSESSION who contain express-sesssion
    var sesssion_expires = {};

    var expires = {};
    return {
        /*
         * @params string key
         * @params any value
         * @params int delay = 0
         */
        isStart : function(){
            return $ExpressSESSION.session != undefined;
        },
        ///Storing An Item In The Session
        put : function(key, value, delay){
            $ExpressSESSION.session.store[key] = value;
            if(delay && is_number(delay) && delay > 0){
                var vkey = self.id()+'_'+key;
                if($ExpressSESSION.session.expires[key]) clearTimeout(sesssion_expires[vkey]);
                sesssion_expires[vkey] = setTimeout(function(){
                    self.forget(key);
                    delete sesssion_expires[vkey];
                    delete $ExpressSESSION.session.expires[key];
                }, delay);
            }
        },
        //Push A Value Onto An Array Or Object Session Value
        //push : function(keys, value){
        //
        //},
        //Retrieving An Item Or Returning A Default Value
        get : function(key, defaultValue){
            if($ExpressSESSION.session.store[key]){
                return $ExpressSESSION.session.store[key];
            }
            if(defaultValue) return defaultValue;
            else throw new Error('index '+key+' not exists in session');
        },
        //Retrieving An Item And Forgetting It
        pull : function(key, defaultValue){
            var value = this.get(key, defaultValue);
            if($ExpressSESSION.session.store[key]){
                delete $ExpressSESSION.session.store[key];
            }
            return value;
        },
        //Retrieving All Data From The Session
        all : function(){
            return $ExpressSESSION.session.store;
        },
        //Determining If An Item Exists In The Session
        has : function(key){
            return $ExpressSESSION.session.store[key] != undefined;
        },
        //Removing An Item From The Session
        forget : function(key){
            delete $ExpressSESSION.session.store[key];
        },
        //Removing All Items From The Session
        flush : function(){
            var args = arguments;
            for(var i in args)
                delete $ExpressSESSION.session.store[args[i]];
        },
        //same action of flush
        clear : function(){
            self.flush();
        },
        //Regenerating The Session ID
        regenerate : function(){
            var old = this.id();
            $ExpressSESSION.regenerate(function(err) {
                $Auth.changeSession(old, self.id());
                delete old;
            });
        },
        //Sometimes you may wish to store items in the session only for the next request
        //flash : function(){
        //
        //},
        //Reflashing The Current Flash Data For Another Request
        //reflash : function(){
        //
        //},
        //Reflashing Only A Subset Of Flash Data
        //keep : function(keys){
        //
        //},
        //get the .sessionID
        id : function(){
            return $ExpressSESSION.id;
        }

    }

}();