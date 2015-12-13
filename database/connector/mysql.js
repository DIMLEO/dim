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
    /*

     $ npm install mysql

     connection.connect();

     connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
     if (err) throw err;
     console.log('The solution is: ', rows[0].solution);
     });

     connection.end();

     */
    return connection;

};