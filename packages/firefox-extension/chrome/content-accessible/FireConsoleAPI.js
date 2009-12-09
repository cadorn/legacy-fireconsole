
(function(){

var listeners = [];
var messages = {}
var messageIndex = 0;

var FireConsoleAPI = function() {};

FireConsoleAPI.prototype._pullMessage = function(id) {
    if(typeof messages[id] == undefined) {
        return null;
    }
    var msg = messages[id];
    delete messages[id];
    return msg;
}

FireConsoleAPI.prototype.getVersion = function() {
    return top.FireConsole.version;
}

FireConsoleAPI.prototype.test = function(suite) {
    dispatchChromeEvent("test", {
        "suite": suite
    });
}

FireConsoleAPI.prototype.registerTemplatePack = function(info) {
    dispatchChromeEvent("registerTemplatePack", {
        "info": info
    });
}


FireConsoleAPI.prototype.bind = function(eventName, callback) {
    // TODO: check for duplicates
    listeners.push([eventName, callback]);
}

top.FireConsoleAPI = new FireConsoleAPI();


// fire ready event
var event = top.document.createEvent("Events");
event.initEvent("fireconsole-api-ready", true, false);
top.document.dispatchEvent(event);


function dispatchChromeEvent(name, params) {
    var element = top.document.createElement("FireConsoleContentEvenData");
    element.setAttribute("___eventName", name);
    messages[++messageIndex] = params;
    element.setAttribute("___messageIndex", messageIndex);
    top.document.documentElement.appendChild(element);
    
    var evt = top.document.createEvent("Events");
    evt.initEvent("FireConsoleContentEvent", true, false);
    element.dispatchEvent(evt);
}

function dispatchPageEvent(name, params) {
    
    var event = {
        "name": name,
        "params": params
    };
    
    for( var i=0 ; i<listeners.length ; i++ ) {
        if(listeners[i][0]==name) {
            listeners[i][1](event);
        }
    }
}

})();
