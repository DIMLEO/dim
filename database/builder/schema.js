module.exports = function(model, equivalent){

    var defautExtra = require('./defaultExtra'), fn = require('./function'), index = undefined;

    if(model.extra)
        for(index in model.extra){
            defautExtra[index] = model.extra[index];
        }

    var build = {};
    build = model.attrs;
    //for(index in build){
    //    build[index]['type'] = fn.getRealType(build[index], equivalent);
    //}



    if(defautExtra.id){
        build[defautExtra.idName] = {type : equivalent.datatype['integer'], null : false, size : 11};
    }

    /*
     * if is true add delete_at column for soft delete
     */
    if(defautExtra.soft_delete){
        build['delete_at'] = {type : equivalent.datatype['timestamp'], null : true};
    }

    /*
     * if is true add create_at
     */
    if(defautExtra.create_at){
        build['create_at'] = {type : equivalent.datatype['timestamp'], null : false};
    }

    /*
     * if is true add update_at
     */
    if(defautExtra.update_at){
        build['update_at'] = {type : equivalent.datatype['timestamp'], null : false};
    }

    var relations = model.relations, relation = undefined;
    if(relations) {
        for (index in relations) {
            relation = relations[index].toLowerCase();
            if (relation == 'manytoone' || relation == 'onetoone') {
                build[index + '_' + defautExtra.idName] = {type: equivalent.datatype['integer']};
            }
        }
    }

    return build;

};