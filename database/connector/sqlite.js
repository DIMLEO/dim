module.exports = function(config){
    /*
     * IF NO NAME RETURN NULL
     */
    if(config.name.length == 0) return null;

    /*
     * REQUIRED SQLITE3 MODULE FOR THE CONNECTION WITH SQLITE
     */
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database((config.memory)?':memory:':config.folder+'/'+config.name);
    db.serialize(function(){
        console.log('Database is open');
    });

    var connector = require('./connector');

    connector.isOpen = function(){
            return db != null;
        };
    connector.sql = function(q){
            if(!q.query) return null;

            if(/^CREATE/i.test(q.query)){
                db.run(q.query);
            }
            else if(/^(INSERT|UPDATE)/i.test(q.query)){
                var stmt = db.prepare(q.query);
                stmt.run(q.data);
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
                    else if(q.success && is_function(q.success) && rows) q.success(rows, null);
                });

            }

        };
    connector.close = function(){
            db.close();
        };
    return connector;
};