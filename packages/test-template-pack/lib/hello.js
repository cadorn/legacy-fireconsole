
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    pack.registerCss("common.css");

    return {

        tag:
            DIV({"class": pack.getKey()+"hello"}, "Hello: ",
                TAG("$node|getTag", {"node": "$node"})),
    
        shortTag:
            DIV({"class": pack.getKey()+"hello"}, "Hello: ",
                TAG("$node|getTag", {"node": "$node"})),
                
        getTag: function(node) {
            return this.getRepTagForNode(node);
        }
    }
}};
