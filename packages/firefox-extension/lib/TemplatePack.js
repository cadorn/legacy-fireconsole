


function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var URI = require("uri");
var UTIL = require("util");
var STRUCT = require("struct");
var MD5 = require("md5");
var SECURITY = require("./Security");



exports.TemplatePack = function(info) {
    
    var TemplatePack = function() {};
    var self = new TemplatePack();
    
    self.info = info;
    
    self.getCollection = function() {
        if(!isInstalled()) {
            requestInstall();
            return false;
        }
        
print("fetch collection");        
    }
    
    function isInstalled() {
        return getTemplatePackPath().exists();
    }
    
    function requestInstall() {
        
        var info = UTIL.copy(self.info);
        info["profile.fireconsole.path"] = getTemplatePackBasePath().path;

        SECURITY.installTemplatePack(info, function(feedback, hide) {
            
            var logger = {
                errors: 0,
                log: function(message) {
                    feedback.log(message);
                },
                error: function(message) {
                    errors++;
                    feedback.log("ERROR: " + message, "red");
                }
            }

            var uri = URI.parse(self.info["download.archive.url"]);

            if(uri.authority!="github.com") {
                logger.log("ERROR: Only GitHub download URLs are supported at this time.", "red");
                return false;
            }

            var targetDir = getTemplatePackPath();
//            if(!targetDir.exists()) {

                logger.log("Downloading " + uri.url + " ...");
                
                var archiveFile = getTmpPath(logger, STRUCT.bin2hex(MD5.hash(self.info["download.archive.path"])) + ".zip");
                download(uri.url, archiveFile, logger, function() {
    
                    logger.log("Extracting ...");

                    unzip(archiveFile, targetDir, logger);

                    archiveFile.remove(false);

                    if(logger.errors==0) {
                       hide();
                    }
                });
//            }
            return true;
        });
    }
    
    function getTemplatePackPath() {
        var uri = URI.parse(self.info["download.archive.url"]);
        var path = self.info["download.archive.path"];
        file = getTemplatePackBasePath();
        file.append(uri.domain);
        uri.path.split("/").forEach(function(part) {
            if(part) file.append(part);
        });
        if(path) {
            path.split("/").forEach(function(part) {
                if(part) file.append(part);
            });
        }
        return file;
    }
    
    return self;    
}

function getTmpPath(logger, filename) {
    var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
    ["FireConsole", ".tmp"].forEach(function (part) {
        file.append(part);
        if (!file.exists()) {
            try {
                file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
            } catch (e) {
                logger.error("failed to create target directory for extraction " +
                    " file = " + file.path + ", exception = " + e, "red");
            }
        }
    });
    file.append(filename);
    return file;
}

function getTemplatePackBasePath() {
    var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
    file.append("FireConsole");
    file.append("TemplatePacks");
    return file;
}

function download(url, archiveFile, logger, successCallback) {
    
    var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);

    persist.progressListener = {
        onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
            logger.log(Math.round((aCurTotalProgress/aMaxTotalProgress)*100) + "%");
        },
        onStateChange: function(aWebProgress, aRequest, aStatus, aMessage) {
            if(aStatus & Ci.nsIWebProgressListener.STATE_STOP) {
                successCallback();
            }
        }
    }

    var uri = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(url, null, null);

    persist.saveURI(uri, null, null, null, "", archiveFile);
}


function unzip(archiveFile, targetFile, logger) {

    var zipReader = Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
    zipReader.open(archiveFile);
    zipReader.test(null);

    // create directories first
    var entries = zipReader.findEntries("*/");
    while (entries.hasMore()) {
        var entryName = entries.getNext();
        var target = getItemFile(entryName);
        if (!target.exists()) {
            try {
                target.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
            } catch (e) {
                logger.error("failed to create target directory for extraction " +
                    " file = " + target.path + ", exception = " + e, "red");
            }
        }
    }
    
    // extract files
    entries = zipReader.findEntries(null);
    while (entries.hasMore()) {
        var entryName = entries.getNext();
        target = getItemFile(entryName);
        if (target.exists()) continue;

        try {
            target.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
        } catch (e) {
            logger.error("failed to create target file for extraction " +
                " file = " + target.path + ", exception = " + e, "red");
        }
        zipReader.extract(entryName, target);
        logger.log(target.path);
    }
    zipReader.close();


    function getItemFile(filePath) {
        var itemLocation = targetFile.clone();
        var parts = filePath.split("/");
        // NOTE: We drop the first directory in the ZIP!
        for (var i = 1; i < parts.length; ++i) {
            itemLocation.append(parts[i]);
        }
        return itemLocation;
    }
}

