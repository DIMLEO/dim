module.exports = function(params, models){
    var config = params.connections[params.default];
    var driver = params.default;

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
     var model = undefined;
     var querys = [], query;
     for(var index in models){
         model = models[index];

         for(var col in model.attrs){
             if(is_string(model.attrs[col])){
                 model.attrs[col] = datatype(model.attrs[col]);
             }
         }
         models[index] = model;

         query = builder(model, equivalent, models);
         querys.push(query.endQuery);

         dbsm.sql({
             query : query.query,
             success: function(r){
                console.log(model.name+' table was created with success');
             },
             error : function(err){
                 console.log('error when attempting to create the table as '+model.name);
                 throw err;
             }
         });
     }
     delete model;


    return dbsm;
};