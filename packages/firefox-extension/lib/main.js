
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var SANDBOX = require("sandbox").Sandbox;
var CHROME = require("chrome", "nr-common");
var CHROME_UTIL = require("chrome-util", "nr-common");
var APP = require("app", "nr-common").getApp();
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");
var REPS = require("Reps", "reps");
var VARIABLE_VIEWER = require("./VariableViewer");
var MESSAGE_BUS = require("./MessageBus");
var OBJECT_GRAPH = require("./ObjectGraph");
var SECURITY = require("./Security");
var TEMPLATE_PACK = require("./TemplatePack");
var DEV = require("console", "dev-sidebar");


var FORCE_REP_RELOAD = false;


exports.main = function(args) {
    
    
    // ensure firebug is available
    if(!FIREBUG_INTERFACE.isAvailable()) {
        CHROME_UTIL.openNewTab(APP.getAppPackage().getTemplateVariables()["Package.AccessibleContentBaseURL"] + "FirebugNotInstalled.htm");
        return;
    }
    
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

    FIREBUG_CONSOLE.registerCss(REPS.getMaster("Firebug").getCss());


    MESSAGE_BUS.initialize({
        "ConsoleMessageListener": ConsoleMessageListener
    });
    VARIABLE_VIEWER.initialize();


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



var ConsoleMessageListener = {
    
    lastStartTime: null,
    
    onMessageReceived: function(message, context) {
        try {

            var srequire = require;
            if(FORCE_REP_RELOAD && this.lastStartTime!==context.FirebugNetMonitorListener.file.startTime) {    
            
                // clear the console first
                context.FirebugNetMonitorListener.context.getPanel("console").clear();
                
                // TODO: Log message that we are in debug mode and templates are getting reloaded

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
                    return sandbox(id, null, pkg, module["package"]);
                }
            }
        
            var REPS = srequire("Reps", "reps");
    
            if(FORCE_REP_RELOAD && this.lastContext!==context) {
                REPS.getMaster("Firebug").addListener(VARIABLE_VIEWER.MasterRepListener);
                FIREBUG_CONSOLE.registerCss(REPS.getMaster("Firebug").getCss());
            }

            this.lastStartTime = context.FirebugNetMonitorListener.file.startTime;


//FIREBUG_CONSOLE.log(message);

            var og = OBJECT_GRAPH.generateFromMessage(message);

//FIREBUG_CONSOLE.log(og);

/*
            var meta = message.getMeta();
            var data = JSON.decode(message.getData());
            
            var rep = null;
            if(meta && meta["fc.tpl.id"]) {
                rep = REPS.factory(meta["fc.tpl.id"], "Firebug");
            } else {
                rep = REPS.factory("", "Firebug");
            }
*/

            rep = REPS.factory("", "Firebug");


//print(og.getOrigin().type);
        
//FIREBUG_CONSOLE.log(og.getOrigin());
        
            FIREBUG_CONSOLE.logRep(rep, og, context.FirebugNetMonitorListener.context);
    
        } catch(e) {
            print(e, 'ERROR');
        }
    }
}

