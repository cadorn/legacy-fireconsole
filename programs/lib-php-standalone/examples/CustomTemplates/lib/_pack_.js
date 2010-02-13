
var PACK = require("pack", "template-pack");


exports.Pack = function() {
    var Pack = function() {};
    Pack.prototype = PACK.Pack(module);
    var self = new Pack();

    self.registerTemplate("console");
    self.registerTemplate("object");
    
    return self;
}

