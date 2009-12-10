

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var CHROME_UTIL = require("chrome-util", "nr-common");
//var REPS = require("Reps", "reps");
var IFRAME_PANEL = require("IFramePanel", "xul-ui");
var APP = require("app", "nr-common").getApp();
var SANDBOX = require("sandbox").Sandbox;
var TEMPLATE_PACK = require("./TemplatePack");
var SEA = require("narwhal/tusk/sea");
var TEMPLATE_PACK_LOADER = require("loader", "template-pack");
var DEV = require("console", "dev-sidebar");
var RENDERER = require("./Renderer");


var panel,
    messageData;

exports.initialize = function(app)
{
    panel = new IFRAME_PANEL.IFramePanel().init({
        id: "VariableViewer",
        title: "Variable Viewer",
        url: APP.getPackage(module["package"]).getContentBaseUrl() + 'VariableViewerPanel.htm'
    });
    
//    REPS.getMaster("Firebug").addListener(MasterRepListener);
    panel.addListener(PanelListener);
    FIREBUG_INTERFACE.addListener('Module', ['destroyContext','showContext'], FirebugModuleListener);


    DEV.action('Dump VariableViewer HTML', function() {
        print(panel.getIFrame().contentDocument.documentElement.innerHTML);
    });

}
    
exports.shutdown = function()
{
//    REPS.getMaster("Firebug").removeListener(MasterRepListener);
    panel.removeListener(PanelListener);
    FIREBUG_INTERFACE.removeListener('Module', FirebugModuleListener);
}

exports.getMessageData = function() {
    return messageData;
}


var FirebugModuleListener = {

    destroyContext: function(context, state)
    {
        panel.hide();
    },
    
    showContext: function(browser, context)
    {
        panel.hide();
    }
}

var PanelListener = {
    
    onClosed: function()
    {
        FIREBUG_CONSOLE.clearSelection();
    }
}


exports.showFromConsoleEvent = function(event) {

    var row = FIREBUG_CONSOLE.selectRow(event.target);

    var doc = panel.getIFrame().contentDocument;
    renderRep(doc, doc.getElementById("content"), row.repObject);

    panel.show();
}



var CSSTracker = FIREBUG_CONSOLE.CSSTracker();


function renderRep(document, div, data) {
    var renderer = RENDERER.factory({
        "template": "github.com/cadorn/fireconsole/raw/master/firefox-extension-reps#VariableViewer",
        "cssTracker": CSSTracker,
        "document": document
    });
    renderer.replace(div, data);
}
