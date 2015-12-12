module.exports = function(params){
    var config = params.connections[params.default];
    var driver = params.default;

    $datatype = require('./datatype');

    console.log(config, driver);

    $connection = require('./connector/'+driver)(config);

    return 'oki';
};