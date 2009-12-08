

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



var UTIL = require("util");
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


