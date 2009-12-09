
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
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
var JSON = require("json");


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
    FIREBUG_INTERFACE.getFirebug().registerRep(REPS.getMaster("Firebug").rep);


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
    
    masterRep: null,
    installingTemplatePack: false,
    
    onMessageGroupStart: function(context) {
        if(!this.masterRep) {
            this.masterRep = REPS.getMaster("Firebug");
        }
        this.masterRep.openMessageGroup(context);
        this.installingTemplatePack = false;
    },
    
    onMessageGroupEnd: function(context) {
        this.masterRep.closeMessageGroup(context);
    },
    
    onMessageReceived: function(context, message) {
        try {
            
            if(this.installingTemplatePack) {
                return;
            }

            var og = OBJECT_GRAPH.generateFromMessage(message);
            var meta = JSON.decode(message.getMeta() || "{}");

            var template = TEMPLATE_PACK.getTemplate(meta);
            if(template===null) {
                // TODO: We should get a promise here that triggers when the template pack is installed
                // TODO: Queue messages until pack is loaded to avoid need for refresh
                FIREBUG_CONSOLE.info("Installing template pack ... (refresh request once pack is loaded)");
                this.installingTemplatePack = true;
                return;
            } else
            if(!template) {
                template = TEMPLATE_PACK.seekTemplate(og.getOrigin());
            }
            
            // TODO: Should be using a new instance of the master rep

            this.masterRep.setTemplate(template);

            FIREBUG_CONSOLE.logRep(this.masterRep.getRep(meta), {"meta": meta, "og": og}, context.FirebugNetMonitorListener.context);

        } catch(e) {
            print(e, 'ERROR');
        }
    }
}

