
var APP = require("app", "nr-common");


var Sidebar;

exports.Sidebar = function () {
    
    // singleton
    if(Sidebar) {
        return Sidebar;
    }

    // PRIVATE

    var testActions = [];


    Sidebar = {};
    
    
    // PUBLIC

    Sidebar.getTestActions = function() {
        return testActions;
    }

    Sidebar.addTestAction = function(label, callback) {
        testActions.push([label, callback]);
        buildUI();
    }

    return Sidebar;

    
    // PRIVATE
    
    function buildUI() {
        var ui = APP.getApp().getContainer(module["package"], "Sidebar");
        if(ui) {
            ui.buildUI();
        }
    }
}