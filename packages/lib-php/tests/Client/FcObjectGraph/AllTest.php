<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Client_FcObjectGraph_AllTest extends ObjectGraphTestCase
{
    var $testFile = __FILE__;
    
    public function testText()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send('Hello World'); // string
        $this->dispatcher->send(1);             // integer
        $this->dispatcher->send(10.5);          // float
        $this->dispatcher->send(0x33);          // float
        $this->dispatcher->send('Resource id #460');     // resource (resources get converted to strings so this work for testing)
    }

    public function testConstant()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(null);  // null
        $this->dispatcher->send(true);  // boolean
        $this->dispatcher->send(false); // boolean
    }

    public function testArray()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(array(1, 2));
        $this->dispatcher->send(array('1', 2));
        $this->dispatcher->send(array(1, '2'));
        $this->dispatcher->send(array('1', '2'));
        
        $this->dispatcher->send(array(1 => 2));
        $this->dispatcher->send(array('1' => 2));
        $this->dispatcher->send(array(1 => '2'));
        $this->dispatcher->send(array('1' => '2'));

        $this->dispatcher->send(array(1, '2'=>3));
        $this->dispatcher->send(array(1, '2'=>'3'));
        $this->dispatcher->send(array('1', 2=>3));
        $this->dispatcher->send(array('1', '2'=>3));
        $this->dispatcher->send(array('1', 2=>'3'));
        $this->dispatcher->send(array('1', '2'=>'3'));

        $this->dispatcher->send(array('1', '2'=>'3', array('4')));
    }

    public function testInstance()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(new Client_FcObjectGraph_AllTest__TestObject());
        $this->dispatcher->send(new Client_FcObjectGraph_AllTest__TestObject1());
    }
}

class Client_FcObjectGraph_AllTest__TestObject
{
}

class Client_FcObjectGraph_AllTest__TestObject1
{
    public $var1 = 'val1';
}
