var fs = require('fs');
var pathModule = require('path');
fs.mkdirParent = function(dirPath, mode) {
    //Call the standard fs.mkdir
    if(fs.existsSync(dirPath)) return;
    try{
        fs.mkdirSync(dirPath, mode);
    }catch(e){
        //When it fail in this way, do the custom steps
        // && error.errno === 34
        //Create all the parents recursively
        fs.mkdirParent(pathModule.dirname(dirPath), mode);
        //And then the directory
        fs.mkdirParent(dirPath, mode);

        //Manually run the callback since we used our own callback to do all these
    }
};

module.exports = function(env){

    var blade_cache = {};

    var blade_extends = {

    };

    var reg = {
            bladeFile : "(.+)\\.blade$",
            extends : "^@extends\\(([a-zA-Z0-9_\\.\\s/\\\\]+)\\)$",
            section : "^@section\\(([a-zA-Z0-9_\\.\\s]+)\\)$",
            mrequire : "^@require\\(([a-zA-Z0-9_\\.\\s]+)\\)$",
            ifstate : "@if\\(([\\s\\S]+?)\\)",
            elseifstate : "@elseif\\(([\\s\\S]+?)\\)",
            elsestate : "@else\\b",
            sectionend : "^@endsection$",
            endif : "@endif\\b",

            include : "@include\\(([\\s\\S]+?)\\)",

            forState : "@for\\(([\\s\\S]+?)\\)",
            foreach : "@foreach\\(([\\s\\S]+?)[\s]*(as|of)[\s]*([\\s\\S]+?)\\)",
            whileState : "@while\\(([\\s\\S]+?)\\)",

            endLoop : "@endforeach\\b|@endfor\\b|@endwhile\\b",
            endForState : "@endfor\\b",
            endforeach : "@endforeach\\b",
            endwhile : "@endwhile\\b"
        };

    var is = {
        match : function(regex, str){
            var regex = new RegExp(regex, 'i');
            return regex.test(str.trim());
        },
        extends : function(str){
            return is.match(reg.extends, str);
        },
        include : function(str){
            return is.match(reg.include, str);
        },
        sectionStart: function(str){
            return is.match(reg.section, str);
        },
        sectionEnd : function(str){
            return is.match(reg.sectionend, str);
        },
        moduleRequire : function(str){
            return is.match(reg.mrequire, str);
        },
        ifStatement : function(str){
            return is.match(reg.ifstate, str);
        },
        elseifStatement : function(str){
            return is.match(reg.elseifstate, str);
        },
        elseStatement : function(str){
            return is.match(reg.elsestate, str);
        },
        endif : function(str){
            return is.match(reg.endif, str);
        },
        forState : function(str){
            return is.match(reg.forState, str);
        }
    };

    function reMaker(str){
        str = ifStatementMaker(str);
        str = loopFor(str);
        str = includeView(str);

        for(i in blade_extends) str = blade_extends[i](i, str);

        return str;
    }


    function includeView(str){
        return str
        .replace(getRexEpx(reg.include), function(str, view){
                if(getRexEpx(reg.bladeFile, 'i').test(view))
                    return (view.trim().length > 0)?"`+require($Env.path.storage+'/views/"+view.trim()+"')($data, $Env)+`":"";
                else
                    return (view.trim().length > 0)?"`+$fs.readFileSync($Env.path.views+'/"+view.trim()+"', 'UTF-8')+`":"";
            });
    }

    function ifStatementMaker(str){

        return str
        .replace(/@if\(([\s\S]+?)\)([\s]+?)@endif/ig, function(str){
            return '';
        })
        .replace(/@if\(([\s\S]+?)\)([\s\S]+?)@else([\s\S]+?)@endif/ig, function(str, condition, var1, var2){
            if(getRexEpx('@or|@elseif|@if').test(var1+' '+var2)) return str;
            return '`+(('+condition+')?`'+var1+'`:`'+var2+'`)+`';
        })
        .replace(/@if\(([\s\S]+?)\)([\s\S]+?)@endif/ig, function(str, condition, var1){
            if(getRexEpx('@or|@elseif|@if').test(var1)) return str;
            return '`+(('+condition+')?`'+var1+'`:``)+`';
        })
        .replace(getRexEpx(reg.ifstate, 'ig'), function(str){
            return "`+(function(){\n\t\t\t"+str.replace(/^@/,'')+'{return `';
        })
        .replace(getRexEpx(reg.endif, 'ig'), function(str){
            return "\n\t\t\t`;}}())+`";
        })
        .replace(/@elseif\(([\s\S]+?)\)/ig, '`;}else if($1){return `')
        .replace(/@else/ig, '`;}else{return `')
        .replace(/@or/ig, '`;}else if($1){return `');

    }
    function loopFor(str){

        return str
        .replace(getRexEpx(reg.whileState), function(str, params){
            return "`+(function(){\n\t\t\tvar output = '';\n\t\t\t"
            +str.replace(/^@/,'')+'{ output += `';
        })
        .replace(getRexEpx(reg.forState), function(str, params){
            return "`+(function(){\n\t\t\tvar output = '';\n\t\t\t"
            +str.replace(/^@/,'')+'{ output += `';
        })
        .replace(getRexEpx(reg.foreach), function(str, var1, iterator, var2){
            var code = "`+(function(){\n\t\t\tvar output = '', "+((iterator == "as")?var2:var1)+" = undefined;\n\t\t\t";

                if(iterator == "as"){
                    code += "for(var index in "+var1+"){ "+var2+" = "+var1+"[index];";
                }
                else{
                    code += "for(var index in "+var2+"){ "+var1+" = "+var2+"[index];";
                }

                code += ' output += `';
                return code;
        })
        .replace(getRexEpx(reg.endLoop, 'ig'), function(str){
            return "\n\t\t\t`;}return output;}())+`";
        })
        ;

    }

    function formatString(str){
        return str.replace(/@yield\(([a-zA-Z0-9_\.\s]+)\)/ig, '`+eval("`"+__blade_private__.$1+"`")+`');
    }
    function explode(params){
        var code = "";
        var params = Object.keys(params);
        for(var i in params){
            code += "\tvar "+params[i]+" = ($data)?$data."+params[i]+":undefined;\n";
        }
        return code;
    }
    function cleanVar(params){
        var code = "";
        params = Object.keys(params);
        for(var i in params){
            code += "\tdelete "+params[i]+";\n";
        }
        return code;
    }

    function getRexEpx(patern, design){
        return new RegExp(patern, design);
    }

    function getValue(pattern, str){
        var regxp = new RegExp(pattern, 'i');
        return  str.trim().replace(regxp, "$1");
    }

    function mkBlade(path, file, params){
        var sources = fs.readFileSync(path, "UTF-8");
        sources = sources.replace(/`/, '\`');
        var $section = [], required = [], $block = [], $extends = '""', $html = [], useFs = false;
        if(!params) params = {};
        if(!params.__blade_private__) params.__blade_private__ = {};

        var lines = sources.split('\n');

        var line = '';
        var regxp = undefined;
        var mkfiles = [];
        var package = {
            sectionIsStart : false,
            currentSectionName : undefined
        };

        for(i in lines){
            line = lines[i].replace(/[\s]+$/, '');
            if(line.length == 0) continue;

            if(is.extends(line)){
                var vfile = getValue(reg.extends, line);
                $extends = "require($Env.path.storage+'/views/"+vfile+"')($data, $Env)";
                mkfiles.push(vfile);
                continue;
            }
            if(is.include(line)){
                var vfile = getValue(reg.include, line);

                if(!getRexEpx(reg.bladeFile, 'i').test(vfile)){
                    useFs = true;
                }else{
                    mkfiles.push(vfile);
                }
            }
            if(is.sectionStart(line)){
                if(package.sectionIsStart){
                    throw new Error('A section can not contain another in '+file+' on line '+(parseInt(i)+1));
                }
                package.sectionIsStart = true;
                package.currentSectionName = getValue(reg.section, line);
                params.__blade_private__[package.currentSectionName] = "";
                continue;
            }
            else if(is.sectionEnd(line)){

                if(package.sectionIsStart) {
                    package.sectionIsStart = false;
                    package.currentSectionName = undefined;
                }else{
                    throw new Error('attempt to close an unopened section in '+file+' on line '+(parseInt(i)+1));
                }
                continue;
            }
            if(is.moduleRequire(line)){
                var module = getValue(reg.mrequire, line);
                required.push("\tvar "+module+" = require('"+module+"');\n");
                module = undefined;
                continue;
            }

            line = formatString(line);

            if(package.sectionIsStart){
                params.__blade_private__[package.currentSectionName] += line;
                continue;
            }

            $html.push(line);
        }

        for(var index in params.__blade_private__) params.__blade_private__[index] = reMaker(params.__blade_private__[index]);

        for(var index in mkfiles) make(mkfiles[index].trim(), params);

        //'use strict';
        var to = "module.exports = function($data, $Env){\n";
         to +=  "\tvar $fs = require('fs');\n"
         to +=  "\tvar $html = '';\n";
         to +=  "\tvar $output = '';\n";
         to +=  "\tvar $sessions = {};\n";
         to +=  "\tvar $extends = "+$extends+";\n\n";
         to +=  required.join('')+"\n\n";
         to +=  explode(params)+"\n";

         to +=  "\t$html += `"+$html.join("\\n\n\t\t\t\t")+"`;\n\n";

         to +=  ($extends != '""')?"\t$output = $html+$extends;\n" : "\t$output = $html;\n";

         to +=  "\n"+cleanVar(params)+"\n";
         to += "\treturn $output;\n";
         to += "};";

        to = reMaker(to);

        fs.mkdirParent(pathModule.dirname(pathModule.normalize(env.path.storage+'/views/'+file+'.js')));
        fs.writeFileSync(env.path.storage+'/views/'+file+'.js', to, "UTF-8");
    }

    function make(file, params){
        if(env.mode == "prod" && blade_cache[file]){
            return blade_cache[file](params, env);
        }
        var reg = new RegExp('(.+)\.blade$', 'i');
        var contenu = '', path = env.path.views+'/'+file;

        if(fs.existsSync(path)){
            if(reg.test(file)){
                if(!fs.exists(env.path.storage+'/views/'+file) || env.mode == "dev"){
                    mkBlade(path, file, params);
                }
                path = env.path.storage+'/views/'+file;
                var view = require(path);
                if(env.mode == "prod"){
                    blade_cache[file] = view;
                }
                contenu = view(params, env);
            }else{
                contenu = fs.readFileSync(path, "UTF-8");
            }
        }else{
            throw new Error('file '+file+' not found');
        }
        return contenu;
    }

    return {

        make : function(file, params){
            return make(file, params);
        },
        extends : function(key, callback){
            var opener = undefined, closer = undefined;
            if(typeof callback == 'function')
                opener = callback;
            else{
                opener = callback.opener;
                closer = callback.closer;
            }

            blade_extends[key] = function(key, block){
                return block.replace(getRexEpx('@'+key+'\\(([\\s\\S]*?)\\)', 'ig'), function(str, capture){
                    return opener(capture.trim());
                });
            };
            if(closer)
                blade_extends['end'+key] = function(key, block){
                    return block.replace(getRexEpx('@'+key+'\\b', 'ig'), closer);
                };
        }
    }

};