

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



var APP = require("app", "nr-common").getApp();

var IFRAME_PANEL = require("./IFramePanel");



var DivPanel = exports.DivPanel = function () {}

DivPanel.prototype = new IFRAME_PANEL.IFramePanel();

DivPanel.prototype._createPanel = function(id) {
    return APP.getChrome().getBinding(module["package"], "PanelList").getObject().createDivPanel(id);
}

DivPanel.prototype.load = function(url) {
}    

DivPanel.prototype.reload = function() {
}

DivPanel.prototype.getDiv = function() {
    return this.getBinding().div;
}
