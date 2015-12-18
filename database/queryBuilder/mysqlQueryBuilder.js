module.exports = function(){

    this.data = [];

    this.$equivalent = {};
    this.$agregateFunction = ['$sum', '$count', '$min', '$max', '$avg'];

    this.groupByQueryBuilder = function($groupe){
        var query = undefined;
        if(is_string($groupe)){
            query = $groupe;
        }
        else if(is_array($groupe)){
            query = $groupe.join(',');
        }
        else if(is_object($groupe)){
            query = [];
            for(var i in $groupe)
                query.push(i+'.'+$groupe[i]);
            query = query.join(',');
        }
        return (query)?' GROUP BY '+query:'';
    };

    this.whereQueryBuilder = function($clause, $ologique, parent){
        if($ologique == undefined) $ologique = '$and';

        var query = [], d = undefined, related = '';

        if(is_array($clause)){
            var x = $clause;
            $clause = {};
            $clause[$ologique] = x;
        }

        var i = undefined, ccq = undefined;
        //ccq ==> current clause query

        for(i in $clause){
            i = i.toLowerCase();
            d = $clause[i];

            if(/^\$/.test(i)){
                if(i == '$and' || i == '$or' || this.$agregateFunction.indexOf(i) != -1) {
                    if(is_array(d)){
                        //Scope Query Container
                        var sqc = [];

                        for (var j in d) {

                            ccq = d[j];
                            var k = Object.keys(ccq)[0];

                            if(this.$agregateFunction.indexOf(k) != -1){
                                var cl = {}, cl2 = ccq[k], fields = Object.keys(cl2)[0];

                                cl[k] = fields;

                                cl = this.agregateMakerQueryBuilder(cl, false).toLowerCase();


                                ccq = {};

                                ccq[cl] = cl2[fields];
                            }
                            sqc.push('(' + this.whereQueryBuilder(ccq, undefined, j) + ')');
                        }

                        if(query.length > 0) related = (i == '$and')?' AND ':' OR ';

                        if(d.length > 1) {
                            if (i == '$or') query.push(related+' (' + sqc.join(' OR ') + ')');
                            else if (i == '$and') query.push(related+' (' + sqc.join(' AND ') + ')');
                            else {
                                var q = d;
                                //console.log(q);
                            }
                        }
                        else if(d.length == 1){
                            if (i == '$or') query.push(related+sqc.join(' OR '));
                            else if (i == '$and') query.push(related+sqc.join(' AND '));
                            else{
                                var q = d;
                                //console.log(q);
                            }
                        }
                    }
                    else{
                        query.push('(' + this.whereQueryBuilder(d, '$or', i) + ')');
                    }
                }
                else{
                    if(i == '$like'){
                        query.push(parent+' LIKE ? ');
                        this.data.push(d.addSlashes());
                    }
                    else if(i == '$regex'){
                        query.push(parent+' REGEX ? ');
                        this.data.push(d.addSlashes());
                    }
                    else if(i == '$gt'){
                        query.push(parent+' > '+d);
                    }
                    else if(i == '$gte'){
                        query.push(parent+' >= '+d);
                    }
                    else if(i == '$ne'){
                        query.push(parent+' != '+d);
                    }
                    else if(i == '$eq'){
                        query.push(parent+' = '+d);
                    }
                    else if(i == '$lt'){
                        query.push(parent+' < '+d);
                    }

                    else if(i == '$lte'){
                        query.push(parent+' <= '+d);
                    }
                    else if(i == '$between'){
                        query.push(parent+' BETWEEN '+((array_int(d))?' '+d.join(' AND '):' "'+d.join('" AND "')+'" '));
                    }
                    else if(i == '$nbetween'){
                        query.push(parent+' NOT BETWEEN '+((array_int(d))?' '+d.join(' AND '):' "'+d.join('" AND "')+'" '));
                    }
                    else if(i == '$null'){
                        query.push(parent+' IS NULL');
                    }
                    else if(i == '$nnull'){
                        query.push(parent+' IS NOT NULL');
                    }
                    else if(i == '$subquery'){
                        query.push(parent+' IN ('+d.query+')');
                        //this.data.concat(d.data);
                        for(var i in d.data){
                            this.data.push(d.data[i]);
                        }
                    }
                    else{

                    }
                }
            }
            else if(is_array(d)){
                query.push((array_int(d))?i+' IN ('+d.join(',')+')':i+' IN ("'+d.join('","')+'")');
            }
            else if(is_object(d)){
                query.push(this.whereQueryBuilder(d, undefined, i));
            }
            else{
                if(is_regexp(d)){
                    d = d.source;
                    if(d[0] == '^') d = d.slice(1);
                    else d = '%'+d;

                    if(d[d.length-1] == '$') d = d.substr(0, d.length-2);
                    else d += '%';

                    query.push(i+' LIKE ? ');
                    this.data.push(d);
                }
                else if(is_date(d)){
                    query.push(i+' = "'+dateFormat(d, 'Y-m-d H:M:s')+'"');
                    this.data.push(dateFormat(d, 'Y-m-d H:M:s'));
                }
                else{
                    query.push(i+' = ? ');
                    this.data.push(d);
                }
            }
        }

        var key = Object.keys($clause);

        return (!related)?query.join(($ologique == '$and')?' AND ':' OR '):query.join(' ');
    };

    this.setQueryBuilder = function(setValues){
        var q = [];
        for(var field in setValues){
            q.push(field+' = ?');
            this.data.push(setValues[field]);
        }
        return q.join(',');
    };

    this.orderQueryBuilder = function(order){

        var query = undefined;
        if(is_string(order)){
            query = order+' ASC';
        }
        else if(is_array(order)){
            query = order.join(',')+' ASC';
        }
        else if(is_object(order)){
            var k = Object.keys(order);
            if(k[0])k = k[0];

            var d = order[k];

            if(is_string(d)) query = d;
            else if(is_array(d)) query = d.join(',');

            query += ' '+((k == '$desc')?'DESC':'ASC');
        }

        return (query)?' ORDER BY '+query:'';
    };

    this.agregateMakerQueryBuilder = function($fields, as){

        var i = Object.keys($fields)[0];
        if(!/^\$/.test(i))return '';
        i = i.toLowerCase();
        d = $fields[i];
        if(as == undefined) as = true;

        //IF FUNCTION IS SUM
        if(i == '$sum'){
            if(is_string(d))
                return 'SUM('+d+') '+((as)?'AS as_'+d:'');
            else if(is_object(d)){
                if(is_string(d.fields))
                    return 'SUM('+ d.fields+') '+((d.as && as)?' AS '+d.as:'');
                else
                    return 'SUM('+ d.fields.join('+')+') '+((d.as && as)?' AS '+d.as:'');
            }
        }

        //IF FUNCTION IS AVG
        else if(i == '$avg'){
            if(is_string(d))
                return 'AVG('+d+') '+((as)?'AS as_'+d:'');
            else{
                return 'AVG('+ d.fields.join('')+') '+((d.as && as)?' AS '+d.as:'');
            }
        }
        //IF FUNCTION IN
        //COUNT, MAX, MIN
        else if(['$count', '$max', '$min'].indexOf(i) != -1){
            if(is_string(d))
                return i.replace(/^\$/, '').toUpperCase()+'('+d+') '+((as)?'AS as_'+d:'');
            else{
                return i.replace(/^\$/, '').toUpperCase()+'('+d.fields+')'+((d.as && as)?' AS '+d.as:'');
            }
        }
    };
    this.agregateQueryBuilder = function($fields){

        var str = [];

        //function description and params
        var d = undefined, b = undefined;

        //function name
        var i = undefined;

        for(i in $fields){
            if(!is_string($fields[i])) {
                b = this.agregateMakerQueryBuilder($fields[i]);
                if (b) str.push(b);
            }
            else str.push($fields[i]);
        }

        return str;
    };

    this.readQueryBuilder = function($query){
        var query = 'SELECT ';

        var table = $query.table;
        var fields = ($query.fields)?$query.fields:' * ';

        if(is_array(fields)) fields = this.agregateQueryBuilder(fields);

        if(is_object(table)){
            var f = [], fields = (fields == '*')?[]:fields;
            table = Object.keys(table).join(',');
            for(i in table){
                f = table[i];
                for(j in f){
                    fields.psuh(i+'.'+f[j]);
                }
            }
        }

        if(is_array(table)){
            table = table.join(',');
        }

        if(is_array(fields)) fields = fields.join(',');

        var where = undefined;
        if($query.where) where = this.whereQueryBuilder($query.where);

        var group = '';
        if($query.group) group = this.groupByQueryBuilder($query.group);

        var having = '';
        if($query.having) having = this.whereQueryBuilder($query.having);

        var order = '';
        if($query.order) order = this.orderQueryBuilder($query.order);

        return {
            query : 'SELECT '+(($query.$distinct)?'DISTINCT':'')
            +fields+' FROM '+table+' '
            +((where)?' WHERE '+where:'')
            +' '+group
            +((having)?' HAVING '+having:'')
            +' '+order
            +(($query.limit)?' LIMIT 0, '+$query.limit:'')
            +(($query.skip)?' LIMIT '+$query.skip+' , '+$query.take:''),
            data : this.data
        };
    };

    this.updateQueryBuilder = function($query){
        var where = undefined, setValues = undefined;
        if($query.change) setValues = this.setQueryBuilder($query.change);
        if($query.where) where = this.whereQueryBuilder($query.where);
        return {
            query : 'UPDATE '+$query.table+' SET '+((setValues)?' '+setValues:' ')+' '+((where)?' WHERE '+where:''),
            data : this.data
        }
    };
    this.deleteQueryBuilder = function($query){
        var where = undefined;
        if($query.where) where = this.whereQueryBuilder($query.where);
        return {
            query : 'DELETE FROM '+$query.table+' '+((where)?' WHERE '+where:''),
            data : this.data
        }
    };
    this.createQueryBuilder = function($query){

        if(count($query.data) == 0) return '';
        var fields = [], values = [], section = [], data = [], qdata = $query.data;

        fields = (is_array(qdata))?Object.keys(qdata[0]):Object.keys(qdata);

        for(var i in fields) section.push('?');
        section = '('+section.join(',')+')';

        if(is_array(qdata)){
            for(var i in qdata){
                values.push(section);
                for(var j in qdata[i])
                    data.push(qdata[i][j]);
            }
        }else{
            values.push(section);
            for(var j in qdata)
                data.push(qdata[j]);
        }

        return {
            query : 'INSERT INTO '+$query.table+'('+fields.join(', ')+') VAlUES'+values.join(',')+';',
            data : data
        }
    };

    this.run = function($query){
        this.data = [];
        if($query.table) $query.table = $query.table.toLowerCase();

        if($query.compile == undefined || $query.compile == 'read')
            return this.readQueryBuilder($query);
        else if($query.compile == 'create')
            return this.createQueryBuilder($query);
        else if($query.compile == 'delete')
            return this.deleteQueryBuilder($query);
        else if($query.compile == 'update')
            return this.updateQueryBuilder($query);

        return {};
    }

};