
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
    message.setProtocol('http://registry.pinf.org/cadorn.org/github/wildfire/@meta/protocol/component/0.1.0');
    message.setSender('http://registry.pinf.org/cadorn.org/github/fireconsole/packages/lib-js/');
    message.setReceiver("http://registry.pinf.org/cadorn.org/github/fireconsole/@meta/receiver/console/0.1.0");
    if(meta) message.setMeta(meta);
    message.setData(data);
    return message.dispatch();
}