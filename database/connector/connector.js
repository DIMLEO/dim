module.exports = {
    equivalent : {},
    _config : {},
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
        return this;
    },
    data : function(data){
        if(!is_function(data))
            this._params.data = data;
        else
            throw new Error('data(): function can\'t be a function');
        return this;
    },
    success : function(success){
        if(!is_function(success)){
            throw new Error('success() : function require but '+(typeof success)+' is given');
        }
        else this._params.data = success;
        return this;
    },
    error : function(error){
        if(!is_function(error)){
            throw new Error('error() : function require but '+(typeof error)+' is given');
        }
        else this._params.data = success;
        return this;
    },
    get : function(){
        return this.sql(this._params);
    },

    tables : function(callback) {
        var self = this;
        self.sql({
            query: self.equivalent.table.list,
            success: function (r) {
                var list = [], field = self.equivalent.table.list_field_name.replace(/%dbname%/, self._config.name);
                for (var index in r) {
                    list.push(r[index][field]);
                }
                if (is_function(callback))callback(list);
            }
        });
        return this;
    },
    table_exists : function (name, callback) {
        this.tables(function (r) {
            //console.log(r);
            if (is_function(callback)) callback(r.indexOf(name.toLowerCase()) != -1);
        });
        return this;
    },
    table_drop : function(name, callback){
        var self = this;
        self.sql({
            query : self.equivalent.table.delete.replace(/%tablename%/i, name),
            success: function(r){
                if(callback)callback(true);
            },
            error: function(r){
                if(callback)callback(false, r);
            }
        })
    },
    describe : function(name, callback){
        var self = this;
        self.sql({
            query : self.equivalent.table.describe.replace(/%tablename%/i, name),
            success: function(r){
                if(callback){
                    var rpack = {};
                    for(var i in r){
                        var ri = r[i];
                        rpack[ri[self.equivalent.table.describe_field_name]] = {
                            type    : ri[self.equivalent.table.describe_field_type],
                            null    : ri[self.equivalent.table.describe_field_null],
                            extra   : ri[self.equivalent.table.describe_field_extra],
                            default : ri[self.equivalent.table.describe_field_default],
                            key     : ri[self.equivalent.table.describe_field_key]
                        };
                    }
                    callback(rpack);
                }
            }
        })
    }
};