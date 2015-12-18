module.exports = {

    table : {
        create                  :'CREATE TABLE IF NOT EXISTS %tablename%(%definition%)ENGINE=INNODB;',
        list                    :'SHOW TABLES',
        list_field_name         :'Tables_in_%dbname%',
        describe                :'DESCRIBE %tablename%',
        describe_field_name     :'Field',
        describe_field_type     :'Type',
        describe_field_null     :'Null',
        describe_field_key      :'Key',
        describe_field_default  :'Default',
        describe_field_extra    :'Extra',
        exists                  :"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '%tablename%' AND TABLE_SCHEMA = '%dbname%'",
        exists_field_name       :'TABLE_NAME',
        delete                  :'DROP TABLE %tablename%',
        rename                  :'ALTER TABLE %tablename% RENAME %table_newname%',
        foreignkey              : 'CONSTRAINT fk_%tablename%_%colname% FOREIGN KEY (%colname%) REFERENCES %fromtablename%(%fromcolname%)',
        alter : {
            query   :'ALTER TABLE %tablename% ',
            columns : {
                rename      :'CHANGE %colname% %new_colname% %definition%',
                add         :' ADD %colname% %definition% ',
                drop        :'DROP COLUMN %colname%',
                primary     :'ADD PRIMARY KEY (%colname%)',
                foreignkey     : 'ADD CONSTRAINT fk_%tablename%_%colname% FOREIGN KEY (%colname%) REFERENCES %fromtablename%(%fromcolname%)'
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
        inc         :'INT PRIMARY KEY AUTO_INCREMENT',
        integer     :'INT',
        int         :'INT(%size%)',
        mint        :'MEDIUMINT',
        sint        :'SMALLINT',
        tint        :'TINYINT',
        blob        :'BLOB',
        bool        :'TINYINT(1)',
        char        :'CHAR(%size%)',
        text        :'TEXT',
        json        :'TEXT',
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
    },
    keyswords: 'accessible add all alter analyze and as asc asensitive auto_increment bdb before berkeleydb between bigint binary blob both by call cascade case change char character check collate column columns condition connection constraint continue convert create cross current_date current_time current_timestamp current_user cursor database databases day_hour day_microsecond day_minute day_second dec decimal declare default delayed delete desc describe deterministic distinct distinctrow div double drop dual each else elseif enclosed escaped exists exit explain false fetch fields float float4 float8 for force foreign found frac_second from fulltext general grant group having high_priority hour_microsecond hour_minute hour_second if ignore ignore_server_ids in index infile inner innodb inout insensitive insert int int1 int2 int3 int4 int8 integer interval into io_thread is iterate join key keys kill leading leave left like limit linear lines load localtime localtimestamp lock long longblob longtext loop low_priority master_heartbeat_period master_server_id master_ssl_verify_server_cert match maxvalue mediumblob mediumint mediumtext middleint minute_microsecond minute_second mod modifies mysql natural not no_write_to_binlog null numeric on optimize option optionally or order out outer outfile precision primary privileges procedure purge range read reads read_write real references regexp release rename repeat replace require resignal restrict return revoke right rlike schema schemas second_microsecond select sensitive separator set show signal slow smallint some soname spatial specific sql sqlexception sqlstate sqlwarning sql_big_result sql_calc_found_rows sql_small_result sql_tsi_day sql_tsi_frac_second sql_tsi_hour sql_tsi_minute sql_tsi_month sql_tsi_quarter sql_tsi_second sql_tsi_week sql_tsi_year ssl starting straight_join striped table tables terminated then timestampadd timestampdiff tinyblob tinyint tinytext to trailing trigger true the undo union unique unlock unsigned update usage use user_resources using utc_date utc_time utc_timestamp values varbinary varchar varcharacter varying when where while with write xor year_month zerofill'

};