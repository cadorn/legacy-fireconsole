

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util", "nr-common");
var APP = require("app", "nr-common").getApp();


var pkg = APP.getPackage(module["package"]),
    pkgPrefix = pkg.getPackagePrefix();


//var options = null;
//var id = null;
//var binding = null;
//var x = null;
//var y = null;
//var width = null;
//var height = null;


var IFramePanel = exports.IFramePanel = function () {}

IFramePanel.prototype = new UTIL.prototypes.Listener();


/**
 * options: {
 *     "id": Unique App-wide ID for panel
 *     "title": Panel title
 *     "url": URL to load
 *     "close.button.label": Label for close button
 * }
 */
IFramePanel.prototype.init = function (options) {
    
    this.options = options;
    if(!UTIL.has(this.options, "close.button.label")) {
        this.options["close.button.label"] = "Close";
    }
    
    this.id = this.options.id;
    
    var self = this;

    // Create panel using bindings

    this.binding = self._createPanel(APP.getInternalName() + this.id);

    this.binding.panel.addEventListener("popuphidden", function(event) {
        self.dispatch("onClosed",[]);
    }, false);
    
    this.binding.title.setAttribute("value", this.options.title);

    this.binding.button_close.onclick = function() {
        self.hide();
    }
    this.binding.button_close.setAttribute("label", this.options["close.button.label"]);

    self.load((this.options.url || "about:blank"));
    
    

    // moving and resizing

    var moveMode = false,
        dragInfo = false;

    this.binding.panel.onmousemove = function(event) {
        if(dragInfo!==false) {
            var xo = event.screenX - dragInfo.mouseOrigin[0];
            var yo = event.screenY - dragInfo.mouseOrigin[1];
            var xc = xo - dragInfo.changeOffset[0];
            var yc = yo - dragInfo.changeOffset[1];
            // move or resize panel if change is more than 5 pixels in any direction
            if(xc >=5 || xc <=-5 || yc>=5 || yc<=-5) {
                if(moveMode=="nw") {
                    var browser = APP.getChrome().getBrowser().selectedBrowser;
                    // NOTE: We need to add the browser.contentWindow position to anchor the panel
                    //       origin which results in very odd x and y values. This is likely a bug in xulrunner.
                    self.binding.panel.moveTo(
                        (browser.contentWindow.screenX + dragInfo.panelBox[0] + xo),
                        (browser.contentWindow.screenY + 20 + dragInfo.panelBox[1] + yo)
                    );
                } else
                if(moveMode=="se") {
                    self.sizeTo(
                        dragInfo.panelBox[2] + xo,
                        dragInfo.panelBox[3] + yo
                    );
                }
                dragInfo.changeOffset = [xo, yo];
            }
        } else {
            detectMouseMode(event);
        }
    }
    this.binding.panel.onmousedown = function(event) {
        detectMouseMode(event);
        dragInfo = {
            "mouseOrigin": [
                event.screenX,
                event.screenY
            ],
            "panelBox": [
                self.binding.panel.boxObject.screenX,
                self.binding.panel.boxObject.screenY,   
                self.binding.panel.boxObject.width,
                self.binding.panel.boxObject.height            
            ],
            "changeOffset": [0, 0]
        }
    }
    this.binding.panel.onmouseup = function(event) {
        if(dragInfo!==false) {
            if(moveMode=="nw" && dragInfo.changeOffset[0]!=0 && dragInfo.changeOffset[1]!=0) {
                // NOTE: all these three statements are needed to properly persist the new size
                self.moveTo(
                    dragInfo.panelBox[0] + dragInfo.changeOffset[0],
                    dragInfo.panelBox[1] + dragInfo.changeOffset[1]
                );
                self.hide();
                self.show();
            }
            dragInfo = false;
        }
        setMoveMode(false);
    }
    
    function detectMouseMode(event) {
        var x = event.screenX - self.binding.panel.boxObject.screenX,
            y = event.screenY - self.binding.panel.boxObject.screenY,
            w = self.binding.panel.boxObject.width,
            h = self.binding.panel.boxObject.height;
        if(x >=7 && x <= w - 100 && y >=7 && y <= 35) {
            setMoveMode("nw");
        } else
        if(x >= w-18 && x <= w-4 && y >= h-18 && y <= h-4) {
            setMoveMode("se");
        } else {
            setMoveMode(false);
        }
    }
    function setMoveMode(mode) {
        if(mode=="nw") {
            if(moveMode!="nw") {
                setMoveMode(false);
                UTIL.dom.setClass(self.binding.nob_nw, pkgPrefix + "IFramePanel-Nob-show");
                moveMode = "nw";
            }
        } else
        if(mode=="se") {
            if(moveMode!="se") {
                setMoveMode(false);
                UTIL.dom.setClass(self.binding.nob_se, pkgPrefix + "IFramePanel-Nob-show");
                moveMode = "se";
            }
        } else {
            if(moveMode!==false) {
                UTIL.dom.removeClass(self.binding.nob_nw, pkgPrefix + "IFramePanel-Nob-show");
                UTIL.dom.removeClass(self.binding.nob_se, pkgPrefix + "IFramePanel-Nob-show");
                moveMode = false;
            }
        }
    }
    
        
    return this;
};



IFramePanel.prototype._createPanel = function(id) {
    return APP.getChrome().getBinding(module["package"], "PanelList").getObject().createIFramePanel(id);
};

IFramePanel.prototype.getBinding = function() {
    return this.binding;
}

IFramePanel.prototype.getIFrame = function() {
    return this.getBinding().iframe;
}

IFramePanel.prototype.moveTo = function(x, y) {
    this.x = x;
    this.y = y;
    this.binding.panel.moveTo(this.x, this.y);
};

IFramePanel.prototype.sizeTo = function(width, height) {
    this.width = width;
    this.height = height;
    this.binding.panel.sizeTo(this.width, this.height);
};

IFramePanel.prototype.load = function(url) {
    this.binding.iframe.setAttribute("src", url);
};

IFramePanel.prototype.reload = function(onLoadCallback) {
    if(onLoadCallback) {
        var self = this;
        var onLoad = function() {
            self.binding.iframe.removeEventListener("load", onLoad, true);
            onLoadCallback();
        }
        this.binding.iframe.addEventListener("load", onLoad, true);
    }
    this.binding.iframe.webNavigation.reload(Ci.nsIWebNavigation.LOAD_FLAGS_NONE);
};

IFramePanel.prototype.isShowing = function()
{
    if (this.binding.panel.state == 'open') {
        return true;
    }
    return false;
};

IFramePanel.prototype.show = function()
{
    if(this.isShowing()) {
        return;
    }
    
    if(!this.x || !this.y || !this.width || !this.height) {
        
        var browser = APP.getChrome().getBrowser().selectedBrowser;

        var bx = browser.boxObject.screenX;
        var by = browser.boxObject.screenY;
        var bw = browser.boxObject.width;
        var bh = browser.boxObject.height;

        var w = bw - 200;
        var h = bh - 40;

        this.sizeTo(w, h);
        
        this.x = (bx + (bw - w) / 2);
        this.y = (by + (bh - h) / 2);

        this.binding.panel.openPopupAtScreen(this.x, this.y);
    } else {
        this.binding.panel.openPopupAtScreen(this.x, this.y);
    }
};

IFramePanel.prototype.hide = function()
{
    if(!this.isShowing()) {
        return ;
    }

    this.binding.panel.hidePopup();
};


