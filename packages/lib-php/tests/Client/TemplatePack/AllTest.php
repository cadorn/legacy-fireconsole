<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Client_TemplatePack_AllTest extends ObjectGraphTestCase
{
    var $testFile = __FILE__;

    public function testCustomPack()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);
        
        $this->dispatcher->registerTemplatePack(array(
            "project.url" => "http://github.com/cadorn/fireconsole/tree/master",
            "source.url" => "http://github.com/cadorn/fireconsole/tree/master/packages/test-template-pack",
            "download.archive.url" => "http://github.com/cadorn/fireconsole/zipball/master/",
            "download.archive.path" => "packages/test-template-pack"
        ));

        $this->dispatcher->send('Hello World', array(
            "fc.tpl.id" => "tpl-ID"
        ));
    }
}
