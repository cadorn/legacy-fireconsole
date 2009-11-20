
var UTIL = require("util", "nr-common");
var DOMPLATE = require("domplate", "domplate");
var COLLECTION = require("collection", "domplate");
var REPS = require("./Reps");

var VariableViewerMaster = exports.VariableViewerMaster = function() {
    var that = this;
    
    var collection = COLLECTION.Collection();
    collection.addCss(require.loader.resolve("./VariableViewerMaster.css", module.id));

    this.construct(collection);

    this.rep = function() {
        try {
            with (DOMPLATE.tags) {
            
                // Extend the default firebug rep
                return DOMPLATE.domplate({
                    
                    priorityClassName: "",
                    
                    tag: DIV({class: "VariableViewerRep",
                              _repObject: "$object"},
                              
                             TAG("$object|_getTag", {node: "$object|_getValue"})),
                    
                    _getTag: function(object)
                    {
                        var rep = that.getRepForNode(object.getOrigin());
//                        var rep = that.getRepForObject(object[1], object[0]);
                        return rep.tag;
                    },
                    
                    _getValue: function(object)
                    {
                        return object.getOrigin();
                    },
        
                    _appender: function(object, row, rep)
                    {
                        var ret = rep.tag.append({
                            object: object
                        }, row);
        
                        return ret;                
                    },
                    
                    _normalizeData: function(object)
                    {
                        return object;
                    },
        
                    _getMasterRow: function(row)
                    {
                        // Seek our MasterRep node
                        while(true) {
                            if(!row.parentNode) {
                                return null;
                            }
                            if(UTIL.dom.hasClass(row, "VariableViewerRep")) {
                                break;
                            }
                            row = row.parentNode;
                        }
                        return row;
                    }
                });
            }
        } catch(e) {
            print(e, 'ERROR');
        }    
    }();    
};
VariableViewerMaster.prototype = new REPS.Master();

