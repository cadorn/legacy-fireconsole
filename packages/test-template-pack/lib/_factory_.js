
var FACTORY = require("factory", "template-pack");


exports.Factory = function() {
    var Factory = function() {};
    Factory.prototype = FACTORY.Factory(module);
    var self = new Factory();

    self.registerTemplate("helloworld");
    self.registerTemplate("hello");
    self.registerTemplate("world");
    
    return self;
}

