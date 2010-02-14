

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var LOCATOR = require("package/locator", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var BUILDER = require("builder", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var PINF = require("pinf", "http://registry.pinf.org/cadorn.org/github/pinf/packages/common/");
var UTIL = require("util");
var OS = require("os");


var Builder = exports.Builder = function(pkg, options) {
    if (!(this instanceof exports.Builder))
        return new exports.Builder(pkg, options);
    this.construct(pkg, options);
}

Builder.prototype = BUILDER.Builder();


Builder.prototype.build = function(targetPackage, buildOptions) {

    var buildPath = targetPackage.getBuildPath(),
        rawBuildPath = buildPath.join("raw"),
        targetBasePath = buildPath.join(targetPackage.getName()),
        sourcePath,
        targetPath,
        command;

    targetPath = targetBasePath.join("lib");
    targetPath.mkdirs();
    [
        "packages/lib-php/lib",
        "packages/lib-php.wildfire/lib"
    ].forEach(function(path) {
        sourcePath = rawBuildPath.join(path);
        command = "rsync -r --copy-links --exclude \"- .DS_Store\" --exclude \"- .git/\" " + sourcePath + "/* " + targetPath;
        print(command);
        OS.command(command);
    });

    targetPath = targetBasePath.join("examples");
    targetPath.mkdirs();
    sourcePath = targetPackage.getPath().join("examples");
    command = "rsync -r --copy-links --exclude \"- .DS_Store\" --exclude \"- .git/\" --exclude \"- .tmp_*/\" " + sourcePath + "/* " + targetPath;
    print(command);
    OS.command(command);
    
    rawBuildPath.join("package.json").copy(targetBasePath.join("package.json"));
}    

