
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var FILE = require("file");
var MD5 = require("md5");
var STRUCT = require("struct");
var UTIL = require("util", "nr-common");
var INTERFACE = require("./interface");
var APP = require("app", "nr-common").getApp();


var selectedRow = null;


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



exports.registerCss = function(css, preProcessCallback, forceReload)
{
    for (var i = 0; i < css.length; i++) {
        CSSTracker.registerCSS(css[i], preProcessCallback, forceReload);
    }
}

exports.logRep = function(rep, data, context)
{
    CSSTracker.checkCSS(context);

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


var CSSTracker = {
    
    url: null,
    css: [],
    fileMTimes: {},
    
    registerCSS: function(css, preProcessCallback, forceReload)
    {
        // only add if CSS with same path does not already exist
        for( var i=0 ; i<this.css.length ; i++ ) {
            if(this.css[i][0].path==css.path) {
                this.css[i] = [css, preProcessCallback, forceReload];
                css = null;
                break;
            }
        }
        if(css!==null) {
            this.css.push([css, preProcessCallback, forceReload]);
        }
    },

    checkCSS: function(context)
    {
        var self = this;
        var idPrefix = APP.getInternalName() + '-firebug-css-',
            doc = context.getPanel('console').document,
            heads = doc.getElementsByTagName("head"),
            id,
            file,
            found,
            code;
        this.css.forEach(function(css) {
            if(UTIL.has(self.fileMTimes, css[0].path)) {
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
            code = css[1](file.read(), css[0]);
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
        })
    }
}