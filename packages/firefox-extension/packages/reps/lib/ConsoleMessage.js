
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");

var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

var activeInfoTip,
    infoTipModule = FIREBUG_INTERFACE.getFirebug().InfoTip;

template.onLoad = function(pack, tags){with(tags) {

    return {
    
        tag: DIV({"class": pack.__KEY__ + "ConsoleMessage",
                  "_repObject": "$object",
                  "onmouseover":"$onMouseOver", "onmousemove":"$onMouseMove", "onmouseout":"$onMouseOut", "onclick":"$onClick"},
                 IF("$object|_getLabel", SPAN({"class": "label"}, "$object|_getLabel")),
                 TAG("$object|_getTag", {"node": "$object|_getValue", "object": "$object"})),
        
        fileLineInfoTipTag: DIV({"class": pack.__KEY__ + "Tip"}, "$file @ $line"),
        
        _getTag: function(object)
        {
            var rep;
            if(object["__fc_tpl_id"]) {
                try {
                    rep = this.getRepForId(object["__fc_tpl_id"]);
                } catch(e) {
                    system.log.warn(e);
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
            // set a class on our logRow parent identifying this log row as fireconsole controlled
            // this is used for hover and selected styling
            this.util.setClass(this._getMasterRow(event.target).parentNode, "logRow-" + pack.__KEY__ + "ConsoleMessage");

            if(this.util.getChildByClass(this._getMasterRow(event.target), "__fc_no_inspect")) {
                return;
            }

            // populate file/line info tip
            var meta = this._getMasterRow(event.target).repObject.meta;
            if(meta && (meta["fc.msg.file"] || meta["fc.msg.line"])) {
                activeInfoTip = event.target.ownerDocument.getElementsByClassName('infoTip')[0];
                this.fileLineInfoTipTag.replace({
                    "file": meta["fc.msg.file"] || "?",
                    "line": meta["fc.msg.line"] || "?"
                }, activeInfoTip);
            } else {
                activeInfoTip = null;
            }
        },
    
        onMouseOut: function(event)
        {
            if(activeInfoTip) {
                infoTipModule.hideInfoTip(activeInfoTip);
            }
        },
        
        onClick: function(event)
        {
            if(this.util.getChildByClass(this._getMasterRow(event.target), "__fc_no_inspect")) {
                return;
            }

            this.dispatchEvent('click', [event, this._getMasterRow(event.target)]);
        },
        
        _getMasterRow: function(row)
        {
            while(true) {
                if(!row.parentNode) {
                    return null;
                }
                if(this.util.hasClass(row, pack.__KEY__ + "ConsoleMessage")) {
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
