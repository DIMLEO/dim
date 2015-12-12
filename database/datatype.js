module.exports = function(query){

    var description = {};
    /*
     * GET THE DATATYPE IF EXISTS
     */
    query.replace(/#([\S]+)\b/i, function(str, dataType){
        description['type'] = dataType;
        return ''
    })

    /*
     * GET THE NULLABLE VALUES IF EXISTS
     */
    .replace(/@(false|true)\b/i, function(str, nullable){
        description['null'] = ((nullable == 'false')?false:true);
        return'';
    })

    /*
     * GET THE SIZE VALUES IF EXISTS
     */
    .replace(/:([0-9]+)\b/i, function(str, size){
        description['size'] = parseInt(size);
        return '';
    })

    /*
     * GET THE DEFAULT VALUES IF EXISTS
     */
    .replace(/\$([\s\S]+)/i, function(str, value){
        description['default'] = value;
        return '';
    });

    return description;
};