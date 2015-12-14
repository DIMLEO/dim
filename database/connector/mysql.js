module.exports = function(config){

    /*
     * IF NO NAME RETURN NULL
     */
    if(config.name.length == 0) return null;

    /*
     * REQUIRED MYSQL MODULE FOR THE CONNECTION WITH MYSQl
     */
    var mysql      = require('mysql');

    /*
     * CREATE NEW CONNEXION WITH PARAMS
     */

    var connection = mysql.createConnection({
        host     : config.host,
        user     : config.user,
        port     : config.port,
        password : config.password
    });

    /*
     * CONNECT TO MYSQL
     *
     * NOTE : NO DATABASE SELECT
     */
    connection.connect();


    /*
     * IF config.createIfNotExist IS TRUE CREATE AUTOMATIQUALY DATABASE WITH config.name
     * config.name is DATABASE NAME
     *
     * NOTE : NO DATABASE SELECT
     */
    if(config.createIfNotExist) {
        connection.query('CREATE DATABASE IF NOT EXISTS ' + config.name, function (err) {
            if (err) throw err;
        });
    }

    /*
     * CONNECT TO DATABASE
     */
    connection.query('USE ' + config.name, function (err) {
        if (err) throw err;
    });


    var connector = require('./connector');
    {
        connector.isOpen= function(){
            return connection != null;
        };
        connector.sql = function(q){
            if(!q.query) return null;
            if(/^(INSERT|UPDATE|CREATE|DROP)/i.test(q.query)){
                var done = connection.query(q.query, q.data);
                if(done){
                    if(q.success && is_function(q.success))q.success(done)
                }else{
                    if (q.error)
                        q.error(done);
                }
            }
            else {
                connection.query(q.query, q.data, function (err, rows, fields) {
                    if (err) {
                        if (!q.error)
                            throw err;
                        else
                            q.error(err);
                    }
                    else if (q.success && is_function(q.success) && rows && fields) q.success(rows, fields);
                });
            }
            return this;
        };
        connector.close = function(){
            connection.end();
        };
    }
    return connector;
};