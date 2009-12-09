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

    public function testLabel()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send('Hello World', array(
            'fc.msg.label' => 'Label'
        ));
    }

    public function testFileLineInfo()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send('File only', array(
            'fc.msg.file' => '/path/to/file'
        ));

        $this->dispatcher->send('Line only', array(
            'fc.msg.line' => '10'
        ));

        $this->dispatcher->send('File and line', array(
            'fc.msg.file' => '/path/to/file',
            'fc.msg.line' => '10'
        ));
    }

    public function testGrouping()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send('Group 1 Label', array(
            'fc.group.start' => true
        ));

            $this->dispatcher->send('Hello World');
    
            $this->dispatcher->send('Group 2 Label', array(
                'fc.group.start' => true,
                'fc.group.color' => 'magenta'
            ));

                $this->dispatcher->send('Hello World');
    
            $this->dispatcher->send('', array(
                'fc.group.end' => true
            ));

        $this->dispatcher->send('', array(
            'fc.group.end' => true
        ));

        $this->dispatcher->send('Hello World');
    }
}
