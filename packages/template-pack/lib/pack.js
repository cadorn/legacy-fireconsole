

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var FILE = require("file");
var UTIL = require("util");
var MD5 = require("md5");
var STRUCT = require("struct");


var logger,
    eventDispatcher;
exports.setLogger = function(obj) {
    logger = obj;    
}
exports.setEventDispatcher = function(dispatcher) {
    eventDispatcher = dispatcher;    
}

exports.Pack = function(factoryModule) {
    var Pack = function() {};
    var self = new Pack();
    self.logger = logger;
    self.dispatchEvent = function(name, args) {
        eventDispatcher.dispatch(name, args);
    }
    
    var templates = [];
    var templatesDict = {};
    
    var resourcePath = FILE.Path(factoryModule.path).dirname().dirname().join("resources");
    self.__KEY__ = "_"+STRUCT.bin2hex(MD5.hash(factoryModule.path))+"_";
    
    var resources = {};
    self.registerCss = function(path) {
        path = resourcePath.join(path);
        if(!path.exists()) {
            throw "resource not found at: " + path;
        }
        resources[path] = {
            "type": "css",
            "package": factoryModule["package"],
            "path": path.valueOf(),
            "key": self.__KEY__,
            "resourcePath": resourcePath.valueOf()
        };
    }
    
    self.getResources = function() {
        return resources;
    }

    self.registerTemplate = function(id) {
        try {
            var template = require(id, factoryModule["package"]).template;
            templates.push(template);
            templatesDict[template.id] = template;
        } catch(e) {
            print("Error while registering template: " + id);
            print(e);
            throw e;
        }
    }
    
    self.newInstance = function() {
        
        var externalLoader = null;
        
        var pack = Object.create(self);

        pack.getTemplate = function(id, checkExternal) {
            checkExternal = checkExternal || false;
            if(!UTIL.has(templatesDict, id)) {
                if(checkExternal && externalLoader) {
                    return externalLoader().getTemplateForId(id);
                }
                return false;
            }
            return templatesDict[id].newInstance(this);
        }
    
        pack.seekTemplate = function(node, checkExternal) {
            checkExternal = checkExternal || false;
            for( var i=0 ; i<templates.length ; i++ ) {
                if(UTIL.has(templates[i], "supportsNode") && templates[i].supportsNode(node)) {
                    return templates[i].newInstance(this);
                }
            }
            if(checkExternal && externalLoader) {
                return externalLoader().seekTemplate(node);
            }
            return false;
        }
    
        pack.setExternalLoader = function(loader) {
            externalLoader = loader;
        }

        return pack;
    }
    
    return self;    
}
