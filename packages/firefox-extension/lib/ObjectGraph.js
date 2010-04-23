

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



var UTIL = require("util");
var JSON = require("json");
var ENCODER = require("encoder/default", "fireconsole-js");



exports.EXTENDED = "EXTENDED";
exports.SIMPLE = "SIMPLE";


exports.generateFromMessage = function(message, format) {

    format = format || exports.EXTENDED;

    var og = new ObjectGraph();

    var meta = JSON.decode(message.getMeta() || "{}"),
        data;

    if(meta["fc.msg.preprocessor"] && meta["fc.msg.preprocessor"]=="FirePHPCoreCompatibility") {
        var parts = convertFirePHPCoreData(meta, message.getData());
        message.setMeta(JSON.encode(parts[0]));
        data = parts[1];
    } else {
        data = JSON.decode(message.getData());
    }

    if(data.instances) {
        for( var i=0 ; i<data.instances.length ; i++ ) {
            data.instances[i] = generateNodesFromData(og, data.instances[i]);
        }
        og.setInstances(data.instances);
    }

    if(meta["fc.lang.id"]) {
        og.setLanguageId(meta["fc.lang.id"]);
    }
    
    if(UTIL.has(data, "origin")) {
        if(format==exports.EXTENDED) {
            og.setOrigin(generateNodesFromData(og, data.origin));
        } else
        if(format==exports.SIMPLE) {
            og.setOrigin(generateObjectsFromData(og, data.origin));
        } else {
            throw new Error("unsupported format: " + format);
        }
    }

    return og;
}

function generateObjectsFromData(objectGraph, data) {

    var node;

    if(data.type=="array") {
        node = [];
        for( var i=0 ; i<data[data.type].length ; i++ ) {
            node.push(generateObjectsFromData(objectGraph, data[data.type][i]));
        }
    } else
    if(data.type=="map") {
        node = [];
        for( var i=0 ; i<data[data.type].length ; i++ ) {
            node.push([
                generateObjectsFromData(objectGraph, data[data.type][i][0]),
                generateObjectsFromData(objectGraph, data[data.type][i][1])
            ]);
        }
    } else
    if(data.type=="dictionary") {
        node = {};
        for( var name in data[data.type] ) {
            node[name] = generateObjectsFromData(objectGraph, data[data.type][name]);
        }
    } else {
        node = data[data.type];
    }

    return node;
}


function generateNodesFromData(objectGraph, data) {
    
    var node = new Node(objectGraph, data);
    
    // some types need nested nodes decoded
    if(node.type=="array") {
        for( var i=0 ; i<node.value.length ; i++ ) {
            node.value[i] = generateNodesFromData(objectGraph, node.value[i]);
        }
    } else
    if(node.type=="map") {
        for( var i=0 ; i<node.value.length ; i++ ) {
            node.value[i][0] = generateNodesFromData(objectGraph, node.value[i][0]);
            node.value[i][1] = generateNodesFromData(objectGraph, node.value[i][1]);
        }
    } else
    if(node.type=="dictionary") {
        for( var name in node.value ) {
            node.value[name] = generateNodesFromData(objectGraph, node.value[name]);
        }
    }
        
    return node;
}



var Node = function(objectGraph, data) {
    var self = this;
    self.type = data.type;
    self.value = data[data.type];
    self.meta = {};
    UTIL.every(data, function(item) {
        if(item[0].substr(0,3)=="fc.") {
            self.meta[item[0]] = item[1];
        }
    });
    if(self.type=="reference") {
        self.getInstance = function() {
            return objectGraph.getInstance(self.value);
        }
    }
    self.getObjectGraph = function() {
        return objectGraph;
    }
}

Node.prototype.getTemplateId = function() {
    if(UTIL.has(this.meta, "fc.tpl.id")) {
        return this.meta["fc.tpl.id"];
    }
    return false;
}


var ObjectGraph = function() {}
//ObjectGraph.prototype = Object.create(new Node());

ObjectGraph.prototype.setOrigin = function(node) {
    this.origin = node;
}

ObjectGraph.prototype.getOrigin = function() {
    return this.origin;
}

ObjectGraph.prototype.setInstances = function(instances) {
    this.instances = instances;
}

ObjectGraph.prototype.getInstance = function(index) {
    return this.instances[index];
}

ObjectGraph.prototype.setLanguageId = function(id) {
    this.languageId = id;
}

ObjectGraph.prototype.getLanguageId = function() {
    return this.languageId;
}


var encoder = ENCODER.Encoder();
function convertFirePHPCoreData(meta, data) {
    data = encoder.encode(data, null, {
        "jsonEncode": false
    });
    return [meta, data]; 
}

