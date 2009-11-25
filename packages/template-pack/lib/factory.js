
var FILE = require("file");
var UTIL = require("util");

exports.Factory = function(factoryModule) {
    var Factory = function() {};
    var self = new Factory();

    var templates = [];
    var templatesDict = {};

    self.registerTemplate = function(id) {
        try {
            var template = require(id, factoryModule["package"]).template;
            template.setTemplatePack(self);
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
