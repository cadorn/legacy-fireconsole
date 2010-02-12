
var URI = require("uri");
//var PACKAGES = require("packages");

var Descriptor = exports.Descriptor = function(locator) {
    
    this.locator = locator;

/*    
    this.info = {};
    
    // for backwards compatibility
    if(info["package.project.url"]) {
        
        this.info = {
            "homepage": info["package.project.url"],
            "repositories": [
                {
                    "type": "www",
                    "url": info["package.source.url"]
                }
            ],
            "download": info["package.descriptor"]
        };
    } else
    // for backwards compatibility
    if(info["project.url"]) {
        
        this.info = {
            "homepage": info["project.url"],
            "repositories": [
                {
                    "type": "www",
                    "url": info["source.url"]
                }
            ],
            "download": info["descriptor"]
        };
        
    } else {
        this.info = info;
    }
*/

}

Descriptor.prototype.getId = function() {
    return this.locator.getTopLevelId();
}

Descriptor.prototype.getInfo = function() {
    return this.locator.getSpec(true);
}


Descriptor.prototype.getDownloadUrl = function() {
    if(!this.locator.isDirect()) {
        throw new Error("Only direct download locators are supported for template packs at this time");
    }
    return this.locator.getUrl();
}


/*
Descriptor.prototype.getDownloadInfo = function() {
    return this.info.download;
}
*/
