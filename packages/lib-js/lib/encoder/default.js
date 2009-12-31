
var UTIL = require("util");
var JSON = require("json");

var Encoder = exports.Encoder = function() {
    if (!(this instanceof exports.Encoder))
        return new exports.Encoder();
    this.options = {
        "maxObjectDepth": 10,
        "maxArrayDepth": 20,
        "includeLanguageMeta": true
    };
}

Encoder.prototype.setOption = function(name, value) {
    this.options[name] = value;
}

Encoder.prototype.setOrigin = function(variable) {
    this.origin = variable;
    // reset some variables
    this.instances = {};
    return true;
}

Encoder.prototype.encode = function(data, meta) {
    if(typeof data != "undefined") {
        this.setOrigin(data);
    }
    
    // TODO: Use meta["fc.encoder.options"] to control encoding
    
    var graph = {};
    
    if(typeof this.origin != "undefined") {
        graph["origin"] = this.encodeVariable(this.origin);
    }
    
    if(UTIL.len(this.instances)>0) {
        graph["instances"] = {};
        UTIL.every(this.instances, function(instance) {
            graph["instances"][instance[0]] = instance[1][1];
        });
    }
    
    return JSON.encode(graph);
}

Encoder.prototype.encodeVariable = function(variable, objectDepth, arrayDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    
    if(variable===null) {
        var ret = {"type": "constant", "constant": "null"};
        if(this.options["includeLanguageMeta"]) {
            ret["fc.lang.type"] = "null";
        }
        return ret;
    } else
    if(variable===true || variable===false) {
        var ret = {"type": "constant", "constant": (variable===true)?"true":"false"};
        if(this.options["includeLanguageMeta"]) {
            ret["fc.lang.type"] = "boolean";
        }
        return ret;
    }
    var type = typeof variable;
    if(type=="number") {
        var ret = {"type": "text", "text": variable};
        if(this.options["includeLanguageMeta"]) {
            ret["fc.lang.type"] = "number";
        }
        return ret;
    } else
    if(type=="string") {
        var ret = {"type": "text", "text": variable};
        if(this.options["includeLanguageMeta"]) {
            ret["fc.lang.type"] = "string";
        }
        return ret;
    } else
    if(type=="object") {
        if(UTIL.isArrayLike(variable)) {
            return {
                "type": "array",
                "array": this.encodeArray(variable, objectDepth, arrayDepth)
            };
        } else {
            return {
                "type": "reference",
                "reference": this.encodeInstance(variable, objectDepth, arrayDepth)
            };
        }
    }

    return "["+(typeof variable)+"]["+variable+"]";    
}

Encoder.prototype.encodeArray = function(variable, objectDepth, arrayDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    if(arrayDepth > this.options["maxArrayDepth"]) {
        return {"notice": "Max Array Depth (" + this.options["maxArrayDepth"] + ")"};
    }
    var self = this,
        items = [];
    UTIL.forEach(variable, function(item) {
        items.push(self.encodeVariable(item, 1, arrayDepth + 1));
    });
    return items;
}

Encoder.prototype.getInstanceId = function(object) {
    for( var key in this.instances ) {
        if(this.instances[key][0]===object) {
            return key;
        }
    }
    return null;
}

Encoder.prototype.encodeInstance = function(object, objectDepth, arrayDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    var id = this.getInstanceId(object);
    if(id!=null) {
        return id;
    }
    id = UTIL.len(this.instances);
    this.instances[id] = [
        object,
        this.encodeObject(object, objectDepth, arrayDepth)
    ];
    return id;
}

Encoder.prototype.encodeObject = function(object, objectDepth, arrayDepth) {
    objectDepth = objectDepth || 1;
    arrayDepth = arrayDepth || 1;
    
    if(arrayDepth > this.options["maxObjectDepth"]) {
        return {"notice": "Max Object Depth (" + this.options["maxObjectDepth"] + ")"};
    }
    
    var self = this,
        ret = {"type": "dictionary", "dictionary": {}};
    
    UTIL.every(object, function(item) {
        if(item[0]=="__fc_tpl_id") {
            ret['fc.tpl.id'] = item[1];
            return;
        }
        ret["dictionary"][item[0]] = self.encodeVariable(item[1], objectDepth + 1, 1);
    });
    
    return ret;
}