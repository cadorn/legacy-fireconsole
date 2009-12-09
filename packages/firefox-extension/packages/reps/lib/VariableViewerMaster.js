

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util", "nr-common");
var DOMPLATE = require("domplate", "domplate");
var REPS = require("./Reps");
var FIREBUG_CONSOLE = require("console", "firebug");
var CHROME_UTIL = require("chrome-util", "nr-common");
var APP = require("app", "nr-common").getApp();
var TEMPLATE_PACK = require("TemplatePack", "firefox-extension");
var TEMPLATE_PACK_LOADER = require("loader", "template-pack");


var variableViewerPack = TEMPLATE_PACK_LOADER.requirePack("github.com/cadorn/fireconsole/raw/master/firefox-extension-reps");


// do not log debug info while compiling this.rep = function(){...}()
// the debug flag gets set again when this.getRep() is called
DOMPLATE.DomplateDebug.enabled = false;


var VariableViewerMaster = exports.VariableViewerMaster = function() {
    var that = this;

    this.getRep = function(meta) {
        var rep = this.rep;
        
        // reset rep to default state
        rep.debug = false;
        
        if(!meta) {
            return rep;
        }
        
        // debugging
        if(UTIL.has(meta, "fc.tpl.debug") && meta["fc.tpl.debug"]) {
            rep.debug = true;
        }

        return rep;
    };
        
    this.rep = function() {
        try {
            with (DOMPLATE.tags) {
            
                // Extend the default firebug rep
                return DOMPLATE.domplate({
                    
                    tag: DIV({"class": variableViewerPack.getKey() + "VariableViewerHarness",
                              "_repObject": "$object"},
                              
                             TAG("$object|_getTag", {"node": "$object|_getValue", "object": "$object"})),
                    
                    _getTag: function(object)
                    {
                        var rep;
                        if(object["__fc_tpl_id"]) {
                            var template = TEMPLATE_PACK.getTemplate({
                                "fc.tpl.id": object["__fc_tpl_id"]
                            });
                            rep = template.rep;
                        } else {
                            rep = that.getTemplate().rep;
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
        
                    _appender: function(object, row, rep)
                    {
                        var ret = rep.tag.append({
                            object: object
                        }, row);
        
                        return ret;                
                    },
                    
                    _normalizeData: function(object)
                    {
                        return object;
                    },
        
                    _getMasterRow: function(row)
                    {
                        // Seek our MasterRep node
                        while(true) {
                            if(!row.parentNode) {
                                return null;
                            }
                            if(UTIL.dom.hasClass(row, "VariableViewerRep")) {
                                break;
                            }
                            row = row.parentNode;
                        }
                        return row;
                    }
                });
            }
        } catch(e) {
            print(e, 'ERROR');
        }    
    }();      
            
    this.setTemplate = function(template)
    {
        this.__proto__.setTemplate(template);        
    }    
};
VariableViewerMaster.prototype = new REPS.Master();

