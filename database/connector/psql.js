module.exports = function(config){
    /*
     * IF NO NAME RETURN NULL
     */
    if(config.name.length == 0) return null;

    var psqlBuilderFunction      = require('./../queryBuilder/psqlQueryBuilder');
    var psqlBuilder              = new psqlBuilderFunction;

    var call = function(){
        for(var i in makeAfterConnect){
            fn.sql(makeAfterConnect[i]);
        }
    };
    var makeAfterConnect = [];

    var fn = require('./connector');
    {
        fn.isOpen = function(){
            return pgclient != null;
        };
        fn.sqlQuery= function(query){
            return false;
        };
        fn.sql = function(q){
            if(!q.query) return null;

            if(!is_string(q.query)){
                var d = psqlBuilder.run(q.query);
                //console.log(d);
                q.query = d.query;
                q.data = d.data;
            }
            if(!this.isOpen()){
                makeAfterConnect.push(q);
                return null;
            }
            if(/^(INSERT|UPDATE|CREATE|DROP|ALTER)/i.test(q.query)){
                var done = pgclient.query(q.query, q.data);
                if(done){
                    if(q.success && is_function(q.success))q.success(done)
                }else{
                    if (q.error) q.error(done);
                }
            }else {
                pgclient.query(q.query, q.data, function (err, result) {
                    if (err) {
                        if (!q.error)
                            throw err;
                        else
                            q.error(err);
                    }
                    else if (q.success && is_function(q.success) && result) q.success(result.rows, result.fields);

                });
            }
            return this;
        };
        fn.close = function(){
            pgdone();
        }
    };

    /*
     * REQUIRED PG MODULE FOR THE CONNECTION WITH PLSQL
     */
    var pg = require('pg');

    /*
     * CREATE A CONNECTION STRING
     */
    var conString = "postgres://"+config.user+":"+config.password+"@"+config.host+":"+config.port+"/";

    /*
     * OPEN THE CONNECTION
     */
    var pgclient = null, pgdone = undefined, isload = false;

    pg.connect(conString+config.name, function(err, client, done) {
        if(err) {
            pg.connect(conString+'postgres', function(err, client, done) {
                if(err) {
                    isload = true;
                    console.error('postgres :: error fetching client from pool', err);
                }else{
                    /*
                     * IF config.createIfNotExist IS TRUE CREATE AUTOMATIQUALY DATABASE WITH config.name
                     * config.name is DATABASE NAME
                     *
                     * POSTGRES DATABASE SELECT
                     */
                    client.query('CREATE DATABASE '+ config.name, function (err) {
                        if (err) throw err;
                    });
                    client.end();

                    pg.connect(conString+config.name, function(err, client, done) {
                        isload = true;
                        if(err) console.error(config.name+' :: error fetching client from pool', err);
                        else {
                            pgclient = client;
                            pgdone = done;
                            call();
                            console.log('connected to ' + config.name + ' database!');
                        }
                    });
                }
            });
        }else{
            isload = true;
            pgclient = client;
            pgdone = done;
            call();
            console.log('connected to '+config.name+' database!');
        }
    });
    //console.log(client)

    /*
     * IF config.createIfNotExist IS TRUE CREATE AUTOMATIQUALY DATABASE WITH config.name
     * config.name is DATABASE NAME
     *
     * NOTE : NO DATABASE SELECT
     */
    if(config.createIfNotExist) {
        //client.query('CREATE DATABASE '+ config.name, function (err) {
        //    if (err) throw err;
        //});
    }

    //, function(err, client, done) {

    //
    //});

    return fn;
};