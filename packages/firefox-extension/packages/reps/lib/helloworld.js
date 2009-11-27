
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    pack.addCss("common.css");

    return {

        tag:
            DIV({"class": pack.getKey()+"helloworld"}, "$node.value"),
    
        shortTag:
            DIV({"class": pack.getKey()+"helloworld"}, "$node.value")

    }    
}};

