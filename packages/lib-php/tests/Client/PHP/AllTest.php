<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Client_PHP_AllTest extends ObjectGraphTestCase
{
    var $testFile = __FILE__;

    public function testBasic()
    {
        $this->dispatcher->send('Hello World'); // string
        $this->dispatcher->send(1);             // integer
        $this->dispatcher->send(10.5);          // float
        $this->dispatcher->send(0x33);          // float
        $this->dispatcher->send('Resource id #460');     // resource
    }
}
