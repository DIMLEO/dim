module.exports = function(){

    var getFields = function(key){
        if($_GET[key]){
            return $_GET[key];
        }
        else if($_POST[key]){
            return $_POST[key];
        }
        else if($_FILES[key]){
            return $_FILES[key];
        }
        return null;
    };
    var fieldsExist = function(key){
        return $_GET[key] || $_POST[key] || $_FILES[key];
    };

    var file = function(data){
        return {
            isValid : function () {
                return data != undefined;
            },
            move : function (destination, filename) {

                var fs = require('fs');

                if(fs.statSync(destination).isDirectory()){

                    if(!filename) filename = data.originalFilename;

                    destination += '/'+filename;
                }
                fs.renameSync(data.path, destination);

                delete fs;
            },
            phpStruct : function(){
                return {
                    error : 0,
                    name : data.originalFilename,
                    type : data.headers['content-type'],
                    size : data.size,
                    tmp_name : data.path
                };
            },
            getRealPath : function(){
                return data.path;
            },
            getClientOriginalName : function(){
                return data.originalFilename;
            },
            getClientOriginalExtension : function(){
                return pathinfo(data.originalFilename, PATHINFO_EXTENSION);
            },
            getSize : function(){
                return data.size;
            },
            getMimeType : function(){
                return data.header['content-type'];
            }
        }
    };

    return {
        get : function (key, defaultv) {
            key = getFields(key);
            return (key)?key:defaultv;
        },
        has : function () {
            var key = arguments, yes = true;
            for(var i in key) {
                yes = yes && fieldsExist(key[i]);
                if(!yes) break;
            }
            return yes;
        },
        all : function () {
            return object_merge(object_merge($_GET, $_POST), $_FILES);
        },
        only : function () {
            var key = arguments, val = {};

            for(var i in key) val[key[i]] = getFields(key[i]);

            return val;
        },
        file : function (key, onlyDescription) {
            var f = ($_FILES[key] && $_FILES[key].length == 1)?$_FILES[key][0]:$_FILES[key];

            if(!onlyDescription) {
                if (is_array(f)) {
                    var fs = [];
                    for (var i in f)
                        fs = new file(f[i]);
                    return fs;
                }

                return new file(f);
            }
            return f;
        },
        hasFile : function(key){
            return $_FILES[key] != undefined;
        }
    }
}();