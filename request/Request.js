module.exports = function(){

    return {
        path : function(){
            return $_REQUEST.path;
        },
        is : function(path){
            return $_REQUEST.path == path;
        },
        method : function(){
            return $_REQUEST.protocol;
        },
        isMethod : function(method){
            return $_REQUEST.protocol == method;
        },
        url : function(){
            return $_REQUEST.baseUrl;
        },
        secure : function(){
            return $_REQUEST.secure;
        },
        ajax : function(){
            return $_REQUEST.xhr;
        }
    }
}();