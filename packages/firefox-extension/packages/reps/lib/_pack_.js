
var PACK = require("pack", "template-pack");


exports.Pack = function() {
    var Pack = function() {};
    Pack.prototype = PACK.Pack(module);
    var self = new Pack();
    
    self.registerCss("common.css");
    
    self.registerTemplate("Console");
    self.registerTemplate("ConsoleOpenMessageGroup");
    self.registerTemplate("ConsoleOpenGroup");
    self.registerTemplate("ConsoleCloseGroup");

    self.registerTemplate("VariableViewer");

    return self;
}

