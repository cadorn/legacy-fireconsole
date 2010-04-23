
/*
 * Wrap firebug in multiple windows using one listener interface.
 * 
 * @see http://groups.google.com/group/firebug-working-group/web/firebug-events-listeners
 */

exports.getModuleId = function() {
    return module.id;
}

var UTIL = require("util", "nr-common");
var APP = require("app", "nr-common").getApp();


var Listener = {
  
    listeners: [],
  
    _addListener: function(events, listener)
    {
        this.listeners.push([events, listener]);
    },
    
    _removeListener: function(listener)
    {
        for( var i in this.listeners ) {
            if(this.listeners[i][1]===listener) {
                this.listeners.splice(i,1);
            }
        }
    },
    
    _attach: function(target)
    {
        target.addListener(this);
    },
    
    _dispatch: function(event, arguments)
    {
        for( var i=0 ; i<this.listeners.length ; i++ ) {
            if(UTIL.array.hasItem(this.listeners[i][0],event)) {
                try {
                    this.listeners[i][1][event].apply(this.listeners[i][1], arguments);
                } catch(e) {
                    system.log.error(e);
                }
            }
        }
    },
}


/**********************************************************************
 * Firebug.Module
 **********************************************************************/
var ModuleListener = UTIL.object.extend(Listener, {});
// see Interface for implementation


/**********************************************************************
 * Firebug.NetMonitor
 **********************************************************************/
var NetMonitorListener = UTIL.object.extend(Listener, {
    
    /**
     * A network request has been sent.
     */
    onRequest: function(context, file)
    {
        this._dispatch('onRequest', [context, file]);
    },
    
    /**
     * A network response has been receivied, but not yet processed by Firebug.
     */
    onExamineResponse: function(context, request)
    {
        this._dispatch('onExamineResponse', [context, request]);
    },
    
    /**
     * A network response has been received.
     */
    onResponse: function(context, file)
    {
        this._dispatch('onResponse', [context, file]);
    },
    
    /**
     * Entire response body has been downloaded.
     */
    onResponseBody: function(context, file)
    {
        this._dispatch('onResponseBody', [context, file]);
    }
});

/**********************************************************************
 * Firebug.NetInfoBody
 **********************************************************************/

var NetInfoBodyListener = UTIL.object.extend(Listener, {

    /**
     * A network reqeust has been expanded and all info-tabs should be created now.
     */
    initTabBody: function(infoBox, file)
    {
        this._dispatch('initTabBody', [infoBox, file]);
    },
    
    /**
     * A network request has been collapsed.
     */
    destroyTabBody: function(infoBox, file)
    {
        this._dispatch('destroyTabBody', [infoBox, file]);
    },
    
    /**
     * A tab has been selected and it's body should be updated now.
     */
    updateTabBody: function(infoBox, file, context)
    {
        this._dispatch('updateTabBody', [infoBox, file, context]);
    }
});

/**********************************************************************
 * Firebug.Console
 **********************************************************************/

var ConsoleListener = UTIL.object.extend(Listener, {
        
    log: function(context, object, className, sourceLink)
    {
        this._dispatch('log', [context, object, className, sourceLink]);
    },

    logFormatted: function(context, objects, className, sourceLink)
    {
        this._dispatch('logFormatted', [context, objects, className, sourceLink]);
    },
    
    /**
     * Firebug's console object has been inserted into a page.
     */
    onConsoleInjected: function(context, win)
    {
        this._dispatch('onConsoleInjected', [context, win]);
    }
});


var interfaces = {
    "list": [],
    "map": {}
};

var onReadyCallbacks = [];


var Interface = exports.Interface = function(global) {
    var self = this;
    
    self.global = global;

    // only FBL is available at this time - firebug is still starting up
    self.FBL = global.FBL;
    
    self.FBL.ns(function() { with (self.FBL) {

        self.Domplate = global.domplate;

        // firebug is now initialized
        var Firebug = self.Firebug = global.Firebug;

        // create a module to interact with firebug
        self.FirebugModule = Firebug.__PP__Module = extend(Firebug.Module,
        {
            initialize: function(owner)
            {
                Firebug.Module.initialize.apply(this, arguments);
            },
        
            shutdown: function()
            {
                Firebug.Module.shutdown.apply(this, arguments);
                
                // Remove listeners from firebug in reverse order.
                // This is done in case users of this module did not remove their listeners.
                for( var i = listeners.length-1 ; i>= 0 ; i-- ) {
                    listeners[i]._unattach();
                }
            }
        });

        
        /**********************************************************************
         * Firebug.Module
         **********************************************************************/
        (function() {
        
            /**********************************************************************
             * Context Management
             **********************************************************************/
        
            /**
             * A context object has been created for a page.
             */
            this.initContext = function(context, state)
            {
                ModuleListener._dispatch('initContext', [context, state]);
            }
        
            /**
             * A page associated with the context has been closed.
             */
            this.destroyContext = function(context, state)
            {
                ModuleListener._dispatch('destroyContext', [context, state]);
                self.activeContext = null;
            }
        
            /**
             * Firebug is opened for a page that is associated with the context (can precede loadContext).
             */
            this.showContext = function(browser, context)
            {
                self.activeContext = context;
                ModuleListener._dispatch('showContext', [browser, context]);
            }
            
            /**
             * Firebug has been detached/attached from/to the original Firefox window.
             */
            this.reattachContext = function(browser, context)
            {
                ModuleListener._dispatch('reattachContext', [browser, context]);
            }
            
        }).apply(self.FirebugModule);


        // register the module with firebug
        Firebug.registerModule(Firebug.__PP__Module);
    }});
}

Interface.prototype.attachListeners = function() {
    NetMonitorListener._attach(this.Firebug.NetMonitor);
    NetInfoBodyListener._attach(this.Firebug.NetMonitor.NetInfoBody);
    ConsoleListener._attach(this.Firebug.Console);
}

exports.init = function(global)
{
    // create a new interface instance for every new browser window
    interfaces.list.push(new Interface(global));
}
APP.subscribeTo("newChrome", function(chrome) {
    // Now that we have a narwhalrunner chrome object we attach it to the interface
    // already created above. This second step is required as firebug modules must be initialized
    // while firebug starts up.
    var global = chrome.getGlobal();
    for( var i=0 ; i<interfaces.list.length ; i++ ) {
        if(interfaces.list[i].global===global) {
            interfaces.list[i].chrome = chrome;
            interfaces.map[chrome.chromeIndex] = interfaces.list[i];
            interfaces.list[i].attachListeners();
            break;
        }
    }
    // fire all callbacks waiting for the interface to be ready
    var obj = exports.getInterface(true);
    if(obj) {
        onReadyCallbacks.forEach(function(callback) {
            callback(obj);
        });
        onReadyCallbacks = [];
    }
});

exports.getInterface = function(silent) {
    if(!interfaces.map[APP.getChrome().chromeIndex]) {
        if(!silent) {
            throw new Error("Firebug interface not available yet!");
        } else {
            return null;
        }
    }
    return interfaces.map[APP.getChrome().chromeIndex];
};

exports.addListener = function(type, events, listener)
{
    switch (type) {
        case 'NetMonitor':
            NetMonitorListener._addListener(events, listener);
            break;
        case 'NetInfoBody':
            NetInfoBodyListener._addListener(events, listener);
            break;
        case 'Module':
            ModuleListener._addListener(events, listener);
            break;
        case 'Console':
            ConsoleListener._addListener(events, listener);
            break;
    }
}

exports.removeListener = function(type, listener)
{
    switch (type) {
        case 'NetMonitor':
            NetMonitorListener._removeListener(listener);
            break;
        case 'NetInfoBody':
            NetInfoBodyListener._removeListener(listener);
            break;
        case 'Module':
            ModuleListener._removeListener(listener);
            break;
        case 'Console':
            ConsoleListener._removeListener(listener);
            break;
    }
}

exports.onReady = function(callback) {
    var obj = exports.getInterface(true);
    if(obj) {
        callback(obj);
    } else {
        onReadyCallbacks.push(callback);
    }
};

exports.isAvailable = function() {
    var obj = exports.getInterface(true);
    if(!obj) return false;
    if(!obj.Firebug) return false;
    return true;
}

exports.getDomplate = function()
{
    if(!exports.getInterface().Domplate) {
        throw "Domplate not initialized";
    }
    return exports.getInterface().Domplate;
}

exports.getFirebug = function()
{
    if(!exports.getInterface().Firebug) {
        throw "Firebug not initialized";
    }
    return exports.getInterface().Firebug;
}

exports.getFBL = function()
{
    if(!exports.getInterface().FBL) {
        throw "Firebug FBL not initialized";
    }
    return exports.getInterface().FBL;
}

exports.getActiveContext = function()
{
    return exports.getInterface().activeContext;
}

exports.getReps = function() {
    var global = exports.getInterface().chrome.getGlobal();
    if(!UTIL.has(global, "FirebugReps")) {
        throw "FirebugReps not available usually because firebug is not initialized";
    }
    return global.FirebugReps;
}

exports.getVersion = function()
{
    return exports.getFirebug().version;
}

exports.getConsole = function()
{
    return exports.getFirebug().Console;
}

exports.enable = function()
{
    exports.getFirebug().toggleBar(true);
}

exports.selectPanel = function(name)
{
    exports.getFirebug().chrome.selectPanel(name);
}

