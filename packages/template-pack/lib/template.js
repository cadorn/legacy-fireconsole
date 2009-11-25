
var UTIL = require("util");
var FILE = require("file");
var DOMPLATE = require("domplate", "domplate");
var DEFAULT_REP = require("default-rep", "domplate");

exports.Template = function(templateModule) {
    var Template = function() {};
    var self = new Template();
    
    self.id = determineId();

    self.setPack = function(pack) {
        self.pack = pack;
        loadRep();
        self.rep.setTemplatePack(pack);
    }
    
    self.toString = function() {
        return "Template["+templateModule.path+"]";
    }
    
    function loadRep() {
        self.rep = DOMPLATE.domplate(DEFAULT_REP.extend(self.onLoad(self.pack, DOMPLATE.tags)));
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
