
var MESSAGE_BUS = require("../MessageBus");
var WILDFIRE = require("wildfire", "wildfire-js");
var MESSAGE_STORE = require("./MessageStore");


exports.initialize = function() {

    // Register wildfire channel receivers for DeveloperCompanion        
        
    var httpHeaderChannel = MESSAGE_BUS.getHttpHeaderChannel();

    var consoleReceiver = WILDFIRE.Receiver();
    consoleReceiver.setId("http://registry.pinf.org/developercompanion.com/@meta/receiver/console/0.1.0");
    consoleReceiver.addListener(ConsoleMessageListener);

    httpHeaderChannel.addReceiver(consoleReceiver);

    var insightReceiver = WILDFIRE.Receiver();
    insightReceiver.setId("http://registry.pinf.org/developercompanion.com/@meta/receiver/insight/0.1.0");
    insightReceiver.addListener(InsightMessageListener);

    httpHeaderChannel.addReceiver(insightReceiver);
}


var InsightMessageListener = {

    onMessageGroupStart: function(context) {
    },

    onMessageGroupEnd: function(context) {
    },

    onMessageReceived: function(context, message) {
        try {
            MESSAGE_STORE.addMessage(context, message);
        } catch(e) {
            system.log.warn(e);
        }
    }
}


var ConsoleMessageListener = {

    buffer: [],

    onMessageGroupStart: function(context) {
    },

    onMessageGroupEnd: function(context) {
    },

    onMessageReceived: function(context, message) {
        
        try {
/*
            var data = {
                "og": OBJECT_GRAPH.generateFromMessage(message),
                "meta": JSON.decode(message.getMeta() || "{}"),
                "domain": URI.parse(context.FirebugNetMonitorListener.file.href).domain
            }
*/
print("LOG CONSOLE MESSAGE");    

        } catch(e) {

            // TODO: What happens when template pack is not authorized yet?

            system.log.warn(e);
        }
    }
}

