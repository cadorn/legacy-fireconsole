
var APPS = require("apps", "nr-common");


var plugins = [];

exports.initialize = function() {
    APPS.onReady(function() {
        APPS.dispatchEvent("http://registry.pinf.org/cadorn.org/github/fireconsole/@meta/events/insight/gather/plugins/0.1.0", {
            registerPlugin: function(info) {
                plugins.push(new Plugin(info));
            }
        });
    });
}

exports.getPlugins = function() {
    return plugins;
}

exports.getPluginForID = function(id) {
    var found = false;
    plugins.forEach(function(plugin) {
        if(found) return;
        if(plugin.id==id) {
            found = plugin;
        }
    });
    return found;
}

var Plugin = function(info) {
    this.label = info.label;
    this.id = info.id,
    this.launch = info.launch;
}
