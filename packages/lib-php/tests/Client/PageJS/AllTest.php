<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Client_PageJS_AllTest extends ObjectGraphTestCase
{
    
    public static $mode = "js";
    

    public function testFirebugLog()
    {
        $this->addMessage('console.log("Hello Log");');
        $this->addMessage('console.info("Hello Info");');
        $this->addMessage('console.warn("Hello Warning");');
        $this->addMessage('console.error("Hello Error");');
    }
    
    public function testTemplatePack()
    {
        $this->addMessage('
            top.FireConsoleAPI.registerTemplatePack({
                "project.url": "http://github.com/cadorn/fireconsole/tree/master",
                "source.url": "http://github.com/cadorn/fireconsole/tree/master/packages/test-template-pack",
                "descriptor": {
                    "location": "http://github.com/cadorn/fireconsole/zipball/master/",
                    "path": "packages/test-template-pack"
                }
            });
        ');
        $this->addMessage('
            console.log({
                "__fc_tpl_id": "github.com/cadorn/fireconsole/zipball/master/packages/test-template-pack#say",
                "say": "Hello World"
            });    
        ');
    }
    
}
