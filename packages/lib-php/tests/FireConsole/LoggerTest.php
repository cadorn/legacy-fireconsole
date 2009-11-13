<?php

require_once dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR . 'TestHelper.php';
require_once 'PHPUnit/Framework.php';

require_once 'FireConsole/Dispatcher.php';
 
class FireConsole_LoggerTest extends PHPUnit_Framework_TestCase
{
    public function testTable()
    {
        $dispatcher = new FireConsole_Dispatcher();
        
        $channel = new FireConsole_LoggerTest__Channel();
        $messageFactory = new FireConsole_LoggerTest__MessageFactory();
        
        $dispatcher->setChannel($channel);
        $dispatcher->setMessageFactory($messageFactory);

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
            $data = json_encode($data);
            $this->assertEquals($data, '{"origin":{"type":"array","array":[{"type":"string","value":"This is the table summary"},{"type":"array","array":[{"type":"array","array":[{"type":"string","value":"Column 1"},{"type":"string","value":"Column 2"}]},{"type":"array","array":[{"type":"string","value":"Hello World"},{"type":"object","instance":0}]}]}]},"instances":[{"class":"FireConsole_LoggerTest__TestObject","file":"' . str_replace('/','\\/', __FILE__) . '","fc.tpl.id":"examples\/simple-object","members":[{"name":"testVar","visibility":"public","value":{"type":"string","value":"Test Value"}}]}]}');
        }
    }
}


class FireConsole_LoggerTest__TestObject
{
    public $__fc_tpl_id = "examples/simple-object";
    public $testVar = 'Test Value';
}

class FireConsole_LoggerTest__MessageFactory
{
    public function newMessage($meta)
    {
        return new FireConsole_LoggerTest__Message();
    }
}

// TODO: Use the Wildfire classes and interfaces here once the modular-php project is up and running
// @see http://github.com/cadorn/wildfire/tree/master/packages/lib-php/lib/Wildfire/
class FireConsole_LoggerTest__Channel
{
    private $outgoingQueue = array();
    public function enqueueOutgoing($message)
    {
        $this->outgoingQueue[] = $message;
    }
    public function getOutgoing()
    {
        return $this->outgoingQueue;
    }
}
class FireConsole_LoggerTest__Message
{
    private $data = null;
    private $meta = null;
    public function setData($data)
    {
        $this->data = $data;
    }   
    public function getData()
    {
        return $this->data;
    }
    public function setMeta($meta)
    {
        $this->meta = $meta;
    }   
    public function getMeta()
    {
        return $this->meta;
    }
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

