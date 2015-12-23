
$ModelBuilder = require('./builder/model');
$AbstractModel = require('./Model');
$Grammar = undefined;

module.exports = function(params, models){

    var allModels = {};

    var config = params.connections[params.default];

    var driver = params.default;

    var endModels = {}, endQuery = [], associationTable = {};

    var current_index_in_model = 0;

    var modelHandler = function(index, model){
        var query = '';
        for(var col in model.attrs){
            if(is_string(model.attrs[col])){
                model.attrs[col] = datatype(model.attrs[col]);
            }
        }
        models[index] = model;

        query = builder(model, equivalent, models);

        console.log(' creation .......');
        
        if(query.endQuery) endQuery.push(query.endQuery);
        if(query.associationTable.name){
            associationTable[query.associationTable.name] = query.associationTable;
        }

        if(endModels == undefined || (query.foreignKey.length == 0)){
            //console.log(query.query)
            dbsm.sql({
                query: query.query,
                success: function (r) {
                    if(!model.data){
                        endTable(index);
                    }
                    else{
                        //TODO DELOCALISE CE CODE
                            var nbLine = 0, ln = model.data.length;
                            console.log(' Inserting data into the '+index+' table');
                            process.stdout.write('0 %');
                            for(i in model.data){
                                var d = model.data[i], values = [], key = [], accesseur=[];
                                if(!model.extra || model.extra.create_at == undefined || model.extra.create_at) d.create_at =  new Date();
                                if(!model.extra || model.extra.update_at == undefined || model.extra.update_at) d.update_at =  new Date();
                                for(j in d){
                                    key.push(j);
                                    accesseur.push('?');
                                    values.push(d[j]);
                                }
                                dbsm.sql({
                                    query: 'INSERT INTO '+index+'('+ key.join(',')+') VALUES('+accesseur.join(',')+')',
                                    data: values,
                                    success : function(r){
                                        nbLine++;

                                        //START

                                        process.stdout.clearLine();
                                        process.stdout.cursorTo(0);
                                        process.stdout.write(' '+((nbLine/ln)*100).toFixed(2)+' %');

                                        //END
                                        if(((nbLine/ln)*100) == 100){
                                            process.stdout.write(' '+nbLine+' lines have been successfully registered');
                                            endTable(index);
                                        }
                                    },
                                    error : function(err){
                                        console.log(' the recording fail failure ', err);
                                    }
                                })
                            }
                        //TODO DELOCALISE THIS CODE
                    }
                },
                error: function (r, err) {
                    console.log(endModels, query.foreignKey);
                    console.log('\x1b[31m crashed\x1b[37m');
                    console.log(err);
                    consoleMarker('end of table ' + index);
                }
            });
        }else{
            endModels[index] = query.foreignKey;
            console.log(' presence of foreign key, creating the table refer to the end');
            consoleMarker(' crashed of table ' + index);
            modelCreator(++current_index_in_model);
        }
    };
    var endTable = function(index){
        console.log('\x1b[32m done\x1b[37m');
        consoleMarker('end of table ' + index);
        modelCreator(++current_index_in_model);
    };
    var endModelsMaker = function(){
        current_index_in_model = 0;

        var endModelsKeyAfterOrder = [], n = undefined, j = undefined;
        var isPresent = false;
        for(n in endModels){
            isPresent = false;
            var tables = endModels[n];

            for(j in tables){
                if(endModels[tables[j]] != undefined){
                    isPresent = true;
                    break;
                }
            }

            if(!isPresent){
                endModels[n] = undefined;
                endModelsKeyAfterOrder.push(n);
            }
        }

        for(n in endModels){
            if(endModels[n] != undefined)
                endModelsKeyAfterOrder.push(n);
        }

        models_keys = endModelsKeyAfterOrder;
        endModels = undefined;

        delete n;
        delete j;
        delete endModelsKeyAfterOrder;

        modelCreator(current_index_in_model);
    };
    var alterTable = function(){
        if(endQuery.length > 0) {
            for (var i in endQuery)
                dbsm.sql({
                    query: endQuery[i],
                    success : function(){
                        if(endQuery.length == i){
                            readyCaller();
                        }
                    }
                });
        }else{
            readyCaller();
        }
    }
    var modelCreator = function(index){
        if(index >= models_keys.length){
            if(endModels == undefined)
                alterTable();
            else
                endModelsMaker();
            return;
        }
        index = models_keys[index];
        var model = models[index];

        consoleMarker('begin table '+index);
        dbsm.table_exists(index, function(r){
            if(r){
                console.log(' the '+index+' table already exists');
                console.log(' Search for necessary changes in the '+index+' table');
                var smartanalyse = false;
                if(model.exists){
                    if(model.exists.recreate){
                        console.log(' deleting ......');
                        dbsm.table_drop(index,function(r, err){
                            if(r){
                                console.log(' deleting '+index+' table was made');
                                modelHandler(index, model);
                            }else{
                                console.log('crashed');
                                consoleMarker(' end of table '+index);
                            }
                        });
                    }else{
                        smartanalyse = true;
                    }
                }else{
                    smartanalyse = true;
                }
                if(smartanalyse){

                    //GET TABLE STRUCTURE
                    dbsm.describe(index,function(r, field){

                        if(!sbuilder) sbuilder = require('./builder/schema');

                        var column = undefined;

                        var attrs = sbuilder(model, equivalent);
                        var columns = Object.keys(attrs);
                        var theAlterQuerys = [], alter = equivalent.table.alter, altertable = undefined;

                        for(column in attrs){
                            if(!r[column]){
                                if(!altertable) altertable = alter.query.replace(/%tablename%/i, index);

                                console.log(' \x1b[33mthe '+column+' column should be added to the '+index+' table \x1b[37m');
                                theAlterQuerys.push(altertable+
                                    ' '+(alter.columns.add.replace(/%colname%/i, column)
                                    .replace(/%definition%/i, fn.getDefinition(attrs[column], equivalent))));
                            }
                            else{
                                if(!altertable) altertable = alter.query.replace(/%tablename%/i, index);

                                if(fn.getRealType(attrs[column], equivalent).toLowerCase() != r[column].type.toLowerCase()){
                                    console.log(' \x1b[31mthe type of the '+column+' column must be modified to '+fn.getRealType(attrs[column], equivalent)+' \x1b[37m');
                                    theAlterQuerys.push(altertable+
                                    ' '+(alter.columns.rename.replace(/%colname%|%new_colname%/ig, column)
                                        .replace(/%definition%/i, fn.getDefinition(attrs[column], equivalent))));
                                }
                            }
                        }
                        for(column in r){
                            if(!attrs[column]){
                                if(!altertable) altertable = alter.query.replace(/%tablename%/i, index);

                                console.log(' \x1b[31mthe '+column+' column must be removed from the '+index+' table \x1b[37m');
                                theAlterQuerys.push(altertable+' '+alter.columns.drop.replace(/%colname%/i, column));
                            }
                        }
                        if(theAlterQuerys.length == 0){
                            console.log(' no changes are required to the table');
                            endTable(index);
                        }else{
                            for(var i in theAlterQuerys)
                                dbsm.sql({
                                    query : theAlterQuerys[i],
                                    success: function(r){
                                        if(i == theAlterQuerys.length-1)
                                            endTable(index);
                                    }
                                });
                        }

                    });
                }
                delete smartanalyse;
            }
            else{
                console.log(' table not found');
                modelHandler(index, model);
            }
        });
    };
    var consoleMarker = function(str){
        console.log('\x1b[36m', "============================================================================>>"+str, '\x1b[37m');
    };
    var readyCaller = function(){
        if(dbsm.$readCallBack.length > 0) {
            for(var i in dbsm.$readCallBack){
                dbsm.$readCallBack[i]();
            }
        }
        dbsm.$readCallBack = [];
    };

    //console.log(config, driver);

    /*
     * load the driver
     * automatically creating the database if the database does not exist
     */
    var dbsm = require('./connector/'+driver)(config);

    /*
     * load the SQL BUILD QUERY driver
     */

    /*
     * load the SQL query builder
     */
    var builder = require('./builder/builder');

    /*
     * load the Schema JSON builder if required
     * by default is false
     */
    var sbuilder = undefined;
    /*
     * load the Schema JSON builder if required
     * by default is false
     */
    var fn = require('./builder/function');

    /*
     * load the equivalent query json
     */
    var equivalent = require('./equivalent/'+driver);


    dbsm.equivalent = equivalent;
    dbsm._config = config;

    /*
     * load the module to transcribe the shortcut definition
     * refer to Helper file
     * Line 24
     */
    var datatype = require('./datatype');

    /*
     * automatic processing models
     * Automatic Creation of the required tables
     * considered relations
     * set automatic update of the table structure
     * Column suppression, adding column
     */

    var models_keys = Object.keys(models);
    if(models_keys.length > 0) modelCreator(current_index_in_model);

    dbsm.$readCallBack = [];

    dbsm.ready = function(callback){
        dbsm.$readCallBack.push(callback);
    };

    return dbsm;
};