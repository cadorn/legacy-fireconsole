

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var APP = require("app", "nr-common").getApp();
var IFRAME_PANEL = require("IFramePanel", "xul-ui");
var CHROME_UTIL = require("chrome-util", "nr-common");
var DEV = require("console", "dev-sidebar");


var templatePackAuthorizationPanel;

exports.initialize = function()
{
    templatePackAuthorizationPanel = new IFRAME_PANEL.IFramePanel().init({
        "id": "TemplatePackAuthorizationPanel",
        "title": "Install Template Pack",
        "url": APP.getPackage(module["package"]).getContentBaseUrl() + 'TemplatePackAuthorizationPanel.htm',
        "close.button.label": "Dismiss"
    });
    
    DEV.action('Reload TemplatePackAuthPanel', function() {
        templatePackAuthorizationPanel.reload();
    });
}

exports.shutdown = function()
{
}

exports.installTemplatePack = function(info, installCallback) {
    templatePackAuthorizationPanel.show();
    var iframe = templatePackAuthorizationPanel.getIFrame();
    var data = UTIL.copy(info);
    UTIL.update(data, {
        "launchURLCallback": function(url) {
            CHROME_UTIL.openNewTab(url);
        },
        "confirmInstallCallback": function() {
            installCallback(iframe.contentWindow, function () {
                templatePackAuthorizationPanel.hide();
            });
        },
        "dismissInstallCallback": function() {
            templatePackAuthorizationPanel.hide();
        }
    });
    iframe.contentWindow.setData(data);        
}
