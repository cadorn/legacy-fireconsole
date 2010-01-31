
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    return {
    
        tag: DIV({"class": pack.__KEY__ + "VariableViewer",
                  "_repObject": "$object"},
                 TAG("$object|_getTag", {"node": "$object|_getValue", "object": "$object"})),
        
        _getTag: function(object)
        {
            var rep;
            if(object["__fc_tpl_id"]) {
                rep = this.getRepForId(object["__fc_tpl_id"]);
            } else
            if(object.og && object.og.getOrigin) {
                rep = this.getRepForNode(object.og.getOrigin());
            } else {
                rep = this.getRepForNode(object);
            }
            return rep.tag;
        },

        _getValue: function(object)
        {
            if(!object.og) {
                return object;
            }
            return object.og.getOrigin();
        },

        _getMasterRow: function(row)
        {
            // Seek our MasterRep node
            while(true) {
                if(!row.parentNode) {
                    return null;
                }
                if(this.util.hasClass(row, "VariableViewerRep")) {
                    break;
                }
                row = row.parentNode;
            }
            return row;
        }
    }
}};
