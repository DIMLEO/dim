
module.exports = function(params, models){
    var config = params.connections[params.default];
    var driver = params.default;
    var endModels = {}, endQuery = [], associationTable = {};

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
        
        if(endModels == undefined || !query.foreignKey.length > 0){
            dbsm.sql({
                query: query.query,
                success: function (r) {
                    console.log(' done');
                    consoleMarker('end of table ' + index);
                    modelCreator(++current_index_in_model);
                },
                error: function (r, err) {
                    console.log(endModels, query.foreignKey);
                    console.log(' crashed');
                    console.log(err);
                    consoleMarker('end of table ' + index);
                }
            });
        }else{
            endModels[index] = query.foreignkey;
            console.log(' presence of foreign key, creating the table refer to the end');
            consoleMarker(' crashed of table ' + index);
            modelCreator(++current_index_in_model);
        }
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
        dbsm.sql({
            query: endQuery.join(';')
        })
    }

    var current_index_in_model = 0;
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
        console.log(' Search the '+index+' table');
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
                                //modelHandler(index, model);
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
        console.log('============================================================================>>'+str+'');
    };

    //console.log(config, driver);

    /*
     * load ther driver
     * automatically creating the database if the database does not exist
     */
    var dbsm = require('./connector/'+driver)(config);
    /*
     * load ther query builder
     */
    var builder = require('./builder/builder');

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
     *automatic processing models
     * Automatic Creation of the required tables
     * considered relations
     * set automatic update of the table structure
     * Column suppression, adding column
     */

     var models_keys = Object.keys(models);
     if(models_keys.length > 0)
        modelCreator(current_index_in_model);

    return dbsm;
};