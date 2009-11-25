
var UTIL = require("util");
var FILE = require("file");
var MD5 = require("md5");
var STRUCT = require("struct");
var DOMPLATE = require("domplate", "domplate");
var DEFAULT_REP = require("default-rep", "domplate");

exports.Template = function(templateModule) {
    var Template = function() {};
    var self = new Template();
    
    var resourcePath = FILE.Path(templateModule.path).dirname().dirname().join("resources");
    var key = "_"+STRUCT.bin2hex(MD5.hash(templateModule.path))+"_";
    
    var parts = [];
    var path = FILE.Path(templateModule.path);
    while(path.basename()!="lib" && parts.length<10) {
        parts.push(path.basename());
        path = path.dirname();
    }
    path = parts.join("/");   
    self.id = path.substring(0,path.length-3);

    self.resources = {"css": []};
    self.addCss = function(path) {
        path = resourcePath.join(path);
        if(!path.exists()) {
            throw "resource not found at: " + path;
        }
        self.resources.css.push({
            "package": templateModule["package"],
            "path": path.valueOf(),
            "key": key,
            "resourcePath": resourcePath.valueOf()
        });
    }
    
    self.setRep = function(rep) {
        self.rep = DOMPLATE.domplate(DEFAULT_REP.extend(rep(DOMPLATE.tags)));
    }
    
    self.getKey = function() {
        return key;
    }
    
    self.setTemplatePack = function(pack) {
        self.rep.setTemplatePack(pack);
    }
    
    self.toString = function() {
        return "Template["+templateModule.path+"]";
    }
    
    return self;
}
