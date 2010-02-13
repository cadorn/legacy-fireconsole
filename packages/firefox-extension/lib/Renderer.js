
var UTIL = require("util");
var APP = require("app", "nr-common").getApp();
var TEMPLATE_PACK = require("./TemplatePack");
var TEMPLATE_PACK_LOADER = require("loader", "template-pack");
var FIREBUG_CONSOLE = require("console", "firebug");
var DOMPLATE = require("domplate", "domplate");
var SECURITY = require("./Security");

DOMPLATE.DomplateDebug.console = FIREBUG_CONSOLE;


exports.factory = function(options) {
    return new Renderer(options);
};

var Renderer = function(options) {
    
    var domainCallback = function() { 
        if(typeof options.domain == "function") {
            return options.domain();
        }
        return options.domain;
    };

    var reload = false;

    if(options.meta) {
        // grouping
        if(UTIL.has(options.meta, "fc.group.start") && options.meta["fc.group.start"]) {
            var pack = TEMPLATE_PACK.requirePack(domainCallback, "registry.pinf.org/cadorn.org/github/fireconsole/packages/firefox-extension/packages/reps/master");
            this.getRep = function() { return pack.getTemplate(domainCallback, "ConsoleOpenGroup", false, true).rep; };
            return;
        } else
        if(UTIL.has(options.meta, "fc.group.end") && options.meta["fc.group.end"]) {
            var pack = TEMPLATE_PACK.requirePack(domainCallback, "registry.pinf.org/cadorn.org/github/fireconsole/packages/firefox-extension/packages/reps/master");
            this.getRep = function() { return pack.getTemplate(domainCallback, "ConsoleCloseGroup", false, true).rep; };
            return;
        }

        if(options.meta["fc.tpl.reload"]) {
            reload = true;
        }
    }
    
    var parts = options.template.split("#");
    var pack = TEMPLATE_PACK.requirePack(domainCallback, parts[0], (options.cacheTemplatePack===false)?false:true);
    if(!pack) {
        throw new Error("Template pack for id '"+parts[0]+"' not installed nor registered");
    }

    this.template = pack.getTemplate(domainCallback, parts[1], reload, true);
    
    if(!this.template) {
        var error = new Error("Template not found in pack");
        error.notes = {
            "id": options.template
        }
        throw error;
    }

    var self = this;
    this.getRep = function(freshCompile) {

        var rep = {};
    
        rep.dispatchEvent = function(name, args) {
            if(!options.eventListener) return;
            options.eventListener.onEvent(name, args);
        }
        
        // message priority
        if(options.meta && UTIL.has(options.meta, "fc.msg.priority")) {
            // Ensure only supported priorities are used
            switch(options.meta["fc.msg.priority"]) {
                case "log":
                case "info":
                case "warn":
                case "error":
                    rep.className = options.meta["fc.msg.priority"];
                    break;
                default:
                    var error = new Error("Unknown message priority");
                    error.notes = {
                        "meta": options.meta
                    }
                    throw error;
                    break;
            }
        }

        // debugging
        rep._debug = false;
        if(options.meta && options.meta["fc.tpl.debug"]) {
            rep._debug = true;
        }

        rep._resourceListener = {
            register: function(resources) {
                if(!options.cssTracker) {
                    return;
                }
                try {
                    for( var key in resources ) {
                        if(resources[key].type=="css") {
                            options.cssTracker.registerCSS(resources[key], cssProcessor, reload);
                        }
                    }
                    if(options.document) {
                        var doc = options.document;
                        if(typeof doc == "function") {
                            doc = doc();
                        }
                        if(doc) {
                            options.cssTracker.checkCSS(doc);
                        }
                    }
                } catch(e) {
                    system.log.error(e);
                }
            }
        }
        
        return DOMPLATE.domplate(self.template.getRep(freshCompile), rep);
    }
};

Renderer.prototype.replace = function(htmlNode, data) {
    try {
        return this.getRep().tag.replace({
            "object": data
        }, htmlNode);
    } catch(e) {
        system.log.error(e);
    }
};

function cssProcessor(code, info) {
    code = code.replace(/__KEY__/g, info.key);
    var pkg = TEMPLATE_PACK.getPackPackage(info["package"]);
    if(!pkg) {
        pkg = APP.getPackage(info["package"]);
    }
    code = code.replace(/__RESOURCE__/g, APP.getResourceUrlForPackage(pkg));
    return code;
}    

