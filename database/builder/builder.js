module.exports = function(schema, equivalent, models){

    var query = '', endQuery = '';

    var defautExtra = {
        id : true,
        idName: 'id',
        create_at : true,
        soft_delete : true,
        update_at : true
    };

    /*
     * when the type keys exists and value is query
     * the builder make a query like
     * select, insert, update, drop, delete or other
     * but not create
     */
    if(schema.type && schema.type == 'query'){


    }
    /*
     * create or alter table query
     *
     */
    else{
        query  = equivalent.table.create;
        endQuery = '';

        var attrs = schema.attrs;
        var relations = schema.relations;
        var indexes = schema.indexes;
        var extra = schema.extra;

        var index = undefined;

        query = query.replace(/%tablename%/i, schema.name.toLowerCase());

        if(extra)
            for(index in extra){
                defautExtra[index] = extra[index];
            }

        var definition = [], attr = undefined, temp = '', type = '';

        /*
         * if is true add id auto_increment column
         */
        if(defautExtra.id){
            definition.push(defautExtra.idName+' '+equivalent.datatype['inc']);
        }

        /*
         * if is true add delete_at column for soft delete
         */
        if(defautExtra.soft_delete){
            definition.push('delete_at '+equivalent.datatype['timestamp']+' NULL');
        }

        /*
         * if is true add create_at
         */
        if(defautExtra.create_at){
            definition.push('create_at '+equivalent.datatype['timestamp']+' NOT NULL');
        }

        /*
         * if is true add update_at
         */
        if(defautExtra.update_at){
            definition.push('update_at '+equivalent.datatype['timestamp']+' NOT NULL');
        }

        for(index in attrs){
            attr = attrs[index];
            type = attr.type.toLowerCase();
            temp = equivalent.datatype[type];

            if(type == 'enum'){
                if(!attr.values) equivalent.defaultSize[type];
                temp = temp.replace(/%values%/i, (is_string(attr.values))?attr.values:'"'+attr.join('","')+'"');
            }

            temp = temp.replace(/%size%/i,(attr.size)?attr.size:equivalent.defaultSize[type]);

            temp += (attr.null)? ' NULL ' : ' NOT NULL ';

            definition.push(index+' '+temp);
        }

        /*
         * add relatioons query if required
         */
        for(index in relations){

        }

        for(index in indexes){

        }

        query = query.replace(/%definition%/i, definition.join(','));
        query = {
            query : query,
            endQuery : endQuery
        }
    }

    return query;
};