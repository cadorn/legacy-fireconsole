
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var CONTAINER = require("container", "nr-common");
var SIDEBAR = require("../sidebar").Sidebar();


exports.Container = function (pkgId, object, name) {

    // PRIVATE

    var Container = CONTAINER.Container(pkgId, object, name);
    Container.prototype = UTIL.copy(Container);

    
    // PUBLIC
    
    Container.onLoad = function() {
        Container.buildUI();
    }

    Container.onUnload = function() {
    }

    Container.destroy = function() {
        Container.prototype.destroy();
        clearUI();
/*        
        // close the sidebar if it is open
        if(!object.window.top.document.getElementById("sidebar-box").hidden) {
            // make sure our sidebar is showing
            if(object.window.top.document.getElementById("sidebar").contentWindow===object.window) {
                object.window.top.toggleSidebar();
            }
        }
*/        
    }

    Container.buildUI = function()
    {
        clearUI();

        var actionList = getActionList(),
            testActions = SIDEBAR.getTestActions();
        
        testActions.forEach(function(action) {
            actionList.addAction(action[0], action[1]);
        });
    }

    return Container;
    
    // PRIVATE
    
    function getActionList() {
        return Container.getBinding("ActionList").getObject();
    }

    function clearUI() {
        getActionList().removeAllActions();
    }
    
}
