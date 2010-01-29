
var UTIL = require("util");
var SANDBOX = require("sandbox").Sandbox;
var LOADER = require("loader").Loader;
var PACKAGES = require("packages");
var DOMPLATE = require("domplate", "domplate");
var JAR_LOADER = require("jar-loader");

var sandboxDirty = true;
var sandboxPackages = [];
var repositoryPaths = [];
var loadedPacks = {};


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


function getLogger() {
    if(!logger) {
        logger = {
            log: function() {}
        }
    }
    return logger;
}


exports.requirePack = function(id, force, notSandboxed, externalLoader) {
    if(force || !UTIL.has(loadedPacks, id)) {
        loadedPacks[id] = loadTemplatePack(id, force, notSandboxed);
    }
    var pack = loadedPacks[id].newInstance();
    pack.setExternalLoader(externalLoader);
    return pack;
}

var sandboxRequire;
function loadTemplatePack(id, force, notSandboxed) {

    if(notSandboxed) {
        return require("_pack_", id).Pack();
    }

    // Establish a sandbox for all template packs
    // If the sandbox is marked dirty we re-create it
    if(force || sandboxDirty) {
        // TODO: Properly destroy old sandbox for better memory usage?
        var ssystem = UTIL.copy(require("system"));
        // Load minimal system
        var loader = LOADER({
            "paths": [
                "resource://narwhal-xulrunner/lib",
                "resource://narwhal/engines/default/lib",
                "resource://narwhal/lib"
            ]
        });
        var sandbox = SANDBOX({
            "system": ssystem,
            "loader": loader,
            "modules": {
                "system": ssystem,
                // TODO: This needs to be moved out of this module and package to make it more generic
                "jar-loader": JAR_LOADER        // prevents module from being re-loaded in the sandbox
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
        paths.push("resource://narwhal");
        sandboxRequire("packages").load(paths);
        sandboxDirty = false;
        
        var sPACK = sandboxRequire("pack", module["package"]);       
        sPACK.setLogger(logger);

        var sDOMPLATE = sandboxRequire("domplate", "github.com/cadorn/domplate/zipball/master");
        // TODO: Potential security hole?
        sDOMPLATE.DomplateDebug.replaceInstance(DOMPLATE.DomplateDebug);
    }
    return sandboxRequire("_pack_", id).Pack();
}
