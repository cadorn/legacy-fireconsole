
var INTERFACE = require("./interface");

var FBTrace = Components.classes["@joehewitt.com/firebug-trace-service;1"]
        .getService(Components.interfaces.nsISupports)
        .wrappedJSObject.getTracer("extensions.fireconsole");

var ready = false,
    buffer = [];

exports.open = function() {
    
    INTERFACE.onReady(function() {

        INTERFACE.getFirebug().TraceModule.openConsole("extensions.fireconsole");
        
        ready = true;
        
        buffer.forEach(function(frame) {
            sysout(frame[0], frame[1]);
        });
        
        buffer = [];
    });
}

function sysout(label, message) {
    if(!ready) {
        buffer.push([label, message]);
    } else {
        FBTrace.sysout(label, message);
    }
}


exports.log = function(message, label) {
    if(!label) {
        label = message;
    }
    sysout(label, message);
}

