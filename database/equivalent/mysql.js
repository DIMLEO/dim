module.exports = {

    table : {
        create                  :'CREATE TABLE IF NOT EXISTS %tablename%(%definition%)',
        list                    :'SHOW TABLES',
        list_field_name         :'Tables_in_%dbname%',
        describe                :'DESCRIBE %tablename%',
        describe_field_name     :'Field',
        exists                  :"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '%tablename%' AND TABLE_SCHEMA = '%dbname%'",
        exists_field_name       :'TABLE_NAME',
        delete                  :'DROP TABLE %tablename%',
        rename                  :'ALTER TABLE %tablename% RENAME %table_newname%',
        alter : {
            query   :'ALTER TABLE %tablename% ',
            columns : {
                rename      :'CHANGE %tablename% %table_newname% %definition%',
                add         :' ADD %colname% %definition% ',
                drop        :'DROP COLUMN %colname%',
                primary     :'ADD PRIMARY KEY (%colname%)'
            }
        },
        columns : {
            exist: "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '%dbname%' AND TABLE_NAME = '%tablename%' AND COLUMN_NAME = '%name%' ORDER BY ORDINAL_POSITION ",
            exists_field_name : 'COLUMN_NAME'
        }
    },
    operator : {
        '='         :'=',
        '<'         :'<',
        '>'         :'>',
        '<='        :'<=',
        '>='        :'>=',
        '<>'        :'<>',
        '!='        :'!=',
        'not'       :'NOT',
        'xor'       :'XOR',
        '%'         :'MOD',
        'like'      :'like',
        'not like'  :'NOT LIKE',
        'between'   :'BETWEEN',
        'regexp'    :'REGEXP',
        '&'         :'AND',
        '|'         :'OR',
        '#'         : undefined,
        '<<'        : "<<",
        '>>'        : ">>"
    },
    datatype: {
        inc         :'INTEGER PRIMARY KEY AUTO_INCREMENT',
        int         :'INT(%size%)',
        mint        :'MEDIUMINT',
        sint        :'SMALLINT',
        tint        :'TINYINT',
        blob        :'BLOB',
        bool        :'BOOLEAN',
        char        :'CHAR(%size%)',
        text        :'TEXT',
        string      :'VARCHAR(%size%)',
        float       :'FLOAT',
        double      :'DOUBLE',
        enum        :'ENUM(%values%)',
        date        :'DATE',
        datetime    :'DATETIME',
        timestamp   :'TIMESTAMP',
        time        :'TIME'
    },
    defaultSize: {
        int         : 11,
        char        : 1,
        string      : 255,
        enum        : [0, 1]
    }

};