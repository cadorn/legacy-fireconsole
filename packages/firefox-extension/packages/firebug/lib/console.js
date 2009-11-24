
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var MD5 = require("md5");
var STRUCT = require("struct");
var UTIL = require("util", "nr-common");
var INTERFACE = require("./interface");


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



exports.registerCss = function(css)
{
    for (var i = 0; i < css.length; i++) {
        CSSTracker.registerCSS(css[i]);
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
    
    registerCSS: function(css)
    {
        this.css.push(css);
    },

    checkCSS: function(context)
    {
        var id = '%%PP%%_Console-CustomCSS-'+this.css.length;
        var doc = context.getPanel('console').document;
        
        if(doc.getElementById(id)) {
            // Stylesheet already added
            return;
        }

        // Generate CSS code and hash it
        var code = [];
        for (var i = 0; i < this.css.length; i++) {
            code.push(this.css[i].getCode());
            code.push("\n");
        }
        
//        var url = this._getCssURL();

        var style = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
        style.setAttribute("charset","utf-8");
        style.setAttribute("type", "text/css");
        style.setAttribute("id", id);
        style.innerHTML = code.join("\n");

        var heads = doc.getElementsByTagName("head");
        if (heads.length) {
            heads[0].appendChild(style);
        }
    },
    
    _getCssURL: function()
    {
        if(this.url) {
            return this.url;
        }
        
        // Generate CSS code and hash it
        var code = [];
        for (var i = 0; i < this.css.length; i++) {
            code.push(this.css[i].getCode());
            code.push("\n");
        }
        code = code.join("\n");
        var hash = STRUCT.bin2hex(MD5.hash(code));
        
        // Write css data to file and record URL
/*        
        var path = Extension.getPath("/user/chrome/content/org.FirePHP.Packages.Firebug/_cache/Console/CSS/"+hash+".css");
        
        file.mkdirs(path);
        file.write(path, code);
        
        return "chrome://%%Extension.InternalAppName%%-user/content/org.FirePHP.Packages.Firebug/_cache/Console/CSS/"+hash+".css";
*/
    }
}