
var UTIL = require("util");
var CHROME_UTIL = require("chrome-util", "nr-common");
var APP = require("app", "nr-common").getApp();

var EXTENSION_MANAGER = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager);

var URLS = {
    hq: "http://www.firephp.org/HQ",
    main: "http://www.fireconsole.org/",
    docs: "http://www.firephp.org/HQ/Use.htm",
    discuss: "http://www.firephp.org/HQ/Help.htm",
    issues: "http://code.google.com/p/firephp/issues/list",
    donate: "http://www.firephp.org/HQ/Contribute.htm?Trigger=Donate"
};



var Bridge = function() {}

Bridge.prototype.visitWebsite = function(which) {
    if(!UTIL.has(URLS, which)) {
        throw "URL for '" + which + "' not defined!";
    }
    var url = URLS[which];
    if(which=='hq') url += "?Trigger=User";
    CHROME_UTIL.openNewTab(url);
}

Bridge.prototype.openAboutDialog = function() {
    CHROME_UTIL.getWindow().openDialog("chrome://mozapps/content/extensions/about.xul", "",
        "chrome,centerscreen,modal",
        "urn:mozilla:item:" + APP.getInfo().ID,
        EXTENSION_MANAGER.datasource);
}

exports.init = function(chrome) {
    return new Bridge();    
}
