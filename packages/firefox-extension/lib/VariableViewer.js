
var UTIL = require("util");
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var IFRAME_PANEL = require("IFramePanel", "xul-ui");
var APP = require("app", "nr-common").getApp();
var DEV = require("console", "dev-sidebar");
var RENDERER = require("./Renderer");


var VariableViewer = exports.VariableViewer = function() {
    var self = this;
    
    self.cssTracker = FIREBUG_CONSOLE.CSSTracker();
    
    self.panel = new IFRAME_PANEL.IFramePanel().init({
        id: "VariableViewer",
        title: "Variable Viewer",
        url: APP.getPackage(module["package"]).getContentBaseUrl() + 'VariableViewerPanel.htm'
    });
    
    self.panel.addListener({
        onClosed: function() {
            FIREBUG_CONSOLE.clearSelection();
        }
    });
    FIREBUG_INTERFACE.addListener('Module', ['destroyContext','showContext'], {
        destroyContext: function(context, state) {
            self.panel.hide();
        },
        showContext: function(browser, context) {
            self.panel.hide();
        }
    });
/*
    DEV.action('Dump VariableViewer HTML', function() {
        print(self.panel.getIFrame().contentDocument.documentElement.innerHTML);
    });
    DEV.action('Reload VariableViewer', function() {
        self.panel.reload();
    });
*/
}

VariableViewer.prototype.showFromConsoleRow = function(row) {
    FIREBUG_CONSOLE.selectRow(row);
    this.showForNode(row.repObject);
}

VariableViewer.prototype.showFromConsoleNode = function(node) {
    this.showForNode(node);
}

VariableViewer.prototype.showForNode = function(node) {
    var self = this;

    var doc = self.panel.getIFrame().contentDocument,
        win = self.panel.getIFrame().contentWindow;

    win.showLoadingIndicator();

    var renderer = RENDERER.factory({
        "template": "registry.pinf.org/cadorn.org/github/fireconsole/packages/firefox-extension/packages/reps/master#VariableViewer",
        "cssTracker": self.cssTracker,
        "document": doc
    });
    renderer.replace(doc.getElementById("content"), node);

    self.panel.show();

    win.hideLoadingIndicator();
}
