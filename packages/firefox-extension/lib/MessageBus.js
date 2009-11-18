

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


const OBSERVER_SERVICE = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

var FIREBUG_INTERFACE = require("interface", "firebug");
var WILDFIRE = require("wildfire", "wildfire-js");





var httpheaderChannel,
    fireconsoleReceiver;

exports.initialize = function(options)
{
    OBSERVER_SERVICE.addObserver(OnModifyRequestObserver, "http-on-modify-request", false);
    
    fireconsoleReceiver = WILDFIRE.Receiver();
    fireconsoleReceiver.setId("http://pinf.org/cadorn.org/fireconsole");
    fireconsoleReceiver.addListener(options.ServerMessageListener);

    httpheaderChannel = WILDFIRE.HttpHeaderChannel();
    httpheaderChannel.addReceiver(fireconsoleReceiver);
    
    FIREBUG_INTERFACE.addListener('NetMonitor', ['onResponseBody'], httpheaderChannel.getFirebugNetMonitorListener());
}


exports.shutdown = function()
{
    FIREBUG_INTERFACE.removeListener('NetMonitor', httpheaderChannel.getFirebugNetMonitorListener());
    OBSERVER_SERVICE.removeObserver(OnModifyRequestObserver, "http-on-modify-request");
}



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
}

