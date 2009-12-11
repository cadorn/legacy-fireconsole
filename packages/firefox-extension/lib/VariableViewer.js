
var UTIL = require("util");
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var IFRAME_PANEL = require("IFramePanel", "xul-ui");
var APP = require("app", "nr-common").getApp();
var DEV = require("console", "dev-sidebar");
var RENDERER = require("./Renderer");

var panel,
    cssTracker = FIREBUG_CONSOLE.CSSTracker();

exports.initialize = function(app)
{
    panel = new IFRAME_PANEL.IFramePanel().init({
        id: "VariableViewer",
        title: "Variable Viewer",
        url: APP.getPackage(module["package"]).getContentBaseUrl() + 'VariableViewerPanel.htm'
    });
    
    panel.addListener(PanelListener);
    FIREBUG_INTERFACE.addListener('Module', ['destroyContext','showContext'], FirebugModuleListener);

    DEV.action('Dump VariableViewer HTML', function() {
        print(panel.getIFrame().contentDocument.documentElement.innerHTML);
    });
}

exports.shutdown = function()
{
    panel.removeListener(PanelListener);
    FIREBUG_INTERFACE.removeListener('Module', FirebugModuleListener);
}

var FirebugModuleListener = {
    destroyContext: function(context, state) {
        panel.hide();
    },
    showContext: function(browser, context) {
        panel.hide();
    }
}

var PanelListener = {
    onClosed: function() {
        FIREBUG_CONSOLE.clearSelection();
    }
}

exports.showFromConsoleRow = function(row) {

    FIREBUG_CONSOLE.selectRow(row);

    var doc = panel.getIFrame().contentDocument;
    var renderer = RENDERER.factory({
        "template": "github.com/cadorn/fireconsole/raw/master/firefox-extension-reps#VariableViewer",
        "cssTracker": cssTracker,
        "document": doc
    });
    renderer.replace(doc.getElementById("content"), row.repObject);

    panel.show();
}
