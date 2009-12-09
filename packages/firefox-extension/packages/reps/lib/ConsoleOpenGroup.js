
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    return {

        className: "group",
        _appender: "appendOpenGroup",
            
        tag: TAG("$objects|getTag", {
            "meta": "$objects.meta",
            "node": "$objects|getNode"
        }),
        
        plainTag: SPAN({"style":"$meta|getStyle"}, "$node.value"),
    
        getTag: function(object)
        {
            return this.plainTag;
        },
        
        getStyle: function(meta) {
            var style = [];
            if(meta && meta["fc.group.color"]) {
                style.push("color: " + meta["fc.group.color"]);
            }
            return style.join("; ");
        },
        
        getNode: function(objects)
        {
            return objects.og.getOrigin();
        }            
    }
}};
