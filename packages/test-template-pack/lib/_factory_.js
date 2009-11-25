
var FACTORY = require("factory", "template-pack");


exports.Factory = function() {
    var Factory = function() {};
    Factory.prototype = FACTORY.Factory(module);
    var self = new Factory();

    self.registerTemplate("helloworld");
    
    return self;
}

