<?php

if(!class_exists('ModularPHP_Bootstrap')) {
    // locate modular-php package to bootstrap program
    $path = DIRECTORY_SEPARATOR.implode(array('using','github.com','cadorn','modular-php','raw','master','core','lib','ModularPHP','Bootstrap.php'),DIRECTORY_SEPARATOR);
    if(!file_exists(($file = dirname(dirname(__FILE__))).$path) && !file_exists(($file = dirname(dirname($file))).$path)) {
        throw new Exception("Could not locate ModularPHP Core package!");
    }
    require_once($file.$path);
    ModularPHP_Bootstrap::Program($file, 'lib-php');
}


require_once 'PHPUnit/Framework.php';
require_once 'FireConsole/Dispatcher.php';

abstract class ObjectGraphTestCase extends PHPUnit_Framework_TestCase {
    
    const DEBUG = false;
    
    var $testFile = null;
    
    private $disptacher = null;    
    private $channel = null;
    private $channelName = 'Test';
    private $channelFlushing = false;
    
    private $resultInfo = null;
    
    
    public function setChannelName($name)
    {
        $this->channelName = $name;
    }
    
    public function setChannelFlushing($oo)
    {
        $this->channelFlushing = $oo;
    }
    
    public function setUp()
    {
        $this->dispatcher = new FireConsole_Dispatcher();
        $this->channel = $this->dispatcher->setChannel($this->channelName);
    }    
    
    public function tearDown()
    {
        $info = $this->getTestResultInfo();
        
        $messages = $this->channel->getOutgoing();

        if(!self::DEBUG) {
            $this->assertEquals(sizeof($messages), sizeof($info[$this->getName()]), 'number of messages');        
        }
        
        for( $i=0 ; $i<sizeof($messages) ; $i++ ) {
            $data = $messages[$i]->getData();
            
            if(self::DEBUG) {
                print('Comparison #'.$i.':'."\n");
                print('     Got: '. $messages[$i]->getData()."\n");
                print('  Expect: '. $info[$this->getName()][$i]."\n");
            }
            
            $this->assertEquals(
                $messages[$i]->getData(),
                $info[$this->getName()][$i]
            );
        }
        
        if($this->channelFlushing) {
            $this->channel->flush();
        }
    }    
    
    
    private function getTestResultInfo()
    {
        if($this->resultInfo) {
            return $this->resultInfo;
        }
        
        $file = substr($this->testFile, 0, -3) . 'txt';
        if(!file_exists($file)) {
            throw new Exception('Test comparion file not found at: ' . $file);
        }
        
        $contents = file_get_contents($file);
        if(!preg_match_all('/[$|\n](\w*)\(\):\s*\n(.*?)\nbreak;/si', $contents, $m)) {
            throw new Exception('Could not parse test file: ' . $file);
        }
        
        $this->resultInfo = array();
        for( $i=0 ; $i<sizeof($m[1]) ; $i++ ) {
            $parts = explode("\n", trim($m[2][$i]));
            for( $j=0 ; $j<sizeof($parts) ; $j++ ) {
                $parts[$j] = trim($parts[$j]);
            }
            $this->resultInfo[$m[1][$i]] = $parts;
        }
        return $this->resultInfo;
    }
    
}
