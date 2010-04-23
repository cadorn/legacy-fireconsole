
var OBJECT_GRAPH = require("../ObjectGraph");
var JSON = require("json");
var URI = require("uri");


var messages = [];


exports.addMessage = function(context, wildfireMessage) {

    var msg = new Message(context.FirebugNetMonitorListener.file);
    messages.push(msg);
    
    msg.parse(wildfireMessage, context);
}

exports.getMessageForFile = function(file) {
    for( var i = 0, s = messages.length ; i<s ; i++ ) {
        if(messages[i].file===file) {
            return messages[i];
        }
    }
    return false;
}


var Message = function(file) {
    this.file = file;
}

Message.prototype.parse = function(wildfireMessage, context) {
    this.og = OBJECT_GRAPH.generateFromMessage(wildfireMessage, OBJECT_GRAPH.SIMPLE);
    this.meta = JSON.decode(wildfireMessage.getMeta() || "{}");
    this.domain = URI.parse(context.FirebugNetMonitorListener.file.href).domain;
}

Message.prototype.getAction = function() {
    return this.og.getOrigin().action;
}
