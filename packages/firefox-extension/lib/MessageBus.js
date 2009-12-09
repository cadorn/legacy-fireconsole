

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


const OBSERVER_SERVICE = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

var UTIL = require("util");
var JSON = require("json");
var FIREBUG_INTERFACE = require("interface", "firebug");
var WILDFIRE = require("wildfire", "wildfire-js");
var PAGE_INJECTOR = require("./PageInjector");


var contentEventListener,
    httpheaderChannel,
    templatePackReceiver,
    fireConsoleReceiver;

exports.initialize = function(options)
{
    OBSERVER_SERVICE.addObserver(OnModifyRequestObserver, "http-on-modify-request", false);

    templatePackReceiver = WILDFIRE.Receiver();
    templatePackReceiver.setId("http://pinf.org/cadorn.org/fireconsole/meta/Receiver/TemplatePack/0.1");
    templatePackReceiver.addListener(options.TemplatePackReceiverListener);

    fireConsoleReceiver = WILDFIRE.Receiver();
    fireConsoleReceiver.setId("http://pinf.org/cadorn.org/fireconsole/meta/Receiver/Console/0.1");
    fireConsoleReceiver.addListener(options.ConsoleMessageListener);

    httpheaderChannel = WILDFIRE.HttpHeaderChannel();
    httpheaderChannel.addReceiver(templatePackReceiver);
    httpheaderChannel.addReceiver(fireConsoleReceiver);
    
    FIREBUG_INTERFACE.addListener('NetMonitor', ['onResponseBody'], httpheaderChannel.getFirebugNetMonitorListener());
    FIREBUG_INTERFACE.addListener('Console', ['onConsoleInjected'], FirebugConsoleListener);
    
    contentEventListener = options.ContentEventListener;
}


exports.shutdown = function()
{
    FIREBUG_INTERFACE.removeListener('NetMonitor', httpheaderChannel.getFirebugNetMonitorListener());
    FIREBUG_INTERFACE.removeListener('Console', ['onConsoleInjected'], FirebugConsoleListener);
    OBSERVER_SERVICE.removeObserver(OnModifyRequestObserver, "http-on-modify-request");
}


var FirebugConsoleListener = {   
    onConsoleInjected: function(context, win)
    {
        context.window.addEventListener("FireConsoleContentEvent", OnFireConsoleContentEvent, true);
        PAGE_INJECTOR.injectAPI(context.window);
    }
};

var OnFireConsoleContentEvent = function(Event) {
    try {
        var eventName = Event.target.getAttribute("___eventName");
        var messageIndex = Event.target.getAttribute("___messageIndex");
//        var params = Event.target.getAttribute("params");
        var params = Event.target.ownerDocument.defaultView.FireConsoleAPI._pullMessage(messageIndex);
        Event.target.parentNode.removeChild(Event.target);
        
        // WARNING: Do NOT execute anything from "params" as it is a JS object passed from the
        //          content page. Only pull data from it.

        contentEventListener.onEvent(Event.target.ownerDocument.defaultView, eventName, params);

    } catch(e) {
        print("ERROR: " + e);
    }
};


var OnModifyRequestObserver = {

    observe: function(subject, topic, data)
    {
        if (topic == "http-on-modify-request") {
            var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
            
            /* Add FirePHP/X.X.X to User-Agent header if not already there and firephp is enabled.
             * If firephp is not enabled remove header from request if it exists.
             */
            
            if (httpChannel.getRequestHeader("User-Agent").match(/\sWildfire\s?/) == null) {
//            if (this.isEnabled()) {
                httpChannel.setRequestHeader("User-Agent", httpChannel.getRequestHeader("User-Agent") + ' ' +
                "Wildfire", false);
//            }
            }

            if (httpChannel.getRequestHeader("User-Agent").match(/\sFirePHP\/([\.|\d]*)\s?/) == null) {
//            if (this.isEnabled()) {
                httpChannel.setRequestHeader("User-Agent", httpChannel.getRequestHeader("User-Agent") + ' ' +
                "FirePHP/1.0", false);
//            }
            }

        }
    } 
};

