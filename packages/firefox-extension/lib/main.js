
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var CHROME = require("chrome", "nr-common");
var CHROME_UTIL = require("chrome-util", "nr-common");
var APP = require("app", "nr-common").getApp();
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");

var HEADER_PARSER = require("HeaderParser", "wildfire");

var REPS = require("Reps", "reps");

var VARIABLE_VIEWER = require("./VariableViewer");
var PAGE_INJECTOR = require("./PageInjector");
var SANDBOX = require("sandbox").Sandbox;


const observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

var FORCE_REP_RELOAD = true;

var DEV = require("console", "dev-sidebar");

exports.main = function(args) {
    
    
    // ensure firebug is available
    if(!FIREBUG_INTERFACE.isAvailable()) {
        CHROME_UTIL.openNewTab(APP.getAppPackage().getTemplateVariables()["Package.AccessibleContentBaseURL"] + "FirebugNotInstalled.htm");
        return;
    }
    
    
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



    observerService.addObserver(OnModifyRequestObserver, "http-on-modify-request", false);

    // hook into firebug

    FIREBUG_INTERFACE.addListener('NetMonitor', ['onResponseBody'], NetMonitorListener);
    FIREBUG_CONSOLE.registerCss(REPS.getMaster("Firebug").getCss());

    // initialize UI

    VARIABLE_VIEWER.initialize();

    // handle clean shutdown
    var onUnload  = function() {
        VARIABLE_VIEWER.shutdown();
        FIREBUG_INTERFACE.removeListener('NetMonitor', NetMonitorListener);
        observerService.removeObserver(OnModifyRequestObserver, "http-on-modify-request");
    }
    var window = CHROME.get().window;
    window.addEventListener("unload", onUnload, false);

        
    // notify NarwhalRunner that application is loaded    
    APP.started(exports);
}





var OnModifyRequestObserver = {

    observe: function(subject, topic, data)
    {
        if (topic == "http-on-modify-request") {
            var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
            
            /* Add FirePHP/X.X.X to User-Agent header if not already there and firephp is enabled.
             * If firephp is not enabled remove header from request if it exists.
             */
            
            if (httpChannel.getRequestHeader("User-Agent").match(/\sFirePHP\/([\.|\d]*)\s?/) == null) {
//            if (this.isEnabled()) {
                httpChannel.setRequestHeader("User-Agent", httpChannel.getRequestHeader("User-Agent") + ' ' +
                "FirePHP/1.0", false);
//            }
            }
        }
    } 
}





var NetMonitorListener = {

    onResponseBody: function(context, file)
    {
        try {
            
            PAGE_INJECTOR.injectAPI(context.window);
            
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

            if(FORCE_REP_RELOAD) {
                REPS.getMaster("Firebug").addListener(VARIABLE_VIEWER.MasterRepListener);
                FIREBUG_CONSOLE.registerCss(REPS.getMaster("Firebug").getCss());
            }

            var envelopes = HEADER_PARSER.parse(file.responseHeaders);
            
            for( var i=0 ; i<envelopes.length ; i++ ) {
                
                var messages = envelopes[i].getMessagesFor('http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.3',
                                                           'http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1');
                
                for (var j = 0; j < messages.length; j++) {
                
                    var rep = REPS.factory(messages[j][0].Type, "Firebug");

                    FIREBUG_CONSOLE.logRep(rep, messages[j], context);
                }        
            }
        } catch(e) {
            print(e, 'ERROR');
        }
    }
}
