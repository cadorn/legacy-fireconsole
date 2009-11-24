

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


const OBSERVER_SERVICE = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

var JSON = require("json");
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var WILDFIRE = require("wildfire", "wildfire-js");
var PAGE_INJECTOR = require("./PageInjector");
var SECURITY = require("./Security");
var TEMPLATE_PACK = require("./TemplatePack");


var httpheaderChannel,
    templatePackReceiver,
    fireConsoleReceiver;

exports.initialize = function(options)
{
    OBSERVER_SERVICE.addObserver(OnModifyRequestObserver, "http-on-modify-request", false);

    templatePackReceiver = WILDFIRE.Receiver();
    templatePackReceiver.setId("http://pinf.org/cadorn.org/fireconsole/meta/TemplatePack");
    templatePackReceiver.addListener(TemplatePackReceiverListener);

    fireConsoleReceiver = WILDFIRE.Receiver();
    fireConsoleReceiver.setId("http://pinf.org/cadorn.org/fireconsole/meta/Console");
    fireConsoleReceiver.addListener(options.ConsoleMessageListener);

    httpheaderChannel = WILDFIRE.HttpHeaderChannel();
    httpheaderChannel.addReceiver(templatePackReceiver);
    httpheaderChannel.addReceiver(fireConsoleReceiver);
    
    FIREBUG_INTERFACE.addListener('NetMonitor', ['onResponseBody'], httpheaderChannel.getFirebugNetMonitorListener());
//    FIREBUG_INTERFACE.addListener('Module', ['initContext', 'destroyContext'], FirebugModuleListener);
    FIREBUG_INTERFACE.addListener('Console', ['onConsoleInjected'], FirebugConsoleListener);
}


exports.shutdown = function()
{
    FIREBUG_INTERFACE.removeListener('NetMonitor', httpheaderChannel.getFirebugNetMonitorListener());
    FIREBUG_INTERFACE.removeListener('Console', ['onConsoleInjected'], FirebugConsoleListener);
    OBSERVER_SERVICE.removeObserver(OnModifyRequestObserver, "http-on-modify-request");
}


var TemplatePackReceiverListener = {
    onMessageReceived: function(message, context) {
        try {
            var data = JSON.decode(message.getData());
            if(data.action=="require") {
                data = data.info;
                data.domain = context.FirebugNetMonitorListener.context.window.location.hostname;
                var pack = TEMPLATE_PACK.TemplatePack(data);
                pack.getCollection();
            }
        } catch(e) {
            print("ERROR: "+e);
        }
    }    
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
        var params = Event.target.getAttribute("params");
        Event.target.parentNode.removeChild(Event.target);
        
        switch(eventName) {
          case "test":
            require("./TestRunner").run(FIREBUG_CONSOLE);
            break;
        }
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

