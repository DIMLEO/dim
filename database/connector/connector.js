module.exports = {
    _params : {
        query : '',
        data: '',
        success: undefined,
        error : undefined
    },
    query : function(query){
        if(is_string(query))
            this._params.query = query;
        else
            throw new Error('query(): string required but '+(typeof query)+' is given');
    },
    data : function(data){
        if(!is_function(data))
            this._params.data = data;
        else
            throw new Error('data(): function can\'t be a function');
    },
    success : function(success){
        if(!is_function(success)){
            throw new Error('success() : function require but '+(typeof success)+' is given');
        }
        else this._params.data = success;
    },
    error : function(error){
        if(!is_function(error)){
            throw new Error('error() : function require but '+(typeof error)+' is given');
        }
        else this._params.data = success;
    },
    get : function(){
        this.sql(this._params);
    }
};