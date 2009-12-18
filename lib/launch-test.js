
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var TUSK = require("narwhal/tusk/tusk");
var ARGS = require('args');

var tusk = TUSK.Tusk().activate(),
    sea = TUSK.getActive().getSea(),
    seaPath = sea.getPath();


/**
 * Link the latest distribution version into the test profile and launch it
 */
exports.main = function (args) {

    var parser = new ARGS.Parser();
    parser.option('--build')
        .bool();
    parser.option('--source')
        .bool();
    parser.option('--nolaunch')
        .bool();
    var options = parser.parse(args);

    
    // Locate the test profile
    var profilePath = seaPath.join("build", "profiles", "test");
    if(!profilePath.exists()) {
        print("ERROR: Profile with name 'test' not found at: " + profilePath);
        return;
    }
    
    var extensionPath = profilePath.join("extensions", "fireconsole@id.cadorn.org");
    if(extensionPath.exists()) {
        if(extensionPath.isLink()) {
            print("Removing existing extension at: " + extensionPath);
            extensionPath.remove();
        } else {
            print("ERROR: Please manually delete existing extension at: " + extensionPath);
            return;
        }
    }
    
    if(options.build) {
        var command = "tusk package --package firefox-extension build dist" + ((options.source)?" --source":"");
        print("Building extension with: "+command);
        tusk.command(command);
    }
    
    // Determine distribution version
    var pkg = sea.getPackage("firefox-extension");
    var manifest = pkg.getManifest();
    var vars = {};
    resolvePackageInfoVariables(manifest.manifest, vars);
    
    print("Version: " + vars["PINF.Version"]);
    print("Release: " + vars["PINF.Release"]);
    
    var releasePath = seaPath.join("build", "firefox-extension-"+vars["PINF.Version"]+"."+vars["PINF.Release"]);
    if(!releasePath.exists()) {
        print("ERROR: Release not found at: " + releasePath);
        return;
    }

    releasePath.symlink(extensionPath);
    
    print("Linked extension at '"+extensionPath+"' to '"+releasePath+"'.");

    if(options.nolaunch) {
        print("Skipping launch");
    } else {
        var command = "nr launch --app firefox --dev --profile test";
        print("Running extension with: "+command);
        tusk.command(command);
    }
}





function resolvePackageInfoVariables(packageDatum, pinfVars) {
    
    pinfVars = pinfVars || {};
    
    UTIL.every(packageDatum.pinf, function(item1) {
        if(item1[0]=="narwhalrunner") {
            UTIL.every(packageDatum.pinf[item1[0]], function(item2) {
                packageDatum.pinf[item1[0]][item2[0]] = pinfVars["PINF.narwhalrunner."+item2[0]] = replaceVariables(item2[1], pinfVars);
            });           
        } else {
            packageDatum.pinf[item1[0]] = pinfVars["PINF."+item1[0]] = replaceVariables(item1[1], pinfVars);
        }
    });
    UTIL.every(packageDatum.narwhalrunner, function(item1) {
        packageDatum.narwhalrunner[item1[0]] = replaceVariables(item1[1], pinfVars);
    });
}

function replaceVariables(data, vars) {
    UTIL.keys(vars).forEach(function(name) {
        data = data.replace(new RegExp("{" + name + "}", "g"), vars[name]);
    });
    return data;
}