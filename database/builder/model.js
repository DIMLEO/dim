module.exports = function(name){

    name = name.ucfirst();

    var nbchar = function(char, nb){
        if(!nb) nb = 1;
        var r = '';
        for(var i = 0; i < nb; i++)r += char;
        return r;
    };
    var tab = function(nb){
        return nbchar('\t',nb);
    };
    var endl = function(nb){
        return nbchar('\n',nb);
    };

    var code = name+' = function(){'+endl(2);
            code += tab()+'//$AbstractModel represents the Model class. make a extends of the Model class'+endl();
            code += tab()+'$AbstractModel.call(this);'+endl(2);

            code += tab()+'//Save the class name'+endl();
            code += tab()+'this.$tableName = "'+name+'";'+endl();

            //Add the functions that will enable to automatically retrieve the values associated in other tables
            for(var i in $Model){
                if($Model[i]['relations']) {
                    var r = $Model[i]['relations'];
                    if(r[name.toLowerCase()]){
                        r = r[name.toLowerCase()].toLowerCase();

                            code += tab()+'this.'+ i.ucfirst()+' = function(callback){'+endl();
                            code += tab(2)+'var r = new '+ i.ucfirst()+'();'+endl(2);
                            code += tab(2)+'r.of(this).get(function(){'+endl();
                                code += tab(3)+'if(callback){'+endl();
                                    code += tab(4)+'this.$callback = callback;'+endl();
                                    code += tab(4)+'this.$callback(r);'+endl();
                                code += tab(3)+'}'+endl();
                            code += tab(2)+'})'+endl();
                            code += tab()+'}'+endl(2);

                    }
                }
            }


            code += tab()+''+endl();
            code += '};';
            code += endl(2);

            if($Model[name.toLowerCase()].methods){
                code += '//The methods defined by default in the model his partner as a prototype,'+endl();
                code += '//this will give a direct access from the objects'+endl();
                code += name+'.prototype = $Model["'+name.toLowerCase()+'"].methods;'+endl(2);
            }

            if($Model[name.toLowerCase()].relations){
                code += '//Add relations prototype will be used to improve the ORM'+endl();
                code += name+'.prototype.$relations = $Model["'+name.toLowerCase()+'"].relations;'+endl(2);
            }

            if($Model[name.toLowerCase()].attrs){
                code += '//Add relations prototype will be used to improve the ORM'+endl();
                code += name+'.prototype.$attrs = $Model["'+name.toLowerCase()+'"].attrs;'+endl(2);
            }

            if($Model[name.toLowerCase()].extra){
                code += '//Add relations prototype will be used to improve the ORM'+endl();
                code += name+'.prototype.$extra = $Model["'+name.toLowerCase()+'"].extra;'+endl(2);
            }

            if($Model[name.toLowerCase()].extra){
                code += '//Add validation prototype will be used to vaidate a form data Or others'+endl();
                code += name+'.prototype.$validation = $Model["'+name.toLowerCase()+'"].validation;'+endl(2);
            }

            //code += 'console.log($Model["'+name.toLowerCase()+'"].methods);'+endl;
            code += '//Creating an extension, it may be used generally'+endl();
            code += '$'+name+' = new '+name+'();'+endl(2);

    return code;

};