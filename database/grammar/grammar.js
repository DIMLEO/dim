module.exports = function(){
    var query = {
        compiled : 'create|insert|delete|update|drop|truncate',
        tables : ['', ''],
        columns : [],
        clause : {
            where : [],
            order : [],
            having : [],
            group : {
                columns : [],
                order : 'desc, asc'
            },
            limit : {
                column : '',
                start: 0,
                count : 0
            },
            joins : {
                direction : 'left|right|inner',
                query: 'Query',
                on : []
            }
        }

    }

};