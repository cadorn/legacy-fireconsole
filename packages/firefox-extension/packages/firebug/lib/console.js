
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var FILE = require("file");
var MD5 = require("md5");
var STRUCT = require("struct");
var UTIL = require("util", "nr-common");
var INTERFACE = require("./interface");
var APP = require("app", "nr-common").getApp();


var selectedRow = null;


var CSSTracker;

function logFormatted(args, className, linkToSource, noThrottle)
{
    var context = INTERFACE.getActiveContext();
    if(!context) return;
    var sourceLink = null;//linkToSource ? getStackLink() : null;
    return INTERFACE.getConsole().logFormatted(args, context, className, noThrottle, sourceLink);
}

// concole.* API (same as in browser)
// @see http://code.google.com/p/fbug/source/browse/branches/firebug1.5/content/firebug/consoleInjector.js

exports.log = function() {
    logFormatted(arguments, "log");
}

exports.info = function() {
    logFormatted(arguments, "info");
}

exports.warn = function() {
    logFormatted(arguments, "warn");
}

exports.error = function() {
    logFormatted(arguments, "error");
}

exports.group = function() {
    var context = INTERFACE.getActiveContext();
    if(!context) return;
    var sourceLink = null;//getStackLink();
    INTERFACE.getConsole().openGroup(arguments, context, "group", null, false, sourceLink);
}

exports.groupEnd = function() {
    var context = INTERFACE.getActiveContext();
    if(!context) return;
    INTERFACE.getConsole().closeGroup(context);
}

exports.getCSSTracker = function() {
    if(!CSSTracker) {
        CSSTracker = exports.CSSTracker();
        // check CSS when firebug opens in it's own window
        var FirebugModuleListener = {
            reattachContext: function(browser, context) {
                CSSTracker.checkCSS(context.getPanel('console').document, true);
            }        
        }
        INTERFACE.addListener('Module', ['reattachContext'], FirebugModuleListener);
    }
    return CSSTracker;
}

exports.registerCss = function(css, preProcessCallback, forceReload)
{
    for (var i = 0; i < css.length; i++) {
        exports.getCSSTracker().registerCSS(css[i], preProcessCallback, forceReload);
    }
}

exports.logRep = function(rep, data, context)
{
    exports.getCSSTracker().checkCSS(context.getPanel('console').document);

    INTERFACE.getConsole().logRow(
        rep._appender,             // appender
        rep._normalizeData(data),  // objects
        context,                   // context
        rep.className,             // className
        (rep.tag)?rep:null,        // rep
        null,                      // sourceLink
        true,                      // noThrottle
        (rep.tag)?false:true       // noRow
    );
}

exports.selectRow = function(row)
{
    // Seek our MasterRep node
    // TODO: This should be refactored to not rely on the "MasterRep" class as it is FireConsole specific.
    //       The whole selection logic should probably be moved out of here.
    while(true) {
        if(!row.parentNode) {
            return false;
        }
        if(UTIL.dom.hasClass(row, "MasterRep")) {
            break;
        }
        row = row.parentNode;
    }
    
    this.clearSelection();

    UTIL.dom.setClass(row, "selected");
    
    selectedRow = row;

    return row;
}

exports.clearSelection = function()
{
    if(!selectedRow) {
        return;
    }
    UTIL.dom.removeClass(selectedRow, "selected");
    selectedRow = null;
}


exports.CSSTracker = function() {
    var CSSTracker = function() {};
    var self = new CSSTracker();
    
    self.url = null;
    self.css = [];
    self.fileMTimes = {};
    
    self.registerCSS = function(css, preProcessCallback, forceReload)
    {
        if(!UTIL.isArrayLike(css)) {
            css = [css];
        }
        css.forEach(function(entry) {
            if(!UTIL.has(entry, "path")) {
                throw "css.path not set!";
            }
            // only add if CSS with same path does not already exist
            for( var i=0 ; i<self.css.length ; i++ ) {
                if(self.css[i][0].path==entry.path) {
                    self.css[i] = [entry, preProcessCallback, forceReload];
                    entry = null;
                    break;
                }
            }
            if(entry!==null) {
                self.css.push([entry, preProcessCallback, forceReload]);
            }
        });
    };

    self.checkCSS = function(doc, force)
    {
        try {
            var idPrefix = APP.getInternalName() + '-firebug-css-',
                heads = doc.getElementsByTagName("head"),
                id,
                file,
                found,
                code;
            self.css.forEach(function(css) {
                if(!force && UTIL.has(self.fileMTimes, css[0].path)) {
                    if(""+self.fileMTimes[css[0].path]==""+FILE.Path(css[0].path).mtime()) {
                        // css file has not changed
                        return;
                    }
                }
                file = FILE.Path(css[0].path);
                self.fileMTimes[css[0].path] = file.mtime();
                id = idPrefix + STRUCT.bin2hex(MD5.hash(css[0].path));
                found = doc.getElementById(id);
                if(found && css[2]!==true) {    // css[2] checks forceReload
                    // stylesheet already added
                    return;
                }
                try {
                    code = css[1](file.read(), css[0]);
                } catch(e) {
                    print("Error in cssProcessor callback: " + css[1]);
                    throw e;
                }
                if(found) {
                    found.innerHTML = code;
                } else {
                    var style = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
                    style.setAttribute("charset","utf-8");
                    style.setAttribute("type", "text/css");
                    style.setAttribute("id", id);
                    style.innerHTML = code;
                    if (heads.length) {
                        heads[0].appendChild(style);
                    }
                }
            });
        } catch(e) {
            print("ERROR["+module.path+":CSSTracker.checkCSS]: " + e);
        }
    };
    return self;
}