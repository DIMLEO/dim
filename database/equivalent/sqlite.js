module.exports = {

    table : {
        create                  :'CREATE TABLE IF NOT EXISTS %tablename%(%definition%);',
        list                    :'SELECT name FROM sqlite_master WHERE type = "table";',
        list_field_name         :'name',
        describe                :'PRAGMA table_info(%tablename%)',
        describe_field_name     :'name',
        describe_field_type     :'type',
        describe_field_null     :'notnull',
        describe_field_key      :'pk',
        describe_field_default  :'dflt_value',
        describe_field_extra    :'',
        exists                  :"SELECT name FROM sqlite_master WHERE type='table' AND name='%tablename%';",
        exists_field_name       :'name',
        delete                  :'DROP TABLE IF EXISTS %tablename%;',
        rename                  :'ALTER TABLE %tablename% RENAME %table_newname%;',
        foreignkey              : ' FOREIGN KEY(%colname%) REFERENCES %fromtablename%(%fromcolname%)',
        alter : {
            query   :'ALTER TABLE %tablename% ',
            columns : {
                rename      :' CHANGE %colname% %new_colname% %definition%',
                add         :' ADD COLUMN %colname% %definition%',
                drop        :' DROP COLUMN %colname%',
                primary     :' ADD PRIMARY KEY (%colname%)',
                foreignkey  :' FOREIGN KEY (%colname%) REFERENCES %fromtablename%(%fromcolname%)'
            }
        },
        columns : {
            exist: "",
            exists_field_name : ''
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
        inc         :'INTEGER PRIMARY KEY',
        integer     :'INTEGER',
        int         :'INTEGER',
        mint        :'MEDIUMINT',
        sint        :'SMALLINT',
        tint        :'TINYINT',
        blob        :'BLOB',
        bool        :'TINYINT(1)',
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
    },
    keyswords: 'accessible add all alter analyze and as asc asensitive auto_increment bdb before berkeleydb between bigint binary blob both by call cascade case change char character check collate column columns condition connection constraint continue convert create cross current_date current_time current_timestamp current_user cursor database databases day_hour day_microsecond day_minute day_second dec decimal declare default delayed delete desc describe deterministic distinct distinctrow div double drop dual each else elseif enclosed escaped exists exit explain false fetch fields float float4 float8 for force foreign found frac_second from fulltext general grant group having high_priority hour_microsecond hour_minute hour_second if ignore ignore_server_ids in index infile inner innodb inout insensitive insert int int1 int2 int3 int4 int8 integer interval into io_thread is iterate join key keys kill leading leave left like limit linear lines load localtime localtimestamp lock long longblob longtext loop low_priority master_heartbeat_period master_server_id master_ssl_verify_server_cert match maxvalue mediumblob mediumint mediumtext middleint minute_microsecond minute_second mod modifies mysql natural not no_write_to_binlog null numeric on optimize option optionally or order out outer outfile precision primary privileges procedure purge range read reads read_write real references regexp release rename repeat replace require resignal restrict return revoke right rlike schema schemas second_microsecond select sensitive separator set show signal slow smallint some soname spatial specific sql sqlexception sqlstate sqlwarning sql_big_result sql_calc_found_rows sql_small_result sql_tsi_day sql_tsi_frac_second sql_tsi_hour sql_tsi_minute sql_tsi_month sql_tsi_quarter sql_tsi_second sql_tsi_week sql_tsi_year ssl starting straight_join striped table tables terminated then timestampadd timestampdiff tinyblob tinyint tinytext to trailing trigger true the undo union unique unlock unsigned update usage use user_resources using utc_date utc_time utc_timestamp values varbinary varchar varcharacter varying when where while with write xor year_month zerofill'

};