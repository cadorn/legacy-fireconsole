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
require_once 'Wildfire/Channel/HttpHeader.php';

abstract class ObjectGraphTestCase extends PHPUnit_Framework_TestCase {
    
    const DEBUG = false;
    
    var $testFile = null;
    
    private $disptacher = null;    
    private $channel = null;
    private $channelName = null;
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
    
    public function getChannel()
    {
        return $this->channel;
    }
    
    public function setUp()
    {
        $this->dispatcher = new FireConsole_Dispatcher();
        $this->channel = $this->dispatcher->setChannel(
            ($this->channelName!==null)?
                $this->channelName
                : new ObjectGraphTestCase__Channel());
    }    
    
    public function tearDown()
    {
        $info = $this->getTestResultInfo();

        $messages = $this->channel->getOutgoing();

        if(!self::DEBUG) {
            $this->assertEquals(sizeof($messages), sizeof($info[$this->getName()]['messages']), 'number of messages');        
        }
        
        for( $i=0 ; $i<sizeof($messages) ; $i++ ) {
            if(self::DEBUG) {
                print('Comparison #'.$i.':'."\n");
                print('     Got: '. $messages[$i]->getData()."\n");
                print('  Expect: '. $info[$this->getName()]['messages'][$i]."\n");
            }
            
            $this->assertEquals(
                $messages[$i]->getData(),
                $info[$this->getName()]['messages'][$i]
            );
        }
        
        $this->channel->flush();
        
        // Only verify headers if our test channel is being used
        if(false && $this->channel instanceof ObjectGraphTestCase__Channel) {
        
            $headers = $this->channel->getHeaders();
            
            if(self::DEBUG) {
                foreach( $headers as $header ) {
                    print($header . "\n");
                }
            }
            
            if(!self::DEBUG) {
                $this->assertEquals(sizeof($headers), sizeof($info[$this->getName()]['headers']), 'number of headers');        
            }
            
            for( $i=0 ; $i<sizeof($headers) ; $i++ ) {
                if(self::DEBUG) {
                    print('Comparison #'.$i.':'."\n");
                    print('     Got: '. $headers[$i]."\n");
                    print('  Expect: '. $info[$this->getName()]['headers'][$i]."\n");
                }
                
                $this->assertEquals(
                    $headers[$i],
                    $info[$this->getName()]['headers'][$i]
                );
            }
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
        if(!preg_match_all('/[$|\n](\w*)\(\)\[([^\]]*)\]:\s*\n(.*?)\nbreak;/si', $contents, $m)) {
            throw new Exception('Could not parse test file: ' . $file);
        }

        $this->resultInfo = array();
        for( $i=0 ; $i<sizeof($m[1]) ; $i++ ) {
            $parts = explode("\n", trim($m[3][$i]));
            for( $j=0 ; $j<sizeof($parts) ; $j++ ) {
                $parts[$j] = trim($parts[$j]);
            }
            if(!isset($this->resultInfo[$m[1][$i]])) {
                $this->resultInfo[$m[1][$i]] = array();
            }
            $this->resultInfo[$m[1][$i]][$m[2][$i]] = $parts;
        }
        return $this->resultInfo;
    }
    
}

class ObjectGraphTestCase__Channel extends Wildfire_Channel_HttpHeader {
    
    private $headers = array();
       
    public function setHeader($name, $value) {
        $this->headers[$name] = $value;
    }
    public function getHeaders() {
        $headers = array();
        foreach( $this->headers as $name => $value ) {
            $headers[] = json_encode(array($name, $value));
        }
        return $headers;
    }
}
