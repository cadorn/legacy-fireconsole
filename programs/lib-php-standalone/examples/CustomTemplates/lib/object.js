
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    pack.registerCss("common.css");

    return {

        // used for rendering in variable viewer
        tag:
            DIV({"class": pack.__KEY__+"object"},
                SPAN({"class": "class"}, "$node|getClassName"),
                " is saying ",
                SPAN({"class": "saying"}, "$node|getSaying")
            ),

        // used for rendering in console
        shortTag:
            DIV({"class": pack.__KEY__+"object"},
                SPAN({"class": "console"}, "'$node|getClassName' is  dddd saying '$node|getSaying'")),

        getClassName: function(node) {
            return node.meta["fc.lang.class"];
        },

        getSaying: function(node) {
            return node.value.say.value;
        }
    }
}};
