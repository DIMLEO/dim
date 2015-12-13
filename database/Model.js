module.exports = function(){

    this.$db = undefined;

    this.$tablename = '';
    this.$prefix  = '';

    this.$columns = [];
    this.$schema = {};
    this.$relation = {};
    this.$schema = {};


    this.definition = function($schema){
        this.$schema = $schema;
        for(var col in $schema)
            this.$columns.push(col);
    };

    this.relation = function($relation){
        var relation = undefined;
        for(var table in $relation){
            relation = $relation[table].toLowerCase();

            if(relation == 'onetomany'){

            }
            else  if(relation == 'onetoone'){

            }
            else  if(relation == 'manytoone'){

            }
            else  if(relation == 'manytomany'){

            }
        }
        delete relation;
    };

    this.extra = function($extra){
        this.$extra = $extra;
    };

    this.init = function(){

    }
};