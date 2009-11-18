<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Client_Wildfire_AllTest extends ObjectGraphTestCase
{
    var $testFile = __FILE__;
    
    public function testSplitMessages()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);
        $this->dispatcher->getChannel()->setMessagePartMaxLength(10);

        $data = array();
        for( $i=0 ; $i<3 ; $i++ ) {
            $data[] = 'line ' . $i;
        }
        $this->dispatcher->send(implode($data, "\n"));
        $this->dispatcher->send(implode($data, "\n"));
    }

}
