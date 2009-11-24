
var APP = require("app", "nr-common").getApp();


exports.run = function(logger) {
    
    logger.group("Runing FireConsole Tests");

    logger.log("Version: " + APP.getInfo().Version);

    logger.log("OK");

    logger.groupEnd();
}
