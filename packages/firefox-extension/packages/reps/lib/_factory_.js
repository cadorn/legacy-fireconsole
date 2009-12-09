
var FACTORY = require("factory", "template-pack");


exports.Factory = function() {
    var Factory = function() {};
    Factory.prototype = FACTORY.Factory(module);
    var self = new Factory();
    
    self.registerCss("common.css");
    
    self.registerTemplate("ConsoleOpenGroup");
    self.registerTemplate("ConsoleCloseGroup");

    return self;
}

