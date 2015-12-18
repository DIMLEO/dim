module.exports = {
    getDefinition : function(attr, equivalent){
        return this.getRealType(attr, equivalent)+((attr.null)? ' NULL ' : ' NOT NULL ');
    },
    getRealType : function(attr, equivalent){
        var temp;

        var type = attr.type.toLowerCase();
        temp = equivalent.datatype[type];

        if(type == 'enum'){
            if(!attr.values) equivalent.defaultSize[type];
            temp = temp.replace(/%values%/ig, (is_string(attr.values))?attr.values:'"'+attr.join('","')+'"');
        }

        temp = temp.replace(/%size%/ig,(attr.size)?attr.size:equivalent.defaultSize[type]);

        return temp;
    }
};