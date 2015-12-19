module.exports = Model = function(){
    var self = this;
    this.$tableName = '';
    this.$otherParams = {};
    this.$selectedField = [];
    this.$primaryKey = 'id';
    this.$collection = [];
    this.$fields = [];
    this.$iteratorIndex = 0;
    this.$callBack = undefined;
    this.$keyTransplant = [];
    this.$queue = undefined;
    this.$clause = {};
    this.$changeFields = {};
    this.$agregateFunction = ['sum', 'count', 'min', 'max', 'avg'];
    this.$useSoftDelete = true;
    this.$isModel = true;
    this.$AfterCreateMakeMe = undefined;
    this.$compiledAction = 'read';
    this.$lastValidation = undefined;

    this.$operator = {
        '>'     : '$gt',
        '<'     : '$lt',
        '>='    : '$gte',
        '<='    : '$lte',
        '!='    : '$ne',
        '='     : '$eq',
        '[]'    : '$between',
        '![]'   : '$nbetween'
    };


    this.$foreignKey = {};

    this.$idName = function(){
        return this.$extra['idName'];
    };
    this.$OrmJsonQuery = function(){
        var r = this.$otherParams, tb;
        if(r.table) tb = r.table;

        this.$selectOnlyRowWithDeleteAtNull();
        //console.log(this.$clause);
        r['where'] = this.$clause;
        r['table'] = this.$tableName;

        return r;
    };

    this.$call = function(callback){
        if(!is_function(callback)) return;
        this.$callBack = callback;
        this.$callBack();
    };

    this.$sof_delete = function(data){
        return (this.$extra && (!this.$extra.soft_delete || this.$extra.soft_delete === true))
    }
    this.$selectOnlyRowWithDeleteAtNull = function(data){
        if(this.$useSoftDelete && this.$sof_delete()){
            return;
            this.whereNull('delete_at')
        }
    };
    this.$autoDeleteColumn = function(data){
        if(!this.$extra.soft_delete || this.$extra.soft_delete === true) data.delete_at = new Date();
        return data;
    };
    this.$autoAupdateColumn = function(data){
        if(!e.update_at || e.update_at === true) data.update_at = new Date();
        return data;
    };

    this.$autoColumn = function(data){
        var e = this.$extra;
        if(!e.soft_delete || e.soft_delete === true) data.delete_at = null;
        if(!e.update_at || e.update_at === true) data.update_at = new Date();
        if(!e.create_at || e.create_at === true) data.create_at = new Date();
        delete e;

        if(this.$relations) {
            for (var field in data) {
                if(this.$relations[field]){
                    var r = this.$relations[field].toLowerCase();
                    var value = data[field];

                    if(r == 'manytoone' || r == 'onetoone'){
                        delete data[field];
                        data[field+'_'+self.$idName()] = (is_object(value) && value.$isModel)?value[self.$idName()]:value;
                    }
                    else{
                        this.$AfterCreateMakeMe = values;
                    }
                }
            }
        }
        //console.log(data);
        return data;
    };
    this.$init = function(key, d){
        if(d == undefined) d = [];
        if(!this.$otherParams[key]) this.$otherParams[key] = d;
    };
    this.$agrate = function($fn, name, as){

        this.$init('fields');

        var r = {};
        if(as != undefined)
            r[$fn] = {fields : name, as : as} ;
        else
            r[$fn] = name;

        this.$otherParams['fields'].push(r);
    }

    this.$getOperator = function(ope){
        return (this.$operator[ope])?this.$operator[ope]:ope;
    };
    this.$transplant = function(rows, fields, callback){
        this.$collection = rows;
        this.$fields = fields;
        this.$callBack = callback;
    };
    this.$exec = function(query, callback){
        $dbsm.sql({
            query: query,
            success : function(rows, fields){
                self.clear();
                self.$transplant(rows, fields, callback);

                self.next();
                if(is_function(self.$callBack)) {
                    self.$callBack();
                }
                if(self.$queue) self.$queue();

            }
        });
    };
    this.$implement = function(args, ope){
        if(ope == undefined) ope = '$and';
        if(args.length == 1){
            if(is_function(args[0])){
                var r =  new Model(),v = undefined, g = undefined;

                g = args[0](r);
                r = (g)?g:r;

                if(!r.$tableName){
                    console.log(r.$tableName.trim().length);
                    if (r.clause) v = r.clause()['$and'];

                    if (v != undefined) {
                        this.$clause[ope] = v;
                    }

                }else{
                    var f = r.$otherParams['fields'];
                    if(f == 'id') f = r.$tableName+'_'+self.$idName();
                    else if(f == this.$tableName.toLowerCase()+'_'+self.$idName()) f = 'id';

                    var q = {};
                    q[f] = {$subquery : r.query()};

                    this.$implement([q], ope);
                }
                //console.log(r.clause());
            }
            if(is_object(args[0])){
                if(!this.$clause[ope]) this.$clause[ope] = [args[0]];
                else this.$clause[ope].push(args[0]);
            }
            else if(is_array(args[0])){
                this.$clause[ope] = args[0];
            }
        }else{

            if(!this.$clause[ope]) this.$clause[ope] = [];

            if(args.length == 2){
                var r = {}, k = args[0];
                r[k] = args[1];
                this.$clause[ope].push(r);
            }
            else if(args.length == 3){
                var r = {}, k = args[0];
                r[k] = {};

                r[k][this.$getOperator(args[1])] = args[2];
                this.$clause[ope].push(r);
            }

        }
    };
    this.$getIn = function(args){
        var key = args[0];
        var values = [];
        for(var i = 1, c = args.length; i < c; i++){
            if(!is_array(args[i]))
                values.push(args[i]);
            else
                values = values.concat(args[i]);
        }

        return [key, values];
    };
    this.operatorHandler = function(args, $in, $ope){
        var r = this.$getIn(args), ar = {};

        ar[r[0]] = {}; ar[r[0]][$in]= r[1];

        this.$implement([ar], $ope);
    };

    this.clear =  function(){
        for(var i in this.$keyTransplant){
            delete this[this.$keyTransplant[i]];
        }
        this.$iteratorIndex = 0;
        this.$AfterCreateMakeMe = undefined;
        this.$otherParams = {};
        this.$collection = [];
        this.$keyTransplant = [];
        this.$changeFields = {};
        this.$queue = undefined;
        this.$clause = {};
        this.$useSoftDelete = true;

        return this;
    };
    this.queue = function(callback){
        this.$queue = callback;
        return this;
    };
    this.each =  function(callback){
        if(callback == undefined) return this;
        this.$iteratorIndex = 0;
        while(this.next()){
            this.$callBack = callback;
            if(this.$callBack(this.$iteratorIndex-1) === false){
                break;
            }
        }

        return this;
    };
    this.next =  function(){
        var r = this.$collection[this.$iteratorIndex];

        if(r == undefined) return false;

        for(var key in r){
            this[key] = r[key];
            this.$keyTransplant.push(key);
        }

        this.$iteratorIndex++;
        return true;
    };
    this.get = function(callback){

        this.$exec(this.$OrmJsonQuery(), callback);

        return this;
    };
    this.dontUseSoftDelete = function(){
        this.$useSoftDelete = false;
    };
    this.toJson = function(all){
        var r = (all == undefined || all == false)?this.$collection[this.$iteratorIndex-1]:this.$collection;
        return (r)?r:null;
    };
    this.rowCount = function(){
        return this.$collection.length;
    };

    this.isEmpty = function(){
        return this.$collection.length == 0;
    };

    this.all = function(callback){
       var r = {table : this.$tableName};
       this.$selectOnlyRowWithDeleteAtNull();
       if(!empty(this.$clause))
            r.where = this.$clause;
       this.$exec(r, callback);
       return this;
    };

    this.find = function(query, callback){
        var clause = {};

        if(is_object(query)){
            this.where(query);
        }else{
            this.where(this.$primaryKey, query);
        }
        this.$selectOnlyRowWithDeleteAtNull();

        this.$exec({table : this.$tableName, where : this.$clause}, callback);

        return this;
    };

    this.clause = function(){
        return this.$clause;
    };

    this.where = function(){
        var args = arguments;
        if(args.length == 0) return this;

        this.$implement(args, '$and');

        return this;
    };

    this.whereIn = function(){
        var args = arguments;
        if(args.length == 0) return this;
        //console.log(args)

        this.$implement(this.$getIn(args), '$and');

        return this;
    };

    this.orWhereIn = function(){
        var args = arguments;
        if(args.length == 0) return this;

        this.$implement(this.$getIn(args), '$or');
    };
    this.orWhere = function(callback){
        var args = arguments;
        if(args.length == 0) return this;

        this.$implement(args, '$or');

        return this;
    };
    this.whereBetween = function(){
        var args = arguments;
        if(args.length == 0) return this;

        this.operatorHandler(args, '$between', '$and');

        return this;
    };
    this.orWhereBetween = function(){
        var args = arguments;
        if(args.length == 0) return this;

        this.operatorHandler(args, '$between', '$or');

        return this;
    };
    this.whereNotBetween = function(){
        var args = arguments;
        if(args.length == 0) return this;

        this.operatorHandler(args, '$nbetween', '$and');

        return this;
    };
    this.orWhereNotBetween = function(){
        var args = arguments;
        if(args.length == 0) return this;

        this.operatorHandler(args, '$nbetween', '$or');

        return this;
    };
    this.whereNull = function(fields){
        var args = arguments;
        if(args.length == 0) return this;

        this.operatorHandler(args, '$null', '$and');

        return this;
    };
    this.whereNotNull = function(fields){
        var args = arguments;
        if(args.length == 0) return this;

        this.operatorHandler(args, '$nnull', '$and');

        return this;
    };
    this.orWhereNull = function(fields){
        var args = arguments;
        if(args.length == 0) return this;

        this.operatorHandler(args, '$null', '$or');

        return this;
    };
    this.orWhereNotNull = function(fields){
        var args = arguments;
        if(args.length == 0) return this;

        this.operatorHandler(args, '$nnull', '$or');

        return this;
    };


    this.groupBy = function(){
        var args = arguments;
        this.$init('group', {});
        if(args.length == 1) this.$otherParams['group'] = args[0];
        else this.$otherParams['group'] = args;
        return this;
    };

    this.orderBy = function(){
        var args = arguments;
        if(args.length == 0) return this;

        this.$init('order', {});

        if(args.length == 1) this.$otherParams['order'] = args;
        else{
            var length = args.length, last = args[length-1].toLowerCase(), key = '', values = [];
            if(last == 'desc' || last == 'asc'){
                length--;
                key = (last == 'desc')?'$desc':'$asc';
            }
            for(var j = 0; j < length; j++){
                if(is_array(args[j]))
                    values.contact(args[j]);
                else
                    values.push(args[j]);
            }

            if(key)
                this.$otherParams['order'][key] = values;
            else
                this.$otherParams['order'] = values;
        }

        return this;
    };

    this.having = function(){
        var args = arguments;
        this.$init('having', []);

        if(args.length == 1){
            if(is_function(args[0])){
                var r =  new Model();

                args[0](r);
                if(r.clause)r = r.clause();

                if(r != undefined){

                    this.$otherParams['having'] = r;

                }
            }
            else this.$otherParams['having'] = args[0];
        }
        else{
            var r = {};
            if(this.$agregateFunction.indexOf(args[0]) != -1){
                r['$'+args[0]] = {};
                r['$'+args[0]][args[1]] = {};
                r['$'+args[0]][args[1]][this.$getOperator(args[2])] = args[3];
            }
            else{
                r[args[0]] = {};
                r[args[0]][this.$getOperator(args[1])] = args[2];
            }
            this.$otherParams['having'].push(r);
        };
        return this;
    };
    this.limit = function(nb){
        this.$otherParams['limit'] = parseInt(nb);

        return this;
    };
    this.skip = function(nb){
        this.$otherParams['skip'] = parseInt(nb);

        return this;
    };
    this.take = function(nb){
        this.$otherParams['take'] = parseInt(nb);

        return this;
    };

    this.table = function(name, field){
        this.$init('table');

        if(field == undefined) field = '*';
        this.$otherParams['table'][name] = field;

        return this;
    };

    this.only = function(){
        var args = arguments;
        this.$init('fields');

        for(var i in args){
            if(is_array(args[i])){
                this.$otherParams['fields'].concat(args[i]);
            }
            else if(is_object(args[i]) && args[i].$isModel) this.$otherParams['fields'].push(args[i].$tableName.toLowerCase()+'_'+args[i].$extra['idName']);
            else this.$otherParams['fields'].push(args[i]);
        }
        return this;
    };
    this.count = function(name, as){

        this.$agrate('$count', name, as);

        return this;
    };
    this.avg = function(name, as){

        this.$agrate('$avg', name, as);

        return this;
    };
    this.sum = function(name, as){

        this.$agrate('$sum', name, as);

        return this;
    };
    this.min = function(name, as){

        this.$agrate('$min', name, as);

        return this;
    };
    this.max = function(name, as){

        this.$agrate('$max', name, as);

        return this;
    };

    this.create = function(description, callback){

        if(is_object(description)) description = this.$autoColumn(description);
        else{
            for(var i in description)
                description[i] = this.$autoColumn(description[i]);
        }

        var r = {compile : 'create', table : this.$tableName, data: description};

        this.$exec(r, function(){
            if(this.$AfterCreateMakeMe){
                self.$call(callback);
            }else{
                self.$call(callback);
            }
        });

        return this;
    };

    this.update = function(callback){
        this.$changeFields = this.$autoAupdateColumn(this.$changeFields);
        this.$exec({compile : 'update', change : this.$changeFields, table : this.$tableName, where: this.$clause}, callback);
        return this;
    };

    this.delete = function(callback){
        if(!this.$sof_delete())
            this.$exec({compile : 'delete', table : this.$tableName, where: this.$clause}, callback);
        else{
            this.$changeFields = {delete_at: new Date()};
            this.update(callback);
        }
        return this;
    };

    this.set = function(){
        var args = arguments;
        if(args.length == 0) return;

        if(args.length == 1){
            for(var field in args[0]){
                this.$changeFields[field] = args[0][field];
            }
        }
        else{
            this.$changeFields[args[0]] = args[1];
        }
        return this;
    };

    this.query = function(){

        return $dbsm.sqlQuery(this.$OrmJsonQuery());

    };
    this.of = function($model){
        if(is_object($model) && $model.$isModel){
            if(this.$relations && this.$relations[$model.$tableName.toLowerCase()]){
                var rel = this.$relations[$model.$tableName.toLowerCase()].toLowerCase();
                this.where($model.$tableName.toLowerCase()+'_'+self.$idName(), $model[$model.$extra['idName']]);
            }
        }
        return this;
    };


    this.validate = function(rules, data){
        if(!data) data = $Input.all();
        if(is_string(rules) && this.$validation[rules]) rules = this.$validation[rules];

        return this.$lastValidation = $Validation.make(rules, data);
    };
};