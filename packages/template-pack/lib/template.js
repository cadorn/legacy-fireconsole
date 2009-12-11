
var FILE = require("file");
var DOMPLATE = require("domplate", "domplate");
var DOMPLATE_UTIL = require("util", "domplate");


exports.Template = function(templateModule) {
    var Template = function() {};
    var self = new Template();

    self._reload = false;

    self.id = determineId();

    self.setPack = function(pack) {
        self.pack = pack;

        self.rep = getRep();
        self.getRep = function(freshCompile) {
            if(freshCompile) {
                return getRep();
            }
            return self.rep;
        }
    }

    self.toString = function() {
        return "Template["+templateModule.path+"]";
    }
    
    function getRep() {
        var rep = {};

        // inject resources
        rep._resources = function() {
            return self.pack.getResources();
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
            var template = self.pack.seekTemplate(node, true, self._reload);
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
            var template = self.pack.getTemplate(id, true, self._reload);
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
        
        // fetch the rep from the template and merge our additions
        return DOMPLATE.domplate(self.onLoad(self.pack, DOMPLATE.tags), rep);
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
