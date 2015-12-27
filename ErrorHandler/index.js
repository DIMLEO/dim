var codeBlock = [];
var fs = require('fs');

function encapsuleerror(str, column){
    return str.slice(0, column-1)+'{{{'+str.slice(column-1, column)+'}}}'+str.slice(column);
}

function getIntervalCodeOfError(file, row, column){
    row--;
    var code = fs.readFileSync(file, 'utf-8').split('\n');

    var out = '';

    for(var i = (row-5 >= 0)?row-5:0, b = row+5; i < b; i++ ){
        if(code[i]){
            var str = ((row == i)?encapsuleerror(code[i], column):code[i])
                .replace(/\t/g, '&nbsp;').replace(/ /g, '&nbsp;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\{\{\{(.?)\}\}\}/, '<span class = "error-char" >$1</span>');
                //.replace(/\t/, ' ')
                  //           .replace(/\s/, ' ');
            out+= '<li '+((row == i)?' class = "error-line" ':'')+'>'+str+'</li>';
        }
    }

    return out;
};

var buildError = function(str){
    str.replace(/\((.*)\)/, function(str, capt){
        if((new RegExp(/\(|\)/)).test(capt)){
            buildError(capt);
        }
        else{
            var struct = capt.split(':');
            codeBlock.push({
                file : struct[0].trim()+':'+struct[1].trim(),
                row : parseInt(struct[2].trim()),
                column : parseInt(struct[3].trim()),
                code : getIntervalCodeOfError(struct[0].trim()+':'+struct[1].trim(), parseInt(struct[2].trim()), parseInt(struct[3].trim()))
            });
        }
    });
};

function getvalue(r){
    if(is_object(r)){
        return '[Object]';
    }
    else if(is_array(r)){
        return r.join(',');
    }
    else if(is_function(r)){
        return '[Function]';
    }
    else return r;
}

function environnementDescriptionData(title, data){
    var out = '';

    for(var i in data){
        out += '<div class = "col-md-12 vrow" >'
                    +'<div class="col-md-6 vrow-key">'+i+'</div>'
                    +'<div class="col-md-6 vrow-value">'+getvalue(data[i])+'</div>'
               +'</div>';
    }
    return '<div class="panel panel-default">'
                +'<div class="panel-heading" role="tab" id="headingOne">'
                    +'<h4 class="panel-title">'
                        +'<a role="button" data-toggle="collapse" data-parent="#accordion" href="#'+title+'" aria-expanded="false" aria-controls="collapseOne">'
                            +title
                        +'</a>'
                    +'</h4>'
                +'</div>'
                +'<div id="'+title+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">'
                    +'<div class="panel-body">'
                        +((out)?out:'<div class = "empty" >empty</div>')
                    +'</div>'
                +'</div>'
            +'</div>';
}

function environnementDescription(){

    return '<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">'
                +environnementDescriptionData('POST', $_POST)
                +environnementDescriptionData('GET', $_GET)
                +environnementDescriptionData('HEADERS', $_REQUEST.headers)
                +environnementDescriptionData('REQUEST', $_REQUEST)
           +'</div>';
}

function getHtmlCode(stackitem, i){
    var ulitem = '', description = '';
    if(stackitem.file == undefined) return undefined;

    ulitem = '<li class = "stackitem  '+((i == 0)?'active':'')+'" >'
                + '<a href = "#elife_tabpanel_'+i+'" aria-controls="elife_tabpanel_'+i+'" role="tab" data-toggle="tab" >'
                    +'<div >'
                        +stackitem.file
                    +'</div>'
                    +'<div >'
                        +'<p>row : <span>'+stackitem.row+'</span></p>'
                        +'<p>col : <span>'+stackitem.column+'</span></p>'
                    +'</div>'
                +'</a>'
            +'</li>';

    description = '<div style = "padding : 10px;" role="tabpanel" class="tab-pane '+((i == 0)?'active':'')+'" id = "elife_tabpanel_'+i+'" >'
                    +'<div class="panel panel-default">'
                            +'<div class="panel-heading">'
                                +stackitem.file
                            +'</div>'
                            +'<div class="panel-body">'
                                +'<ul start = "'+((stackitem.row-5 >= 0)?stackitem.row-5:0)+'" >'
                                    +stackitem.code
                                +'</ul>'
                            +'</div>'
                            +'<div class="panel-footer">'
                                +'No comments for this stack'
                            +'</div>'
                    +'</div>'
                +'</div>';

    return {
        li : ulitem,
        desc : description
    };
}

module.exports = function(err, req, res, next){

    var html = '<header>'
                    +'<h2>Express-Life Error Handler</h2>'
                +'</header>', left = '', right = '';

    var stack = err.stack.split('\n');
    var msg = err.message;

    var tps = undefined;


    tps = stack[0].split(/:/);

    var reference = tps[0].trim();
    var msg = tps[1].trim();

    for(var i = 1; i < stack.length; i++){
        buildError(stack[i]);
    }

    for(i in codeBlock){
        var item = getHtmlCode(codeBlock[i], i);
        if(item == undefined) continue;
        left += item.li;
        right += item.desc;
    }

    html += '<div id = "description-body" >'
                +'<ul id = "accessuerstack" >'+left+'</ul>'
                +'<div id = "description-code" class="tab-content">'
                    +'<div id = "description-code-header"  ><h2>'+reference+'</h2><h4>'+msg+'</h4></div>'
                    +right
                    +environnementDescription()
                +'</div>'
            +'</div>';

    html += '<style type = "text/css" >'+fs.readFileSync(__dirname+'/debug.css', 'utf-8')+'</style>';

    html += '<style type = "text/css" >'+fs.readFileSync(__dirname+'/bootstrap.min.css', 'utf-8')+'</style>';

    html += '<style type = "text/css" >'+fs.readFileSync(__dirname+'/bootstrap-theme.min.css', 'utf-8')+'</style>';

    html += '<script type = "text/javascript" >'+fs.readFileSync(__dirname+'/jquery.min.js', 'utf-8')+'</script>';

    html += '<script type="text/javascript">SyntaxHighlighter.all(); </script>';

    html += '<script type = "text/javascript" >'+fs.readFileSync(__dirname+'/bootstrap.min.js', 'utf-8')+'</script>';

    html += '<script type = "text/javascript" >'+fs.readFileSync(__dirname+'/debug.js', 'utf-8')+'</script>';

    res.send(html);

};