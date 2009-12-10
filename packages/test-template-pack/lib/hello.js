
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    pack.registerCss("common.css");

    return {

        tag:
            DIV({"class": pack.__KEY__+"hello"}, "Hello: ",
                TAG("$node|getTag", {"node": "$node"})),
                
        getTag: function(node) {
            return this.getRepForNode(node).tag;
        }
    }
}};
