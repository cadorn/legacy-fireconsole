

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util", "nr-common");

var COLLECTION = require("collection", "domplate");
var DOMPLATE = require("domplate", "domplate");
var FIREBUG_INTERFACE = require("interface", "firebug");



var firebugMaster,
    variableViewerMaster;

exports.getMaster = function(name) {
    if(name=="Firebug") {
        if(firebugMaster) return firebugMaster;
        var MASTER = require("./FirebugMaster");
        return firebugMaster = new MASTER.FirebugMaster();
    } else
    if(name=="VariableViewer") {
        if(variableViewerMaster) return variableViewerMaster;
        var MASTER = require("./VariableViewerMaster");
        return variableViewerMaster = new MASTER.VariableViewerMaster();
    }
    throw "Master rep with name '" + name + "' not supported!";
}


var Master = exports.Master = function() {}

Master.prototype.construct = function(collection) {
    this.collection = COLLECTION.Collection();
    this.collection.addCollection(collection);
 
    this.collection.addCollection(require("collection", "reps-fc-object-graph").getCollection());
   
//    this.collection.addCollection(require("collection", "reps-structures").getCollection());
//    this.collection.addCollection(require("collection", "reps-lang-php").getCollection());
    this.tags = DOMPLATE.tags;
}

Master.prototype.getCollection = function()
{
    return this.collection;
}

//Master.prototype.getRepForObject = function(object, meta)
Master.prototype.getRepForNode = function(node)
{
    // Try and get specific rep first
    var rep = this.collection.getForNode(node);
//    var rep = this.collection.getForObject(object, meta);
    // Fall back to Firebug reps
    if(!rep) {
//        rep = FIREBUG_INTERFACE.getFirebug().getRep(node.value);
        throw "No rep found for node!";
    }
    return rep;
};

Master.prototype.getCss = function()
{
    return this.collection.getCss();
};

Master.prototype.injectCss = function(document, callback)
{
    this.collection.injectCss(document, callback);
};

Master.prototype.extend = function(rep)
{
    return DOMPLATE.domplate(this.rep, rep);
}




exports.factory = function(uri, master) {

    if(typeof master == "string") {
        master = exports.getMaster(master);
    }

    var path = null;


    // For backwards compatibility with FirePHPCore

    var type = uri.toLowerCase();
    switch(type)
    {
        case 'log':
        case 'info':
        case 'warn':
        case 'error':
            path = type.substr(0,1).toUpperCase() + type.substr(1);
            break;

        case 'group_start':
            path = 'GroupStart';
            break;

        case 'group_end':
            path = 'GroupEnd';
            break;
            
        default:
            if(master) {
                return master.rep;
            }
            break;
    }
    
    if(!path) {
        throw new Error("Rep for URI '" + type + "' not found!");
    }
    
    if(!master) {
        return require("./Reps/" + path);
    }
    
    var id = require.loader.resolve("./Reps/" + path, module.id);
    var path = require.loader.find(id);
    var code = system.fs.read(path, {'charset': 'utf-8'});

    try {

        with(master.tags) {
            
            var extend = UTIL.object.extend;
            var master = master;
            var rep = null;

            eval(code);
            
            return master.extend(rep);

        }

    } catch(e) {
        print(e,'ERROR');
    }
}

