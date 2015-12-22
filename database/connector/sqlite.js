module.exports = function(config){
    /*
     * IF NO NAME RETURN NULL
     */
    if(config.name.length == 0) return null;

    /*
     * REQUIRED SQLITE3 MODULE FOR THE CONNECTION WITH SQLITE
     */
    var sqlite3 = require('sqlite3').verbose();

    var sqliteBuilderFunction      = require('./../queryBuilder/sqliteQueryBuilder');
    var sqliteBuilder              = new sqliteBuilderFunction;

    var db = new sqlite3.Database((config.memory)?':memory:':config.folder+'/'+config.name);
    db.serialize(function(){
        console.log('Database is open');
    });

    var connector = require('./connector');

    connector.isOpen = function(){
            return db != null;
        };
    connector.sqlQuery= function(query){
        return false;
    };
    connector.sql = function(q){
            if(!q.query) return null;
            if(!is_string(q.query)){
                var d = sqliteBuilder.run(q.query);
                //console.log(d);
                q.query = d.query;
                q.data = d.data;
            }

            if(/^(CREATE|INSERT|UPDATE|DROP|ALTER)/i.test(q.query)){
                var stmt = db.prepare(q.query);
                stmt.run(q.data, function(err){
                    if(err){
                        if(q.error && is_function(q.error)) q.error(err);
                    }else{
                        if(q.success && is_function(q.success)) q.success();
                    }
                });
            }
            else {
                var rows = [], errors = [];
                db.each(q.query, q.data, function (err, row) {
                    if (err)
                        errors.push(err);
                    else
                        rows.push(row);
                }, function(){
                    if(errors.length > 0) {
                        if (!q.error)
                            throw err;
                        else
                            q.error(err);
                    }
                    else if(q.success && is_function(q.success) && rows){
                        var field = [];
                        if(rows[0]){
                            field = Object.keys(rows[0]);
                        }
                        q.success(rows, field);
                    }
                });

            }
            return this;
        };
    connector.close = function(){
            db.close();
        };
    return connector;
};