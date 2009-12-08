<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Client_TemplatePack_AllTest extends ObjectGraphTestCase
{
    var $testFile = __FILE__;

    
    private function _registerRemotePack()
    {
        $this->dispatcher->registerTemplatePack(array(
            "project.url" => "http://github.com/cadorn/fireconsole/tree/master",
            "source.url" => "http://github.com/cadorn/fireconsole/tree/master/packages/test-template-pack",
            "descriptor" => array(
                "location" => "http://github.com/cadorn/fireconsole/zipball/master/",
                "path" => "packages/test-template-pack"
            )
        ));
    }


    public function testRemotePack()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);
        
        $this->_registerRemotePack();

        $this->dispatcher->send('Hello World', array(
            "fc.tpl.id" => "github.com/cadorn/fireconsole/zipball/master/packages/test-template-pack#helloworld"
        ));
    }


    public function testReload()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->_registerRemotePack();

        $this->dispatcher->send('Hello World', array(
            "fc.tpl.id" => "github.com/cadorn/fireconsole/zipball/master/packages/test-template-pack#helloworld",
            "fc.tpl.reload" => true
        ));
    }


    public function testLocalPack()
    {
        // Only run this test if accessed via local browser on local server
        if(!isset($_SERVER["SERVER_ADDR"]) || !isset($_SERVER["REMOTE_ADDR"]) ||
           $_SERVER["SERVER_ADDR"] != $_SERVER["REMOTE_ADDR"]) {
            return;
        }
        
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);
        
        $id = realpath(dirname(dirname(dirname(dirname(dirname(__FILE__))))).DIRECTORY_SEPARATOR.'test-template-pack'.DIRECTORY_SEPARATOR);
        
        $this->dispatcher->registerTemplatePack(array(
            "project.url" => "http://github.com/cadorn/fireconsole/tree/master",
            "source.url" => "http://github.com/cadorn/fireconsole/tree/master/packages/test-template-pack",
            "descriptor" => array(
                "location" => "file://" . $id
            )
        ));

        $this->dispatcher->send('Hello World', array(
            "fc.tpl.id" => substr($id, strpos($id, DIRECTORY_SEPARATOR)+1) . "#helloworld"
        ));
    }


    public function testNodeTemplate()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->_registerRemotePack();

        $this->dispatcher->sendRaw(json_encode(json_decode('{
                "origin": {
                    "type": "text",
                    "text": "World",
                    "fc.tpl.id": "github.com/cadorn/fireconsole/zipball/master/packages/test-template-pack#world"
                }
            }',true)), json_encode(array(
            "fc.tpl.id" => "github.com/cadorn/fireconsole/zipball/master/packages/test-template-pack#hello"
        )));

        $this->dispatcher->sendRaw(json_encode(json_decode('{
                "origin": {
                    "type": "array",
                    "array": [
                        {
                            "type": "text",
                            "text": "Key"
                        },
                        {
                            "type": "text",
                            "text": "Hello",
                            "fc.tpl.id": "github.com/cadorn/fireconsole/zipball/master/packages/test-template-pack#world"
                        }
                    ]
                }
            }',true)));
    }
}
