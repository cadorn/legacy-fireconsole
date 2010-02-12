
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.supportsNode = function(node) {
    return (node.meta && node.meta["fc.lang.type"]=="string");
};

template.onLoad = function(pack, tags){with(tags) {

    return {

        tag: SPAN({"class": pack.__KEY__+"string"}, "<<|viewer| $node.value |>>"),

        shortTag: SPAN({"class": pack.__KEY__+"string"}, "<<|console| $node.value|cropString |>>"),

        cropString: function(text, limit){
            text = text + "";
            
            if (!limit) {
                var halfLimit = 50;
            } else {
                var halfLimit = limit / 2;
            }            
            if (text.length > limit) {
                return this.escapeNewLines(text.substr(0, halfLimit) + "..." + text.substr(text.length - halfLimit));
            } else {
                return this.escapeNewLines(text);
            }
        },

        escapeNewLines: function(value) {
            return value.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
        }
    }
}};
