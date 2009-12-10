
var TEMPLATE = require("template", "template-pack");
var template = exports.template = TEMPLATE.Template(module);

template.onLoad = function(pack, tags){with(tags) {

    return {

        className: pack.__KEY__+"ConsoleOpenMessageGroup",
        _appender: "appendOpenGroup",
            
        tag: SPAN({"class": pack.__KEY__+"ConsoleOpenMessageGroup"}, "$objects.url")

    }
}};
