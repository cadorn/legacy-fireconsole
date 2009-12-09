
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    return {

        _appender: "appendCloseGroup",
            
        tag: null            

    }
}};
