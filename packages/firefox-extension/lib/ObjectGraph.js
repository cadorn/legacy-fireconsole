

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



//var UTIL = require("util");
var JSON = require("json");


exports.generateFromMessage = function(message) {
        
    var og = new ObjectGraph();
    
    var meta = JSON.decode(message.getMeta() || "{}");
    
    var data = JSON.decode(message.getData());

    if(data.instances) {
        for( var i=0 ; i<data.instances.length ; i++ ) {
            data.instances[i] = generateNodesFromData(og, data.instances[i]);
        }
        og.setInstances(data.instances);
    }

    og.setOrigin(generateNodesFromData(og, data.origin));
    
    return og;
}



function generateNodesFromData(objectGraph, data) {
    
    var node = new Node(objectGraph, data.type, data[data.type]);
    
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



var Node = function(objectGraph, type, value) {
    this.type = type;
    this.value = value;
    
    if(type=="reference") {
        this.getInstance = function() {
            return objectGraph.getInstance(value);
        }
    }
}

Node.prototype.getTemplateId = function() {
    
}

var ObjectGraph = function() {}
ObjectGraph.prototype = Object.create(new Node());

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


