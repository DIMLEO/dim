module.exports = function(schema, equivalent, models){

    if(!models.relations)
        models.relations = {};
    var query = '';

    var fn = require('./function');
    var defautExtra = require('./defaultExtra');

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
        var foreignKey = [], endQuery = [],  associationTable = [];

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

        var definition = [], endDefinition = [];

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
            if((new RegExp('\\b'+index+'\\b')).test(equivalent.keyswords)){
                throw new Error('a keyword '+index+' is used by the data base management system');
                return;
            }
            definition.push(index+' '+fn.getDefinition(attrs[index], equivalent));
        }
        //console.log(definition)

        /*
         * add relatioons query if required
         */
        var relation = undefined;
        for(index in relations){
            relation = (relations[index])?relations[index].toLowerCase():'';
            if(relation == 'manytoone' || relation == 'onetoone'){
                foreignKey.push(index);
                definition.push(index+'_'+defautExtra.idName+' '+equivalent.datatype['int'].replace(/%size%/i, 11));
                endDefinition.push( equivalent.table.foreignkey.replace(/%colname%/ig, index+'_'+defautExtra.idName)
                    .replace(/%tablename%/ig, schema.name.toLowerCase())
                    .replace(/%fromtablename%/ig, index.toLowerCase())
                    .replace(/%fromcolname%/ig, defautExtra.idName));
                models.relations[index] = {
                    name : index+'_'+defautExtra.idName,
                    d : 'in',
                    n : (relation == 'manytoone')?'many':'one'
                };
            }
            else if(relation == 'onetomany'){
                foreignKey.push(index);
                var name = schema.name.toLowerCase();
                var alter = equivalent.table.alter.query.replace(/%tablename%/i, index);

                endQuery.push(alter+' '+equivalent.table.alter.add.replace(/%colname%/i, name+'_'+defautExtra.idName).replace(/%definition%/i,equivalent.datatype['int'].replace(/%size%/i, 11)));
                endQuery.push(alter+' '+equivalent.table.alter.foreignkey.replace(/%colname%/i, name+'_'+defautExtra.idName)
                                        .replace(/%tablename%/ig, index.toLowerCase())
                                        .replace(/%fromtablename%/ig, name)
                                        .replace(/%fromcolname%/ig, defautExtra.idName));
                models.relations[index] = {
                    table: index.toLowerCase(),
                    name : index+'_'+defautExtra.idName,
                    d : 'out',
                    n : many
                };
                delete name;
                delete alter;
            }
            else if(relation == 'manytomany' || is_object(relation)){
                var name = schema.name.toLowerCase();
                var iattrs = {};
                var relations = {};
                relations[name] = 'manytoone';
                relations[index] = 'manytoone';

                var model = {
                    name : name+'_'+index,
                    relations : relations
                };

                if(relation != 'manytomany'){
                    for(var i in relation){
                        iattrs[i] = relation[i];
                    }
                }
                model.attrs = iattrs;
                associationTable.push(model);

                delete name;
            }

        }

        if(indexes) {
            if (indexes.primary && !defautExtra.id) {
                if (is_string(indexes.primary)) {
                    definition.push('PRIMARY KEY (' + indexes.primary + ')');
                }
                else if (is_array(indexes.primary)) {
                    definition.push('PRIMARY KEY (' + indexes.primary.join(',') + ')');
                }
                else {
                    throw new Error('The value of indexes.primary must be string or array')
                }
            }
            if (indexes.unique) {
                if (is_string(indexes.unique)) {
                    definition.push('UNIQUE (' + indexes.unique + ')');
                }
                else if (is_array(indexes.unique)) {
                    for (index in indexes.unique) {
                        if (indexes.unique[index])
                            definition.push('UNIQUE (' + indexes.unique + ')');
                        else if (is_array) {
                            definition.push('UNIQUE (' + indexes.unique.join(',') + ')');
                        }
                        else {
                            throw new Error('The value of indexes.unique[child] must be string or array')
                        }
                    }
                }
                else {
                    throw new Error('The value of indexes.unique must be string or array')
                }
            }
            if (indexes.index) {
                if (is_string(indexes.index)) {
                    definition.push('UNIQUE (' + indexes.index + ')');
                }
                else if (is_array(indexes.index)) {
                    definition.push('UNIQUE (' + indexes.index.join(',') + ')');
                }
            }
        }

        query = query.replace(/%definition%/ig, array_merge(definition, endDefinition).join(','));
        query = {
            query : query,
            foreignKey : foreignKey,
            endQuery : endQuery.join(';'),
            associationTable : associationTable
        }
    }

    return query;
};