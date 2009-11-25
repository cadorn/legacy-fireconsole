

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var URI = require("uri");
var UTIL = require("util");
var FILE = require("file");
var STRUCT = require("struct");
var MD5 = require("md5");

var APP = require("app", "nr-common").getApp();
var TEMPLATE_PACK_LOADER = require("loader", "template-pack");

var SECURITY = require("./Security");


var fcObjectGraphTemplatePack;
var templatePacks = {};

exports.factory = function(info) {
    var id = getTemplatePackId(info);
    if(!UTIL.has(templatePacks, id)) {
        templatePacks[id] = exports.TemplatePack(id, info);
    }
    return templatePacks[id];
}

// find fc-object-graph template based on node type
exports.seekTemplate = function(node) {
    return fcObjectGraphTemplatePack.seekTemplate(node);
}

// get template based on template pack ID
exports.getTemplate = function(meta) {
    if(!UTIL.has(meta, "fc.tpl.id")) {
        return false;
    }
    var parts = meta["fc.tpl.id"].split("#");
    if(!UTIL.has(templatePacks, parts[0])) {
        return false;
    }
    return templatePacks[parts[0]].getTemplate(parts[1]);
}



exports.TemplatePack = function(id, info) {
    
    var TemplatePack = function() {};
    var self = new TemplatePack();
    
    self.info = info;
    
    self.load = function(force) {
        if(!isInstalled()) {
            requestInstall();
            return false;
        }
        this.pack = TEMPLATE_PACK_LOADER.requirePack(id, force);
        return true;
    }
    
    self.getTemplate = function(name, forceReload) {
        
        // TODO: Check secirity to ensure domain is authorized to use templates from this pack
        
        if(forceReload) {
            self.load(true);
        }
        return this.pack.getTemplate(name);
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
        file = getTemplatePackBasePath();
        file.append("using");
        getTemplatePackId(self.info).split("/").forEach(function(part) {
            if(part) file.append(part);
        });
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

function getTemplatePackId(info) {
    var uri = URI.parse(info["download.archive.url"]);
    var path = info["download.archive.path"];
    var parts = [uri.domain];
    uri.path.split("/").forEach(function(part) {
        if(part) parts.push(part);
    });
    if(path) {
        path.split("/").forEach(function(part) {
        if(part) parts.push(part);
        });
    }
    return parts.join("/");
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





// Tell the template loader which extra packages to load into the sandbox
TEMPLATE_PACK_LOADER.addSandboxPackage(APP.getInfo().ID);
// Tell the template loader where to find template packs
TEMPLATE_PACK_LOADER.addRepositoryPath(FILE.Path(getTemplatePackBasePath().path));

// Load default fc-object-graph template pack
fcObjectGraphTemplatePack = TEMPLATE_PACK_LOADER.requirePack("github.com/cadorn/domplate-reps/raw/master/fc-object-graph");


