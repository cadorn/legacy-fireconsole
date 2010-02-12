
var PACK = require("pack", "template-pack");


exports.Pack = function() {
    var Pack = function() {};
    Pack.prototype = PACK.Pack(module);
    var self = new Pack();

    self.registerTemplate("string");

    self.registerTemplate("helloworld");
    self.registerTemplate("hello");
    self.registerTemplate("world");
    self.registerTemplate("say");
    
    return self;
}

