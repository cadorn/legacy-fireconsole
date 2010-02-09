

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var APP = require("app", "nr-common").getApp();
var IFRAME_PANEL = require("IFramePanel", "xul-ui");
var DEV = require("console", "dev-sidebar");
var JSON_STORE = require("json-store", "util");


var domainPolicyFile = APP.getChrome().getProfilePath().join("FireConsole", "Config", "DomainPolicies.json"),
    domainPolicyStore = JSON_STORE.JsonStore(domainPolicyFile),
    domainPolicies;

if(!domainPolicyStore.exists()) {
    domainPolicyStore.init();
    domainPolicyStore.set({
        "schema": "0.1"
    });
}

var templatePackAuthorizationPanel,
    templatePackAuthorizationListener;

exports.initialize = function(options)
{
    templatePackAuthorizationListener = options["TemplatePackAuthorizationListener"];
    
    templatePackAuthorizationPanel = new IFRAME_PANEL.IFramePanel().init({
        "id": "TemplatePackAuthorizationPanel",
        "title": "Install Template Pack",
        "url": APP.getPackage(module["package"]).getContentBaseUrl() + 'TemplatePackAuthorizationPanel.htm',
        "close.button.label": "Dismiss"
    });
/*    
    DEV.action('Reload TemplatePackAuthPanel', function() {
        templatePackAuthorizationPanel.reload();
    });
*/
}

exports.authorizeTemplatePack = function(domain, descriptor) {
    
    var id = descriptor.getId();

    if(!domainPolicies) {
        domainPolicies = domainPolicyStore.get();
    }
    
    if(domainPolicies[domain] && domainPolicies[domain].templatePacks[id]) {
        return true;
    }

    exports.installTemplatePack(domain, descriptor, function(feedback, hide) {
        hide();        
        return true;
    });
    
    return false;
}

exports.addDomainForTemplatePack = function(domain, descriptor) {
    var packId = descriptor.getId();
    if(!domainPolicies) {
        domainPolicies = domainPolicyStore.get();
    }
    if(!domainPolicies[domain]) {
        domainPolicies[domain] = {"templatePacks": {}};
    }
    if(domainPolicies[domain].templatePacks[packId]) {
        return;
    }
    domainPolicies[domain].templatePacks[packId] = true;
    domainPolicyStore.set(domainPolicies);
}

exports.installTemplatePack = function(domain, descriptor, installCallback) {

    templatePackAuthorizationListener.onAuthorize(domain, descriptor);

    templatePackAuthorizationPanel.show();
    var iframe = templatePackAuthorizationPanel.getIFrame();

    var data = {
        "package": descriptor.getInfo(),
        "domain": domain,
        "installPath": APP.getChrome().getProfilePath().join("FireConsole", "TemplatePacks")
    };
    UTIL.update(data, {
        "launchURLCallback": function(url) {
            APP.getChrome().openNewTab(url);
        },
        "confirmInstallCallback": function() {
            installCallback(iframe.contentWindow, function () {
                exports.addDomainForTemplatePack(domain, descriptor);
                templatePackAuthorizationPanel.hide();
                templatePackAuthorizationListener.onAccept(domain, descriptor);
            });
        },
        "dismissInstallCallback": function() {
            templatePackAuthorizationPanel.hide();
            templatePackAuthorizationListener.onDismiss(domain, descriptor);
        }
    });
    iframe.contentWindow.setData(data);        
}
