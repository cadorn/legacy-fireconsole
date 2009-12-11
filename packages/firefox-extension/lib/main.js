// ========================================================================
// FireConsole -- Firebug Extension for Comprehensive Logging
// Copyright ©2007-2009 Christoph Dorn licensed under MIT
// ========================================================================


function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var SANDBOX = require("sandbox").Sandbox;
var CHROME = require("chrome", "nr-common");
var CHROME_UTIL = require("chrome-util", "nr-common");
var APP = require("app", "nr-common").getApp();
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var VARIABLE_VIEWER = require("./VariableViewer");
var MESSAGE_BUS = require("./MessageBus");
var OBJECT_GRAPH = require("./ObjectGraph");
var SECURITY = require("./Security");
var TEMPLATE_PACK = require("./TemplatePack");
var RENDERER = require("./Renderer");
var DEV = require("console", "dev-sidebar");
var JSON = require("json");
var RENDERER = require("./Renderer");


var FORCE_REP_RELOAD = false;


exports.main = function(args) {
    
    
    // ensure firebug is available
    if(!FIREBUG_INTERFACE.isAvailable()) {
        CHROME_UTIL.openNewTab(APP.getAppPackage().getTemplateVariables()["Package.AccessibleContentBaseURL"] + "FirebugNotInstalled.htm");
        return;
    }

    DEV.action('Dump Console HTML', function() {
        var panel = FIREBUG_INTERFACE.getActiveContext().getPanel("console");
        print(panel.document.documentElement.innerHTML);
    });

    
/*    
    DEV.action('Reload Page', function() {
        FIREBUG_INTERFACE.enable();
        FIREBUG_INTERFACE.selectPanel('console');
        CHROME_UTIL.reloadPage();
    });
    DEV.action('Test Logging', function() {
        FIREBUG_INTERFACE.enable();
        FIREBUG_INTERFACE.selectPanel('console');
        FIREBUG_INTERFACE.getConsole().log('Hello World');
    });
*/

    SECURITY.initialize();



    MESSAGE_BUS.initialize({
        "ConsoleMessageListener": ConsoleMessageListener,
        "TemplatePackReceiverListener": TemplatePackReceiverListener,
        "ContentEventListener": ContentEventListener
    });
    VARIABLE_VIEWER.initialize();


    // Mark-up JS objects logged with __fc_tpl_id
    var renderer = RENDERER.factory({
        "template": "github.com/cadorn/fireconsole/raw/master/firefox-extension-reps#ConsoleMessage",
        "cssTracker": FIREBUG_CONSOLE.getCSSTracker(),
        "document": function() {
            var context = FIREBUG_INTERFACE.getActiveContext();
            if(!context) return null;
            return context.getPanel('console').document;
        },
        "eventListener": ConsoleTemplateEventListener
    });
    FIREBUG_INTERFACE.getFirebug().registerRep(renderer.getRep(true));


    // handle clean shutdown
    var onUnload  = function() {
        VARIABLE_VIEWER.shutdown();
        MESSAGE_BUS.shutdown();
        SECURITY.shutdown();
    }
    var window = CHROME.get().window;
    window.addEventListener("unload", onUnload, false);


        
    // notify NarwhalRunner that application is loaded    
    APP.started(exports);
}


var ContentEventListener = {
    onEvent: function(window, eventName, params) {
        switch(eventName) {
            case "test":
                require("./TestRunner").run(FIREBUG_CONSOLE);
                break;
            case "registerTemplatePack":
                var info = {};
                UTIL.every(params.info, function(item) {
                    info["package." + item[0]] = item[1];
                });
                info.domain = window.location.hostname;
                // Load the template pack to make it available to the renderer
                TEMPLATE_PACK.factory(info).load();
                break;
        }
    }
}

var TemplatePackReceiverListener = {
    onMessageReceived: function(context, message) {
        try {
            var data = JSON.decode(message.getData());
            if(data.action=="require") {
                var info = {};
                UTIL.every(data.info, function(item) {
                    info["package." + item[0]] = item[1];
                });
                info.domain = context.FirebugNetMonitorListener.context.window.location.hostname;
                // Load the template pack to make it available to the renderer
                TEMPLATE_PACK.factory(info).load();
            }
        } catch(e) {
            print("ERROR: "+e);
        }
    }
}


var ConsoleMessageListener = {
    
    onMessageGroupStart: function(context) {
        var renderer = RENDERER.factory({
            "template": "github.com/cadorn/fireconsole/raw/master/firefox-extension-reps#ConsoleOpenMessageGroup",
            "cssTracker": FIREBUG_CONSOLE.getCSSTracker()
        });
        FIREBUG_CONSOLE.logRep(renderer.getRep(), {
            "url": context.FirebugNetMonitorListener.file.href
        }, context.FirebugNetMonitorListener.context);
    },
    
    onMessageGroupEnd: function(context) {
        var renderer = RENDERER.factory({
            "template": "github.com/cadorn/fireconsole/raw/master/firefox-extension-reps#ConsoleCloseGroup",
            "cssTracker": FIREBUG_CONSOLE.getCSSTracker()
        });
        FIREBUG_CONSOLE.logRep(renderer.getRep(), null, context.FirebugNetMonitorListener.context);
    },

    onMessageReceived: function(context, message) {

        try {
            
            var data = {
                "meta": JSON.decode(message.getMeta() || "{}"),
                "og": OBJECT_GRAPH.generateFromMessage(message)
            }
    
            var renderer = RENDERER.factory({
                "template": "github.com/cadorn/fireconsole/raw/master/firefox-extension-reps#ConsoleMessage",
                "meta": data.meta,
                "cssTracker": FIREBUG_CONSOLE.getCSSTracker(),
                "eventListener": ConsoleTemplateEventListener
            });
    
            FIREBUG_CONSOLE.logRep(renderer.getRep(), data, context.FirebugNetMonitorListener.context);
            
        } catch(e) {
            
            FIREBUG_CONSOLE.error("[FireConsole] Error while logging template", e);
            
            // TODO: Listen for template pack installs and re-log messages once pack is installed
        }
    }
}

var ConsoleTemplateEventListener =  {
    onEvent: function(name, args) {
        if(name=="click") {
            VARIABLE_VIEWER.showFromConsoleRow(args[1]);           
        }
    }
}
