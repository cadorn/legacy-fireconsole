

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util", "nr-common");

var DOMPLATE = require("domplate", "domplate");
var FIREBUG_INTERFACE = require("interface", "firebug");
var FIREBUG_CONSOLE = require("console", "firebug");


//DOMPLATE.DomplateDebug.enabled = true;
DOMPLATE.DomplateDebug.console = FIREBUG_CONSOLE;




var firebugMaster,
    variableViewerMaster;

exports.getMaster = function(name) {
    if(name=="Firebug") {
        if(firebugMaster) return firebugMaster;
        var MASTER = require("./FirebugMaster");
        return firebugMaster = new MASTER.FirebugMaster();
    } else
    if(name=="VariableViewer") {
        if(variableViewerMaster) return variableViewerMaster;
        var MASTER = require("./VariableViewerMaster");
        return variableViewerMaster = new MASTER.VariableViewerMaster();
    }
    throw "Master rep with name '" + name + "' not supported!";
}


var Master = exports.Master = function() {}


Master.prototype.setTemplate = function(template)
{
    this.template = template;
}

Master.prototype.getTemplate = function()
{
    return this.template;
}

