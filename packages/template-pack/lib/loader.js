
var UTIL = require("util");
var SANDBOX = require("sandbox").Sandbox;
var LOADER = require("loader").Loader;
var PACKAGES = require("packages");
var DOMPLATE = require("domplate", "domplate");


var sandboxDirty = true;
var sandboxPackages = [];
var repositoryPaths = [];
var loadedPacks = {};
var externalLoader;



var externalLogger;
exports.setLogger = function(logger) {
    externalLogger = logger;
}
var logger = {
    log: function() {
        if(externalLogger) externalLogger.log.apply(null, arguments);
    }
}



exports.markSandboxDirty = function() {
    sandboxDirty = true;
}

exports.addSandboxPackage = function(name) {
    sandboxPackages.push(name);
    // Mark the sandbox as dirty to re-create it when the next template pack is loaded
    sandboxDirty = true;
}

exports.addRepositoryPath = function(file) {
    repositoryPaths.push(file);
    // Mark the sandbox as dirty to re-create it when the next template pack is loaded
    sandboxDirty = true;
}

exports.setExternalLoader = function(loader) {
    externalLoader = loader;    
}



function getLogger() {
    if(!logger) {
        logger = {
            log: function() {}
        }
    }
    return logger;
}


exports.requirePack = function(id, force, notSandboxed) {
    try {
        if(force || !UTIL.has(loadedPacks, id)) {
            loadedPacks[id] = loadTemplatePack(id, force, notSandboxed);
        }
        return loadedPacks[id];
    } catch(e) {
        print("Error loading template pack: " + id);
        print("ERROR: " + e);
    }
}

var sandboxRequire;
function loadTemplatePack(id, force, notSandboxed) {

    if(notSandboxed) {
        var pack = require("_pack_", id).Pack();
        pack.setExternalLoader(externalLoader);
        return pack;
    }

    // Establish a sandbox for all template packs
    // If the sandbox is marked dirty we re-create it
    if(force || sandboxDirty) {
        // TODO: Properly destroy old sandbox for better memory usage?
        var ssystem = UTIL.copy(require("system"));
        // Load minimal system
        var paths = UTIL.copy(require.paths).splice(0,3);
        var loader = LOADER({"paths": paths});
        var sandbox = SANDBOX({
            "system": ssystem,
            "loader": loader,
            "modules": {
                "system": ssystem
            }
        });
        sandbox.force("system");
        sandboxRequire = function(id, pkg) {
            return sandbox(id, null, pkg);
        }
        sandboxRequire("global");
        var paths = UTIL.copy(repositoryPaths);
        sandboxPackages.forEach(function(name) {
            paths.push(PACKAGES.catalog[name].directory);
        });
        sandboxRequire("packages").load(paths);
        sandboxDirty = false;
        
        var sPACK = sandboxRequire("pack", module["package"]);       
        sPACK.setLogger(logger);

        var sDOMPLATE = sandboxRequire("domplate", "github.com/cadorn/domplate/zipball/master");
        // TODO: Potential security hole?
        sDOMPLATE.DomplateDebug.replaceInstance(DOMPLATE.DomplateDebug);
    }
    var pack = sandboxRequire("_pack_", id).Pack();
    pack.setExternalLoader(externalLoader);
    return pack;
}
