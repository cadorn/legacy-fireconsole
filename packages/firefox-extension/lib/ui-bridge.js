
var UTIL = require("util");
var APP = require("app", "nr-common").getApp();

var EXTENSION_MANAGER = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager);

var URLS = {
    main: "http://www.fireconsole.org/",
    docs: "http://wiki.github.com/cadorn/fireconsole/",
    discuss: "http://groups.google.com/group/fireconsole",
    issues: "http://github.com/cadorn/fireconsole/issues"
};



var Bridge = function() {}

Bridge.prototype.visitWebsite = function(which) {
    if(!UTIL.has(URLS, which)) {
        throw "URL for '" + which + "' not defined!";
    }
    var url = URLS[which];
    if(which=='hq') url += "?Trigger=User";
    APP.getChrome().openNewTab(url);
}

Bridge.prototype.openAboutDialog = function() {
    APP.getChrome().getWindow().openDialog("chrome://mozapps/content/extensions/about.xul", "",
        "chrome,centerscreen,modal",
        "urn:mozilla:item:" + APP.getInfo().ID,
        EXTENSION_MANAGER.datasource);
}

exports.init = function(chrome) {
    return new Bridge();    
}
