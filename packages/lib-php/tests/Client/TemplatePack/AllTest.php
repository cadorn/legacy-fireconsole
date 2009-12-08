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
}
