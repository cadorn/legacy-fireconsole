
var WILDFIRE = require("wildfire");
var JSON = require("json");

var Dispatcher = exports.Dispatcher = function() {
    if (!(this instanceof exports.Dispatcher))
        return new exports.Dispatcher();
}

Dispatcher.prototype.getEncoder = function() {
    if(!this.encoder) {
        this.encoder = require("./encoder/default").Encoder();
    }
    return this.encoder;
}

Dispatcher.prototype.send = function(data, meta) {
    return this.sendRaw(
        this.getEncoder().encode(data, meta),
        (meta)?JSON.encode(meta):""
    );
}

Dispatcher.prototype.sendRaw = function(data, meta) {
    var message = WILDFIRE.getBinding().newMessage();
    message.setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1');
    message.setSender('http://github.com/cadorn/fireconsole/tree/master/packages/lib-js/');
    message.setReceiver("http://pinf.org/cadorn.org/fireconsole/meta/Receiver/Console/0.1");
    if(meta) message.setMeta(meta);
    message.setData(data);
    return message.dispatch();
}