
var APP = require("app", "nr-common").getApp();


exports.injectAPI = function(window) {
    
    // only inject once
    if(window.FireConsole) {
        return;
    }
    
    window.FireConsole = {
        "version": APP.getInfo().Version,
        "loadAPI": function() {
            var script = window.document.createElementNS("http://www.w3.org/1999/xhtml", "script");
            script.setAttribute("charset","utf-8");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", APP.getAppPackage().getTemplateVariables()["Package.AccessibleContentBaseURL"] + "FireConsoleAPI.js");
    
            var heads = window.document.getElementsByTagName("head");
            if (heads.length) {
                heads[0].appendChild(script);
            }
        }
    }
    
}
