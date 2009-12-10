
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");

var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    var infoTipTags,
        activeInfoTip,
        infoTipModule = FIREBUG_INTERFACE.getFirebug().InfoTip;

    return {
    
        "priorityClassName": "",
    
        "className": pack.__KEY__ + "Message",
    
        tag: DIV({"class": "MasterRep $priorityClassName",
                  "_repObject": "$object",
                  "onmouseover":"$onMouseOver", "onmousemove":"$onMouseMove", "onmouseout":"$onMouseOut", "onclick":"$onClick"},
                  
                 IF("$object|_getLabel", SPAN({"class": "label"}, "$object|_getLabel")),
                  
                 TAG("$object|_getTag", {"node": "$object|_getValue", "object": "$object"})),
        
        metaTemplateTag: TAG("$object|_getTag", {"node": "$object|_getValue", "object": "$object"}),
        
        _getTag: function(object)
        {
            var rep;
            if(object["__fc_tpl_id"]) {
                try {
                    rep = this.getRepForId(object["__fc_tpl_id"]);
                } catch(e) {
                    FIREBUG_CONSOLE.error("Found __fc_tpl_id in object but cannot locate template: " + object["__fc_tpl_id"]);
                }
                if(!rep) {
                    object["__fc_bypass"] = true;
                    rep = FIREBUG_INTERFACE.getFirebug().getRep(object);
                }
            } else {
                if(object.meta && object.meta["fc.tpl.id"]) {
                    rep = this.getRepForId(object.meta["fc.tpl.id"]);
                } else {
                    rep = this.getRepForNode(object.og.getOrigin());
                }
            }
            if(rep.shortTag) {
                return rep.shortTag;
            }
            return rep.tag;
        },
        
        _getLabel: function(object)
        {
            if(object.meta && object.meta["fc.msg.label"]) {
                return object.meta["fc.msg.label"]+":";
            } else {
                return "";
            }
        },
    
        _getValue: function(object)
        {
            if(!object.og) {
                return object;
            }
            return object.og.getOrigin();
        },

        onMouseMove: function(event)
        {
            if(activeInfoTip) {
                var x = event.clientX, y = event.clientY;
                infoTipModule.showInfoTip(activeInfoTip, {
                    showInfoTip: function() {
                        return true;
                    }
                }, event.target, x, y, event.rangeParent, event.rangeOffset);
            }
        },
    
        onMouseOver: function(event)
        {
            if(!infoTipTags) {
                // use Firebug's domplate - probably not needed
                with (FIREBUG_INTERFACE.getFBL()) {
                    infoTipTags = FIREBUG_INTERFACE.getDomplate()({
                        container: DIV({"id": "fc-console-tip"}),
                        tag: DIV({"class": "infoTip"}, "$file @ $line")
                    });
                };
            }
            // fetch container from document
            activeInfoTip = event.target.ownerDocument.getElementById("fc-console-tip");
            if(!activeInfoTip) {
                activeInfoTip = infoTipTags.container.append({}, event.target.ownerDocument.documentElement);
            }
            
            var meta = this._getMasterRow(event.target).repObject.meta;
            if(meta && (meta["fc.msg.file"] || meta["fc.msg.line"])) {
                activeInfoTip = infoTipTags.tag.replace({
                    "file": meta["fc.msg.file"] || "?",
                    "line": meta["fc.msg.line"] || "?"
                }, activeInfoTip);
            } else {
                activeInfoTip = null;
            }
    
            this.dispatchEvent('mouseOver', [event, this._getMasterRow(event.target)]);
        },
    
        onMouseOut: function(event)
        {
            if(activeInfoTip) {
                infoTipModule.hideInfoTip(activeInfoTip);
            }
            this.dispatchEvent('mouseOut', [event, this._getMasterRow(event.target)]);
        },
        
        onClick: function(event)
        {
            this.dispatchEvent('click', [event, this._getMasterRow(event.target)]);
        },
        
        _getMasterRow: function(row)
        {
            // Seek our MasterRep node
            while(true) {
                if(!row.parentNode) {
                    return null;
                }
                if(this.util.hasClass(row, "MasterRep")) {
                    break;
                }
                row = row.parentNode;
            }
            return row;
        },
    
        supportsObject: function(object, type)
        {
            if(type=="object" && object["__fc_tpl_id"] && !object["__fc_bypass"]) {
                return true;
            } else
            if(object["__fc_bypass"]) {
                delete object["__fc_bypass"];
            }
            return false;
        }
    }
}};
