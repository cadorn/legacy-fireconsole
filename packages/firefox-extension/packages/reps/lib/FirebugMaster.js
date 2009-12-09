
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util", "nr-common");
var CHROME_UTIL = require("chrome-util", "nr-common");

var DOMPLATE = require("domplate", "domplate");
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var REPS = require("./Reps");
var APP = require("app", "nr-common").getApp();
var TEMPLATE_PACK = require("TemplatePack", "firefox-extension");
var TEMPLATE_PACK_LOADER = require("loader", "template-pack");

var Firebug = FIREBUG_INTERFACE.getFirebug();



var masterPack = TEMPLATE_PACK_LOADER.requirePack("github.com/cadorn/fireconsole/raw/master/firefox-extension-reps");


var infoTipTags,
    activeInfoTip,
    infoTipModule = FIREBUG_INTERFACE.getFirebug().InfoTip;

var FirebugMaster = exports.FirebugMaster = function() {
    var that = this;
    
    
//    this.construct(collection);

    this.getAppender = function(name) {
        
print("-- get appender --");        
        switch(name) {
            case 'OpenGroup':
                return Firebug.ConsolePanel.prototype.appendOpenGroup;
            case 'CloseGroup':
                return Firebug.ConsolePanel.prototype.appendCloseGroup;
        }
        return null;
    };
    
    
    this.getRep = function(meta) {
        var rep = this.rep;
        
        // reset rep to default state
        rep.priorityClassName = "";
        rep.debug = false;
        
        if(!meta) {
            return rep;
        }

        // message priority
        if(UTIL.has(meta, "fc.msg.priority")) {
            // Ensure only supported priorities are used
            switch(meta["fc.msg.priority"]) {
                case "log":
                    // no need to change the priorityClassName for the default
                    break;
                case "info":
                case "warn":
                case "error":
                    rep.priorityClassName = meta["fc.msg.priority"];
                    break;
                default:
                    // TODO: Log warning: Unknown priority
                    break;
            }
        }
        
        // debugging
        if(UTIL.has(meta, "fc.tpl.debug") && meta["fc.tpl.debug"]) {
            rep.debug = true;
        }

        return rep;
    };
    
    this.openMessageGroup = function(context) {
        FIREBUG_INTERFACE.getConsole().openGroup([context.FirebugNetMonitorListener.file.href],
            context.FirebugNetMonitorListener.context, masterPack.getKey() + "MessageGroup", null, false, null);
    }
    
    this.closeMessageGroup = function(context) {
        FIREBUG_INTERFACE.getConsole().closeGroup();
    }
    
    this.rep = function() {
        try {
            with (DOMPLATE.tags) {
            
                // Extend the default firebug rep
                return DOMPLATE.domplate(Firebug.Rep, {
            
                    "debug": false,
                    "priorityClassName": "",

                    "className": masterPack.getKey() + "Message",

                    tag: DIV({"class": "MasterRep $priorityClassName",
                              "_repObject": "$object",
                              "onmouseover":"$onMouseOver", "onmousemove":"$onMouseMove", "onmouseout":"$onMouseOut", "onclick":"$onClick"},
                              
                             IF("$object|_getLabel", SPAN({"class": "label"}, "$object|_getLabel")),
                              
                             TAG("$object|_getTag", {"node": "$object|_getValue", "object": "$object"})),

                    _getTag: function(object)
                    {
                        var rep;
                        if(object["__fc_tpl_id"]) {
                            var template = TEMPLATE_PACK.getTemplate({
                                "fc.tpl.id": object["__fc_tpl_id"]
                            });
                            if(template) {
                                rep = template.rep;
                            } else {
                                object["__fc_bypass"] = true;
                                rep = FIREBUG_INTERFACE.getFirebug().getRep(object);
                            }
                        } else {
//                        var rep = that.getRepForNode(object.getOrigin());
                            rep = that.getTemplate().rep;
//                        var rep = that.getRepForObject(object[1], object[0]);
                        }
                        
                        if(UTIL.has(rep, "shortTag")) {
                            return rep.shortTag;
                        }

                        return rep.tag;
                    },
                    
                    _getLabel: function(object)
                    {
                        if(object.meta && UTIL.has(object.meta, "fc.msg.label")) {
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
                            // use Firebug's domplate
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
                        if(meta && (UTIL.has(meta, "fc.msg.file") || UTIL.has(meta, "fc.msg.line"))) {
                            activeInfoTip = infoTipTags.tag.replace({
                                "file": meta["fc.msg.file"] || "?",
                                "line": meta["fc.msg.line"] || "?"
                            }, activeInfoTip);
                        } else {
                            activeInfoTip = null;
                        }

                        that.dispatch('onMouseOver', [event, this._getMasterRow(event.target)]);
                    },
        
                    onMouseOut: function(event)
                    {
                        if(activeInfoTip) {
                            infoTipModule.hideInfoTip(activeInfoTip);
                        }
                        that.dispatch('onMouseOut', [event, this._getMasterRow(event.target)]);
                    },
                    
                    onClick: function(event)
                    {
                        that.dispatch('onClick', [event, this._getMasterRow(event.target)]);
                    },
                    
                    _getMasterRow: function(row)
                    {
                        // Seek our MasterRep node
                        while(true) {
                            if(!row.parentNode) {
                                return null;
                            }
                            if(UTIL.dom.hasClass(row, "MasterRep")) {
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
                });
            }
        } catch(e) {
            print(e, 'ERROR');
        }    
    }();
    
    
    
    var listeners = [];
    
    this.addListener = function(listener)
    {
        listeners.push(listener);
    }
        
    this.removeListener = function(listener)
    {
        for( var i in listeners ) {
            if(listeners[i][1]===listener) {
                listeners.splice(i,1);
            }
        }
    }
    
    this.dispatch = function(event, arguments)
    {
        for( var i in listeners ) {
            if (listeners[i][event]) {
                listeners[i][event].apply(listeners[i], arguments);
            }
        }
    }
        
    this.setTemplate = function(template)
    {
        this.__proto__.setTemplate(template);
        
        FIREBUG_CONSOLE.registerCss(masterPack.getResources().css, cssProcessor, false);
        
        var resources = template.pack.getResources();
        if(resources && UTIL.has(resources, "css")) {
            FIREBUG_CONSOLE.registerCss(resources.css, cssProcessor, template.reloaded);
        }
        
        function cssProcessor(code, info) {
            code = code.replace(/__KEY__/g, info.key);
            var pkg;
            if(TEMPLATE_PACK.getPackSea().hasPackage(info["package"])) {
                pkg = TEMPLATE_PACK.getPackSea().getPackage(info["package"]);
            } else {
                pkg = APP.getSea().getPackage(info["package"]);
            }
            code = code.replace(/__RESOURCE__/g, APP.getResourceUrlForPackage(pkg));
            return code;
        }        
    }     
};

FirebugMaster.prototype = new REPS.Master();


