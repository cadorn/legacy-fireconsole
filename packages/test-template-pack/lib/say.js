
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);
    
template.onLoad = function(pack, tags){with(tags) {

    pack.registerCss("common.css");

    return {

        tag:
            SPAN({"class": pack.getKey()+"say"}, "$object.say"),
    
        shortTag:
            SPAN({"class": pack.getKey()+"say"}, "$object.say")

    }
}};

