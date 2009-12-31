
var ASSERT = require("assert");
var UTIL = require("util");

var ENCODER = require("encoder/default", "github.com/cadorn/fireconsole/raw/master/lib-js");

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

exports.testBasicVariables = function() {
    
    var tests = [
        [null, '{"origin":{"type":"constant","constant":"null","fc.lang.type":"null"}}'],
        [true, '{"origin":{"type":"constant","constant":"true","fc.lang.type":"boolean"}}'],
        [false, '{"origin":{"type":"constant","constant":"false","fc.lang.type":"boolean"}}'],
        ["a", '{"origin":{"type":"text","text":"a","fc.lang.type":"string"}}'],
        ["a\nb", '{"origin":{"type":"text","text":"a\\nb","fc.lang.type":"string"}}'],
        [100, '{"origin":{"type":"text","text":100,"fc.lang.type":"number"}}'],
        [10.5, '{"origin":{"type":"text","text":10.5,"fc.lang.type":"number"}}'],
        [0x33, '{"origin":{"type":"text","text":51,"fc.lang.type":"number"}}'],
        [["a", "b"], '{"origin":{"type":"array","array":[{"type":"text","text":"a","fc.lang.type":"string"},{"type":"text","text":"b","fc.lang.type":"string"}]}}'],
        [{"a":"b"}, '{"origin":{"type":"reference","reference":0},"instances":{"0":{"type":"dictionary","dictionary":{"a":{"type":"text","text":"b","fc.lang.type":"string"}}}}}']
    ];
    
    tests.forEach(function(test) {
 
        var encoder = ENCODER.Encoder();
        encoder.setOrigin(test[0]);
        var json = encoder.encode();

        if(!test[1]) {
            // NOTE: This is just to add tests. Leave the test pattern empty and it will print out result.
            dump(JSON.decode(json));
            print(json);
            ASSERT.fail("You need to add a test pattern!");
        } else {
            ASSERT.equal(json, test[1]);
        }
    });
}

if (require.main == module.id)
    require("os").exit(require("test").run(exports));

