
var URI = require("uri");
var PACKAGES = require("packages");

var Descriptor = exports.Descriptor = function(info) {
    
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
    
}

Descriptor.prototype.getId = function() {
    if(this.id) {
        return this.id;
    }
    this.id = PACKAGES.normalizePackageDescriptor(this.info.download);
    return this.id;
}


Descriptor.prototype.getInfo = function() {
    return this.info;
}

Descriptor.prototype.getDownloadInfo = function() {
    return this.info.download;
}
