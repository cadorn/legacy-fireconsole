
var UTIL = require("util");
var APP = require("app", "nr-common").getApp();
var TEMPLATE_PACK = require("./TemplatePack");
var TEMPLATE_PACK_LOADER = require("loader", "template-pack");
var FIREBUG_CONSOLE = require("console", "firebug");
var DOMPLATE = require("domplate", "domplate");


DOMPLATE.DomplateDebug.console = FIREBUG_CONSOLE;


exports.factory = function(options) {
    return new Renderer(options);
};

var Renderer = function(options) {

    if(options.meta) {
        // grouping
        if(UTIL.has(options.meta, "fc.group.start") && options.meta["fc.group.start"]) {
            var pack = TEMPLATE_PACK_LOADER.requirePack("github.com/cadorn/fireconsole/raw/master/firefox-extension-reps", false, true);
            this.getRep = function() { return pack.getTemplate("ConsoleOpenGroup").rep; };
            return;
        } else
        if(UTIL.has(options.meta, "fc.group.end") && options.meta["fc.group.end"]) {
            var pack = TEMPLATE_PACK_LOADER.requirePack("github.com/cadorn/fireconsole/raw/master/firefox-extension-reps", false, true);
            this.getRep = function() { return pack.getTemplate("ConsoleCloseGroup").rep; };
            return;
        }
    }

    var parts = options.template.split("#");
    var pack = TEMPLATE_PACK_LOADER.requirePack(parts[0], false, true);

    this.template = pack.getTemplate(parts[1]);
    
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
    
        // reloading
        this.template._reload = false;
        if(options.meta && options.meta["fc.tpl.reload"]) {
            self.template._reload = true;
        }
    
        rep._resourceListener = {
            register: function(resources) {
                if(!options.cssTracker) {
                    return;
                }
                try {
                    for( var key in resources ) {
                        if(resources[key].type=="css") {
                            options.cssTracker.registerCSS(resources[key], cssProcessor, self.template._reload);
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
    var pkg;
    if(TEMPLATE_PACK.getPackSea().hasPackage(info["package"])) {
        pkg = TEMPLATE_PACK.getPackSea().getPackage(info["package"]);
    } else {
        pkg = APP.getSea().getPackage(info["package"]);
    }
    code = code.replace(/__RESOURCE__/g, APP.getResourceUrlForPackage(pkg));
    return code;
}    

