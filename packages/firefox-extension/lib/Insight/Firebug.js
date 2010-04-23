
var MESSAGE_STORE = require("./MessageStore");
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var DOMPLATE = require("domplate", "domplate");
var DOMPLATE_UTIL = require("util", "domplate");
var PLUGINS = require("./Plugins");


var NetInfoInsightTabRep;

exports.initialize = function() {
    FIREBUG_INTERFACE.addListener('NetInfoBody', [
        'initTabBody',
        'destroyTabBody',
        'updateTabBody'
    ], NetInfoBodyListener);
}

// @see http://www.softwareishard.com/blog/firebug-tutorial/extending-firebug-customize-net-panel-part-vii/
var NetInfoBodyListener = {

    initTabBody: function(infoBox, file) {
        var message = MESSAGE_STORE.getMessageForFile(file);
        if(message) {
            if(message.getAction()=="stop") {
                FIREBUG_INTERFACE.getFirebug().NetMonitor.NetInfoBody.appendTab(infoBox, "Insight", "Insight");
            }
        }
    },

    destroyTabBody: function(infoBox, file) {
    },

    updateTabBody: function(infoBox, file, context) {
        var tab = infoBox.selectedTab;
        if (tab.dataPresented || !DOMPLATE_UTIL.hasClass(tab, "netInfoInsightTab")) {
            return;
        }
        tab.dataPresented = true;
    
        var tabBody = DOMPLATE_UTIL.getElementByClass(infoBox, "netInfoInsightText");
    
        NetInfoInsightTabRep.tag.replace({object: ""}, tabBody);
    }
}

with(DOMPLATE.tags) {

    // TODO: Only display FirePHP+ link if FirePHP Insight server library is used and FirePHP+ is installed.
    //       If FirePHP+ is not installed display install message.
    //       Install info etc... is loaded via a dynamic template specified by server library

    NetInfoInsightTabRep = DOMPLATE.domplate({
        
        tag:
            FOR("plugin", "$object|getPlugins",
                DIV({"_pluginObject": "$plugin"},
                    A({"onmousedown": "$launch"}, "Launch $plugin.label")
                )
            ),
        
        getPlugins: function() {
            return PLUGINS.getPlugins();
        },
        
        launch: function(event) {
            try {
                event.target.parentNode.pluginObject.launch();
            } catch(e) {
                system.log.error(e);
            }
        }
    });

}
