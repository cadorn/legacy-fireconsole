

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util", "nr-common");
var CHROME_UTIL = require("chrome-util", "nr-common");
var APP = require("app", "nr-common").getApp();


var pkg = APP.getPackage(module["package"]),
    pkgPrefix = pkg.getPackagePrefix();


var options = null;
var id = null;
var binding = null;
var x = null;
var y = null;
var width = null;
var height = null;

var IFramePanel = exports.IFramePanel = function () {}

IFramePanel.prototype = new UTIL.prototypes.Listener();

IFramePanel.prototype.init = function (_options) {
    
    options = _options;
    
    var self = this;

    // Create panel using bindings

    binding = self._createPanel(APP.getInternalName() + id);

    binding.panel.addEventListener("popuphidden", function(event) {
        self.dispatch("onClosed",[]);
    }, false);
    
    binding.title.setAttribute("value", options.title);

    binding.button_close.onclick = function() {
        self.hide();
    }

    self.load((options.url || "about:blank"));
    
    

    // moving and resizing

    var moveMode = false,
        dragInfo = false;

    binding.panel.onmousemove = function(event) {
        if(dragInfo!==false) {
            var xo = event.screenX - dragInfo.mouseOrigin[0];
            var yo = event.screenY - dragInfo.mouseOrigin[1];
            var xc = xo - dragInfo.changeOffset[0];
            var yc = yo - dragInfo.changeOffset[1];
            // move or resize panel if change is more than 5 pixels in any direction
            if(xc >=5 || xc <=-5 || yc>=5 || yc<=-5) {
                if(moveMode=="nw") {
                    var browser = CHROME_UTIL.getBrowser().selectedBrowser;
                    // NOTE: We need to add the browser.contentWindow position to anchor the panel
                    //       origin which results in very odd x and y values. This is likely a bug in xulrunner.
                    binding.panel.moveTo(
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
    binding.panel.onmousedown = function(event) {
        detectMouseMode(event);
        dragInfo = {
            "mouseOrigin": [
                event.screenX,
                event.screenY
            ],
            "panelBox": [
                binding.panel.boxObject.screenX,
                binding.panel.boxObject.screenY,   
                binding.panel.boxObject.width,
                binding.panel.boxObject.height            
            ],
            "changeOffset": [0, 0]
        }
    }
    binding.panel.onmouseup = function(event) {
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
        var x = event.screenX - binding.panel.boxObject.screenX,
            y = event.screenY - binding.panel.boxObject.screenY,
            w = binding.panel.boxObject.width,
            h = binding.panel.boxObject.height;
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
                UTIL.dom.setClass(binding.nob_nw, pkgPrefix + "IFramePanel-Nob-show");
                moveMode = "nw";
            }
        } else
        if(mode=="se") {
            if(moveMode!="se") {
                setMoveMode(false);
                UTIL.dom.setClass(binding.nob_se, pkgPrefix + "IFramePanel-Nob-show");
                moveMode = "se";
            }
        } else {
            if(moveMode!==false) {
                UTIL.dom.removeClass(binding.nob_nw, pkgPrefix + "IFramePanel-Nob-show");
                UTIL.dom.removeClass(binding.nob_se, pkgPrefix + "IFramePanel-Nob-show");
                moveMode = false;
            }
        }
    }
    
        
    return this;
};



IFramePanel.prototype._createPanel = function(id) {
    return APP.getBinding(module["package"], "PanelList").getObject().createIFramePanel(id);
};

IFramePanel.prototype.getBinding = function() {
    return binding;
}

IFramePanel.prototype.getIFrame = function() {
    return this.getBinding().iframe;
}

IFramePanel.prototype.moveTo = function(_x, _y) {
    x = _x;
    y = _y;
    binding.panel.moveTo(x, y);
};

IFramePanel.prototype.sizeTo = function(_width, _height) {
    width = _width;
    height = _height;
    binding.panel.sizeTo(width, height);
};

IFramePanel.prototype.load = function(url) {
    binding.iframe.setAttribute("src", url);
};

IFramePanel.prototype.reload = function(onLoadCallback) {
    if(onLoadCallback) {
        var onLoad = function() {
            binding.iframe.removeEventListener("load", onLoad, true);
            onLoadCallback();
        }
        binding.iframe.addEventListener("load", onLoad, true);
    }
    binding.iframe.webNavigation.reload(Ci.nsIWebNavigation.LOAD_FLAGS_NONE);
};

IFramePanel.prototype.isShowing = function()
{
    if (binding.panel.state == 'open') {
        return true;
    }
    return false;
};

IFramePanel.prototype.show = function()
{
    if(this.isShowing()) {
        return;
    }
    
    if(!x || !y || !width || !height) {
        
        var browser = CHROME_UTIL.getBrowser().selectedBrowser;

        var bx = browser.boxObject.screenX;
        var by = browser.boxObject.screenY;
        var bw = browser.boxObject.width;
        var bh = browser.boxObject.height;

        var w = bw - 200;
        var h = bh - 40;

        this.sizeTo(w, h);
        
        x = (bx + (bw - w) / 2);
        y = (by + (bh - h) / 2);

        binding.panel.openPopupAtScreen(x, y);
    } else {
        binding.panel.openPopupAtScreen(x, y);
    }
};

IFramePanel.prototype.hide = function()
{
    if(!this.isShowing()) {
        return ;
    }

    binding.panel.hidePopup();
};


