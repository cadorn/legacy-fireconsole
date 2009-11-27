
var FILE = require("file");
var UTIL = require("util");
var MD5 = require("md5");
var STRUCT = require("struct");

exports.Factory = function(factoryModule) {
    var Factory = function() {};
    var self = new Factory();

    var templates = [];
    var templatesDict = {};
    
    var resourcePath = FILE.Path(factoryModule.path).dirname().dirname().join("resources");
    var key = "_"+STRUCT.bin2hex(MD5.hash(factoryModule.path))+"_";
    
    var resources = {"css": []};
    self.registerCss = function(path) {
        path = resourcePath.join(path);
        if(!path.exists()) {
            throw "resource not found at: " + path;
        }
        resources.css.push({
            "package": factoryModule["package"],
            "path": path.valueOf(),
            "key": key,
            "resourcePath": resourcePath.valueOf()
        });
    }
    
    self.getResources = function() {
        return resources;
    }
    
    self.getKey = function() {
        return key;
    }

    self.registerTemplate = function(id) {
        try {
            var template = require(id, factoryModule["package"]).template;
            template.setPack(self);
            templates.push(template);
            templatesDict[template.id] = template;
        } catch(e) {
            print("Error while registering template: " + id);
            print(e);
            throw e;
        }
    }
    
    self.getTemplate = function(id) {
        if(!UTIL.has(templatesDict, id)) {
            return false;
        }
        return templatesDict[id];
    }
    
    self.seekTemplate = function(node) {
        for( var i=0 ; i<templates.length ; i++ ) {
            if(UTIL.has(templates[i], "supportsNode") && templates[i].supportsNode(node)) {
                return templates[i];
            }
        }
        return false;
    }
    
    return self;    
}
