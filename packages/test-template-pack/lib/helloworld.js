
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.addCss("common.css");

template.setRep(function(tags){with(tags) {
    return {

        tag:
            DIV({"class": template.getKey()+"helloworld"}, "$node.value"),
    
        shortTag:
            DIV({"class": template.getKey()+"helloworld"}, "$node.value")

    }    
}});

