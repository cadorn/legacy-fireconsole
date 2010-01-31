
var FILE = require("file");
var DOMPLATE = require("domplate", "domplate");
var DOMPLATE_UTIL = require("util", "domplate");


exports.Template = function(templateModule) {
    var Template = function() {};
    var self = new Template();

    var rawRep;

    self.id = determineId();

    self.toString = function() {
        return "Template["+templateModule.path+"]";
    }
    
    self.newInstance = function(pack) {
        var template = Object.create(self);
        template.pack = pack;

        template.rep = getRep(pack);
        template.getRep = function(freshCompile) {
            if(freshCompile) {
                return getRep(pack);
            }
            return template.rep;
        }

        return template;
    }
    
    function getRep(pack) {
        var rep = {};

        rep.toString = function() {
            return "Rep["+templateModule.path+"]";
        }

        // inject resources
        rep._resources = function() {
            return pack.getResources();
        };

        // inject general util functions
        rep.util = DOMPLATE_UTIL;
        
        // inject more util funcitons
        rep.getRepForNode = function(node)
        {
            if(node.getTemplateId) {
                var id = node.getTemplateId();
                if(id) return rep.getRepForId(id);
            }
            var template = pack.seekTemplate(node, true);
            if(!template) {
                var error = new Error("No template found for node");
                error.notes = {
                    "node": node
                };
                throw error;
            }
            return template.rep;
        };
        rep.getRepForId = function(id)
        {
            var template = pack.getTemplate(id, true);
            if(!template) {
                var error = new Error("No template found for ID");
                error.notes = {
                    "id": id
                };
                throw error;
            }
            return template.rep;
        };
        rep.dispatchEvent = function(name, args) {
        }
        
        if(!rawRep) {
            // TODO: pass a sanitized pack that does not include instance methods
            rawRep = self.onLoad(pack, DOMPLATE.tags);
        }
        
        // fetch the rep from the template and merge our additions
        return DOMPLATE.domplate(rawRep, rep);
    }

    function determineId() {
        var parts = [];
        var path = FILE.Path(templateModule.path);
        while(path.basename()!="lib" && parts.length<10) {
            parts.push(path.basename());
            path = path.dirname();
        }
        path = parts.join("/");   
        return path.substring(0,path.length-3);
    }

    return self;
}
