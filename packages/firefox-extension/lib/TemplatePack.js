

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var URI = require("uri");
var UTIL = require("util");
var FILE = require("file");
var STRUCT = require("struct");
var MD5 = require("md5");

var FIREBUG_CONSOLE = require("console", "firebug");
var SEA = require("narwhal/tusk/sea");
var APP = require("app", "nr-common").getApp();
var JSON_STORE = require("json-store", "nr-extra");
var TEMPLATE_PACK_LOADER = require("loader", "template-pack");
var TEMPLATE_PACK_DESCRIPTOR = require("descriptor", "template-pack");

var SECURITY = require("./Security");


var templatePackSea;
var templatePacks = {};

var templatePackSeaPath = APP.getChrome().getProfilePath().join("FireConsole", "TemplatePacks"),
    templatePackMetaFile = APP.getChrome().getProfilePath().join("FireConsole", "Config", "TemplatePacks.json"),
    templatePackMetaStore = new JSON_STORE.JsonStore(templatePackMetaFile);

if(!templatePackMetaStore.exists()) {
    templatePackMetaStore.init();
    templatePackMetaStore.set({
        "schema": "0.1"
    });
}

TEMPLATE_PACK_LOADER.setLogger(FIREBUG_CONSOLE);
// Tell the template loader which extra packages to load into the sandbox
TEMPLATE_PACK_LOADER.addSandboxPackage(APP.getInfo().ID);
// Tell the template loader where to find template packs
TEMPLATE_PACK_LOADER.addRepositoryPath(templatePackSeaPath);

function init() {   // This function is triggered at the end of this file
    var descriptor;
    
    descriptor = new TEMPLATE_PACK_DESCRIPTOR.Descriptor({
        "homepage": "http://github.com/cadorn/fireconsole",
        "repositories": [
            {
                "type": "www",
                "url": "http://github.com/cadorn/fireconsole/tree/master/packages/firefox-extension/packages/reps/"
            }
        ],
        "download": {
            "catalog": "http://github.com/cadorn/fireconsole/raw/master/catalog.json",
            "name": "firefox-extension-reps"
        }        
    });
    addTemplatePack(descriptor);
    exports.requirePack(null, descriptor);

    descriptor = new TEMPLATE_PACK_DESCRIPTOR.Descriptor({
        "homepage": "http://github.com/cadorn/fireconsole-template-packs",
        "repositories": [
            {
                "type": "www",
                "url": "http://github.com/cadorn/fireconsole-template-packs/tree/master/packages/fc-object-graph/"
            }
        ],
        "download": {
            "catalog": "http://github.com/cadorn/fireconsole-template-packs/raw/master/catalog.json",
            "name": "fc-object-graph"
        }        
    });
    addTemplatePack(descriptor);
    exports.requirePack(null, descriptor);
}

exports.getPackSea = function() {
    if(!templatePackSea) {
        templatePackSea = SEA.Sea(templatePackSeaPath);
    }
    return templatePackSea;
}

exports.newDescriptorForClientInfo = function(info) {
    return new TEMPLATE_PACK_DESCRIPTOR.Descriptor(info);
}

exports.getDescriptorForId = function(packId) {
    var templatePacks = templatePackMetaStore.get();
    if(!templatePacks[packId]) {
        return false;
    }
    return new TEMPLATE_PACK_DESCRIPTOR.Descriptor(templatePacks[packId]);
    
}

exports.requirePack = function(domain, descriptor) {
    var id;
    if(!(descriptor instanceof TEMPLATE_PACK_DESCRIPTOR.Descriptor)) {
        id = descriptor;
        if(!(descriptor = exports.getDescriptorForId(id))) {
            throw new Error("Template pack with id '"+id+"' not installed!");
        }
    } else {
        id = descriptor.getId();
    }
    if(!UTIL.has(templatePacks, id)) {
        templatePacks[id] = new TemplatePack(descriptor);
    }
    templatePacks[id].authorize(domain);
    return templatePacks[id];
}



var TemplatePack = exports.TemplatePack = function(descriptor) {
    this.descriptor = descriptor;
}

TemplatePack.prototype.getPath = function() {
    var path = APP.getChrome().getProfilePath().join("FireConsole", "TemplatePacks");
    var datumFile = path.join("package.json");
    if(!datumFile.exists()) {
        datumFile.dirname().mkdirs();
        datumFile.write("{\"name\":\"TemplatePacks\"}");
    }
    return path.join("using", this.descriptor.getId());
}

TemplatePack.prototype.isInstalled = function() {
    if(!this.getPath().exists()) return false;
    if(!exports.getDescriptorForId(this.descriptor.getId())) return false;
    return true;
}

TemplatePack.prototype.authorize = function(domain) {
    
    var id = this.descriptor.getId();

    // these packs are shipped with fireconsole
    if(id=="github.com/cadorn/fireconsole/raw/master/firefox-extension-reps" ||
       id=="github.com/cadorn/fireconsole-template-packs/raw/master/fc-object-graph") {
        return true;
    }

    domain = getFuncVarValue(domain);

    var self = this;

    if(this.isInstalled()) {
        // NOTE: The security manager assumes the template pack has an entry in /Config/TemplatePacks.json
        return SECURITY.authorizeTemplatePack(domain, self.descriptor);
    } else {
        var uri = URI.parse(self.descriptor.getDownloadInfo().location);
        if(uri.scheme=="file") {
    
            SECURITY.installTemplatePack(domain, self.descriptor, function(feedback, success) {
                
                var sourcePath = FILE.Path(uri.path);
                var targetPath = self.getPath();
                if(!targetPath.dirname().exists()) {
                    targetPath.dirname().mkdirs();
                }
                // on windows we copy, on unix we link
                if(/\bwindows\b/i.test(system.os) || /\bwinnt\b/i.test(system.os)) {
                    FILE.copyTree(sourcePath, targetPath);
                } else {
                    sourcePath.symlink(targetPath);
                }
                addTemplatePack(self.descriptor);
                resetCache();
                success();
            });

        } else
        if(uri.authority!="github.com") {
            FIREBUG_CONSOLE.error("[fireconsole] Only GitHub-based Template Packs are supported at this time! Requested URL: "+uri.url);
            return;
        } else {
    
            SECURITY.installTemplatePack(domain, self.descriptor, function(feedback, success) {
                
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

                var targetDir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
                targetDir.initWithPath(self.getPath().valueOf());
    
                logger.log("Downloading " + uri.url + " ...");
                
                var archiveFile = getTmpPath(logger, STRUCT.bin2hex(MD5.hash(uri.url)) + ".zip");
                download(uri.url, archiveFile, logger, function() {
    
                    logger.log("Extracting ...");
    
                    unzip(archiveFile, targetDir, self.descriptor.getDownloadInfo().path || false, logger);
    
                    archiveFile.remove(false);
    
                    if(logger.errors==0) {
                       success();
                    }
    
                    addTemplatePack(self.descriptor);
                    resetCache();
                });
            });        
            
        }
    }
}

TemplatePack.prototype.load = function(domain, reload, notSandboxed) {
    var forceLoad = false;
    if(this.pack && !reload) {
        // if the reload flag has changed we need to reload the pack
        if(reload!=this.pack._reload) {
            forceLoad = true;
        } else {
            return this.pack;
        }
    }
    this.pack = TEMPLATE_PACK_LOADER.requirePack(this.descriptor.getId(), (forceLoad || reload), notSandboxed, function() { return {
        "seekTemplate": function(node) {
            var pack = exports.requirePack(domain, "github.com/cadorn/fireconsole-template-packs/raw/master/fc-object-graph");
            pack = pack.load(domain, reload);
            return pack.seekTemplate(node);
        },
        "getTemplateForId": function(id) {
            var parts = id.split("#");
            var pack = exports.requirePack(domain, parts[0]);
            return pack.getTemplate(domain, parts[1], reload);
        }
    }});
    this.pack._reload = reload;
    return this.pack;
}

TemplatePack.prototype.getTemplate = function(domain, name, reload, notSandboxed) {
    if(!this.authorize(domain)) {
        throw new Error("Template pack '"+this.descriptor.getId()+"' is not authorized to be used for domain '"+getFuncVarValue(domain)+"'.");
    }
    this.load(domain, reload, notSandboxed);
    return this.pack.getTemplate(name);
}


function getFuncVarValue(subject) {
    if(typeof subject == "function") return subject();
    return subject;
}

function resetCache() {
    // reset some cached resources
    templatePackSea = null;
    TEMPLATE_PACK_LOADER.markSandboxDirty();
}

function addTemplatePack(descriptor) {
    var templatePacks = templatePackMetaStore.get();
    templatePacks[descriptor.getId()] = descriptor.getInfo();
    templatePackMetaStore.set(templatePacks);
}    

function getTmpPath(logger, filename) {
    var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
    ["FireConsole", ".tmp"].forEach(function (part) {
        file.append(part);
        if (!file.exists()) {
            try {
                file.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
            } catch (e) {
                system.log.warn(e);
                logger.error("failed to create target directory for extraction " +
                    " file = " + file.path + ", exception = " + e, "red");
            }
        }
    });
    file.append(filename);
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


function unzip(archiveFile, targetFile, onlyFromPath, logger) {
    
    onlyFromPath = (onlyFromPath || "").split("/");

    var zipReader = Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
    zipReader.open(archiveFile);
    zipReader.test(null);

    // create directories first
    var entries = zipReader.findEntries("*/");
    while (entries.hasMore()) {
        var entryName = entries.getNext();
        var target = getItemFile(entryName);
        if(target===null) continue;
        if (!target.exists()) {
            try {
                target.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
            } catch (e) {
                system.log.warn(e);
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
        if(target===null) continue;
        if (target.exists()) continue;

        try {
            target.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
        } catch (e) {
            system.log.warn(e);
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
        parts.shift();
        for (var i = 0; i < parts.length; ++i) {
            // Check if we should only extract one directory
            if(onlyFromPath.length>0 && i<onlyFromPath.length) {
                if(parts[i]!=onlyFromPath[i]) {
                    return null;
                }
            } else {
                itemLocation.append(parts[i]);
            }
        }
        return itemLocation;
    }
}

init();
