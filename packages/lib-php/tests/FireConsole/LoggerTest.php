<?php

require_once dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR . 'TestHelper.php';
require_once 'PHPUnit/Framework.php';

require_once 'FireConsole/Dispatcher.php';
 

class FireConsole_LoggerTest extends PHPUnit_Framework_TestCase
{
    public function testTable()
    {
        $dispatcher = new FireConsole_Dispatcher();
                
        $channel = $dispatcher->getChannel();

        $var = array(
            'This is the table summary',
            array(
                array('Column 1', 'Column 2'),
                array('Hello World', new FireConsole_LoggerTest__TestObject())
            )
        );
        $dispatcher->send($var, array(
            'fc.tpl.id' => 'structures/table'
        ));

        $messages = $channel->getOutgoing();

        $this->assertEquals('179||{"action":"require","info":{"catalog":"http:\/\/registry.pinf.org\/cadorn.org\/github\/fireconsole-template-packs\/packages\/catalog.json","name":"lang-php","revision":"master"}}|', $messages[0][0][3]);
        $this->assertEquals((800+strlen(str_replace('/','\\/', __FILE__))).'|{"fc.tpl.id":"structures\/table","fc.lang.id":"registry.pinf.org\/cadorn.org\/github\/fireconsole-template-packs\/packages\/lang-php"}|{"origin":{"type":"array","array":[{"type":"text","text":"This is the table summary","fc.lang.type":"string"},{"type":"array","array":[{"type":"array","array":[{"type":"text","text":"Column 1","fc.lang.type":"string"},{"type":"text","text":"Column 2","fc.lang.type":"string"}]},{"type":"array","array":[{"type":"text","text":"Hello World","fc.lang.type":"string"},{"type":"reference","reference":0}]}]}]},"instances":[{"type":"dictionary","fc.lang.class":"FireConsole_LoggerTest__TestObject","fc.lang.file":"' . str_replace('/','\\/', __FILE__) . '","fc.tpl.id":"examples\/simple-object","dictionary":{"testVar":{"type":"text","text":"Test Value","fc.lang.type":"string","fc.lang.visibility":"public"}}}]}|', $messages[1][0][3]);
    }
}


class FireConsole_LoggerTest__TestObject
{
    public $__fc_tpl_id = "examples/simple-object";
    public $testVar = 'Test Value';
}




/* @see testTable()

{
    "origin": {
        "type": "array",
        "array": [
            {
                "type": "string",
                "value": "This is the table summary"
            },
            {
                "type": "array",
                "array": [
                    {
                        "type": "array",
                        "array": [
                            {
                                "type": "string",
                                "value": "Column 1"
                            },
                            {
                                "type": "string",
                                "value": "Column 2"
                            }
                        ]
                    },
                    {
                        "type": "array",
                        "array": [
                            {
                                "type": "string",
                                "value": "Hello World"
                            },
                            {
                                "type": "object",
                                "instance": 0
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "instances": [
        {
            "class": "FireConsole_LoggerTest__TestObject",
            "file": "...\/fireconsole\/packages\/lib-php\/tests\/FireConsole\/LoggerTest.php",
            "fc.tpl.id": "examples\/simple-object",
            "members": [
                {
                    "name": "testVar",
                    "visibility": "public",
                    "value": {
                        "type": "string",
                        "value": "Test Value"
                    }
                }
            ]
        }
    ]
}
*/

