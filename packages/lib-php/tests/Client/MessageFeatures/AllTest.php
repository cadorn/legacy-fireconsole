<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Client_MessageFeatures_AllTest extends ObjectGraphTestCase
{
    var $testFile = __FILE__;

    public function testPriorities()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send('Hello Log', array(
            'fc.msg.priority' => 'log'
        ));

        $this->dispatcher->send('Hello Info', array(
            'fc.msg.priority' => 'info'
        ));

        $this->dispatcher->send('Hello Warn', array(
            'fc.msg.priority' => 'warn'
        ));

        $this->dispatcher->send('Hello Error', array(
            'fc.msg.priority' => 'error'
        ));
    }
    
    public function testDebug()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(array('key1' => 10), array(
            'fc.tpl.debug' => true
        ));
    }
}
