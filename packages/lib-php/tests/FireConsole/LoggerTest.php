<?php

require_once dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR . 'TestHelper.php';
require_once 'PHPUnit/Framework.php';

require_once 'FireConsole/Dispatcher.php';
 

class FireConsole_LoggerTest extends PHPUnit_Framework_TestCase
{
    public function testTable()
    {
        $dispatcher = new FireConsole_Dispatcher();
                
        $channel = $dispatcher->setChannel('Test');

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
        foreach( $messages as $message ) {
            $data = $message->getData();
            $this->assertEquals($data, '{"origin":{"type":"array","array":[{"type":"string","string":"This is the table summary"},{"type":"array","array":[{"type":"array","array":[{"type":"string","string":"Column 1"},{"type":"string","string":"Column 2"}]},{"type":"array","array":[{"type":"string","string":"Hello World"},{"type":"object","instance":0}]}]}]},"instances":[{"class":"FireConsole_LoggerTest__TestObject","file":"' . str_replace('/','\\/', __FILE__) . '","fc.tpl.id":"examples\/simple-object","members":[{"name":"testVar","visibility":"public","value":{"type":"string","string":"Test Value"}}]}]}');
        }
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
            "file": "\/pinf\/packages-birth\/PINF\/OpenSource\/org.cadorn.github\/packages\/fireconsole\/packages\/lib-php\/tests\/FireConsole\/LoggerTest.php",
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

