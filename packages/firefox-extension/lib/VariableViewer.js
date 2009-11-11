

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var REPS = require("Reps", "reps");
var IFRAME_PANEL = require("IFramePanel", "xul-ui");
var APP = require("app", "nr-common").getApp();
var SANDBOX = require("sandbox").Sandbox;

var panel,
    messageData;

var FORCE_REP_RELOAD = true;

exports.initialize = function(app)
{
    panel = new IFRAME_PANEL.IFramePanel().init({
        id: "VariableViewer",
        title: "Variable Viewer",
//        url: "http://localhost:11009/"
        url: APP.getPackage(module["package"]).getContentBaseUrl() + 'VariableViewer.htm'
    });
    
    REPS.getMaster("Firebug").addListener(MasterRepListener);
    panel.addListener(PanelListener);
    FIREBUG_INTERFACE.addListener('Module', ['destroyContext','showContext'], FirebugModuleListener);
}
    
exports.shutdown = function()
{
    REPS.getMaster("Firebug").removeListener(MasterRepListener);
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

var MasterRepListener = exports.MasterRepListener = {

    onClick: function(event, object)
    {
        var row = FIREBUG_CONSOLE.selectRow(event.target);
        if(FORCE_REP_RELOAD) {
            panel.reload(function() {
                var doc = panel.getIFrame().contentDocument;
                renderRep(doc, doc.getElementById("content"), row.repObject);
            });
        } else {
            var doc = panel.getIFrame().contentDocument;
            renderRep(doc, doc.getElementById("content"), row.repObject);
        }
        panel.show();
    }
}




function renderRep(document, div, data) {
    
    var srequire = require;    
    if(FORCE_REP_RELOAD) {    
        var modules = {}
        modules[FIREBUG_INTERFACE.getModuleId()] = FIREBUG_INTERFACE;
        modules["packages"] = require("packages");
    
        var sandbox = SANDBOX({
            "system": system,
            "loader": require.loader,
            "debug": require.loader.debug,
            "modules": modules
        });
        srequire = function(id, pkg) {
            return sandbox(id, null, false, false, pkg, module["package"]);
        }
    }

    var REPS = srequire("Reps", "reps");
    var PACKAGE = srequire("package", "nr-common");
    
    REPS.getMaster("VariableViewer").injectCss(document, function(css) {
        var code = css.getCode();
        var pkgId = css.getPackageId();
        if(pkgId) {
            var pkg = PACKAGE.Package(pkgId).setAppInfo(APP.getInfo());
            code = pkg.replaceTemplateVariables(code);
        }
        return code;        
    });

    var rep = REPS.factory(data[0].Type, "VariableViewer");

    rep.tag.replace({
        "object": data
    }, div);

}