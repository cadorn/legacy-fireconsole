
exports.getModuleId = function() {
    return module.id;
}

var UTIL = require("util", "nr-common");
var CHROME = require("chrome", "nr-common");

var Firebug,
    FBL,
    FirebugModule,
    FirebugInterface,
    Listener,
    ModuleListener,
    NetMonitorListener;

FirebugInterface = {
    
    listeners: [],

    addListener: function(type, events, listener)
    {
        switch (type) {
            case 'NetMonitor':
                NetMonitorListener._addListener(events, listener);
                break;
            case 'Module':
                ModuleListener._addListener(events, listener);
                break;
        }
    },

    removeListener: function(type, listener)
    {
        switch (type) {
            case 'NetMonitor':
                NetMonitorListener._removeListener(listener);
                break;
            case 'Module':
                ModuleListener._removeListener(listener);
                break;
        }
    }
}


Listener = {
  
    _target: null,
    listeners: [],
  
    _addListener: function(events, listener)
    {
        this.listeners.push([events, listener]);
        this._attach();
    },
    
    _removeListener: function(listener)
    {
        for( var i in this.listeners ) {
            if(this.listeners[i][1]===listener) {
                this.listeners.splice(i,1);
            }
        }
        if(this.listeners.length==0) {
            this._unattach();
        }
    },
    
    _attach: function()
    {
        for( var i in FirebugInterface.listeners ) {
            if(FirebugInterface.listeners[i]===this) {
                // Already registered
                return;
            }
        }
        FirebugInterface.listeners.push(this);
        
        if (this._target) {
            this._target.addListener(this);
        }
    },
    
    _unattach: function()
    {
        if (this._target) {
            this._target.removeListener(this);
        }
        UTIL.array.removeItem(FirebugInterface.listeners, this);
    },
    
    _dispatch: function(event, arguments)
    {
        for( var i=0 ; i<this.listeners.length ; i++ ) {
            if(UTIL.array.hasItem(this.listeners[i][0],event)) {
                this.listeners[i][1][event].apply(this.listeners[i][1], arguments);
            }
        }
    },
}

    


exports.init = function(chrome)
{
    // only FBL is available at this time - firebug is still starting up
    FBL = chrome.FBL;
    
    FBL.ns(function() { with (FBL) {

        // firebug is now initialized
        Firebug = chrome.Firebug;

        // create a module to interact with firebug
        FirebugModule = Firebug.__PP__Module = extend(Firebug.Module,
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
                for( var i = FirebugInterface.listeners.length-1 ; i>= 0 ; i-- ) {
                    FirebugInterface.listeners[i]._unattach();
                }
            }
        });
                

        /**********************************************************************
         * Firebug.Module
         **********************************************************************/
        ModuleListener = UTIL.object.extend(Listener, {});

        (function() {
        
            /**********************************************************************
             * Context Management
             **********************************************************************/
        
            /**
             * A page associated with the context has been closed.
             */
            this.destroyContext = function(context, state)
            {
                ModuleListener._dispatch('destroyContext', [context, state]);
            }
        
            /**
             * Firebug is opened for a page that is associated with the context (can precede loadContext).
             */
            this.showContext = function(browser, context)
            {
                ModuleListener._dispatch('showContext', [browser, context]);
            }
            
        }).apply(FirebugModule);

        
        
        /**********************************************************************
         * Firebug.NetMonitor
         **********************************************************************/
        NetMonitorListener = UTIL.object.extend(Listener, {
            
            _target: Firebug.NetMonitor,
            
            /**********************************************************************
             * Network Activity
             **********************************************************************/
            
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
            },
            
            /**********************************************************************
             * Request Info
             **********************************************************************/
            
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


        // register the module with firebug
        Firebug.registerModule(Firebug.__PP__Module);
    }});
}

exports.isAvailable = function() {
    return !(!Firebug);
}

exports.getFirebug = function()
{
    if(!Firebug) {
        throw "Firebug not initialized";
    }
    return Firebug;
}

exports.getReps = function() {
    var chrome = CHROME.get();
    if(!UTIL.has(chrome, "FirebugReps")) {
        throw "FirebugReps not available usually because firebug is not initialized";
    }
    return chrome.FirebugReps;
}

exports.getVersion = function()
{
    return exports.getFirebug().version;
}

exports.getConsole = function()
{
    return exports.getFirebug().Console;
}

exports.addListener = function(type, events, listener)
{
    exports.getFirebug();   // ensure firebug is initialized
    FirebugInterface.addListener(type, events, listener);
}

exports.removeListener = function(type, listener)
{
    exports.getFirebug();   // ensure firebug is initialized.
    FirebugInterface.removeListener(type, listener);
}

exports.enable = function()
{
    exports.getFirebug().toggleBar(true);
}

exports.selectPanel = function(name)
{
    exports.getFirebug().chrome.selectPanel(name);
}

