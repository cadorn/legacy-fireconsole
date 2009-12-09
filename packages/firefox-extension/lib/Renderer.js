

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util");
var APP = require("app", "nr-common").getApp();
var TEMPLATE_PACK = require("./TemplatePack");
var TEMPLATE_PACK_LOADER = require("loader", "template-pack");
var REPS = require("Reps", "reps");



var masterPacks = {
    "Console": TEMPLATE_PACK_LOADER.requirePack("github.com/cadorn/fireconsole/raw/master/firefox-extension-reps"),
    "VariableViewer": TEMPLATE_PACK_LOADER.requirePack("github.com/cadorn/fireconsole/raw/master/firefox-extension-reps")
};


exports.getForMessage = function(type, meta, og) {

    var template = TEMPLATE_PACK.getTemplate(meta);
    if(template===null) {
        return null;
    } else
    if(!template) {
        template = TEMPLATE_PACK.seekTemplate(og.getOrigin());
    }

    return new Renderer(type, template, meta);
}

exports.getForId = function(type, id) {
    var template = TEMPLATE_PACK.getTemplate({
        "fc.tpl.id": id
    });
    return new Renderer(type, template, {});
}



var Renderer = function(type, template, meta) {
    
    this.type = type;
    this.template = template;
            
    var master;
    if(type=="Console") {
        master = REPS.getMaster("Firebug");
    } else
    if(type=="VariableViewer") {
        master = REPS.getMaster("VariableViewer");
    }
        
    master.setTemplate(template);

    this.rep = master.getRep(meta);
}

Renderer.prototype.registerCss = function(tracker) {

    if(masterPacks[this.type]) {
        tracker.registerCSS(masterPacks[this.type].getResources().css, cssProcessor, false);
    }

    var resources = this.template.pack.getResources();
    if(resources && UTIL.has(resources, "css")) {
        tracker.registerCSS(resources.css, cssProcessor, this.template.reloaded);
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


