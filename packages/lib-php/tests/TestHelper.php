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

ob_start();

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
    
    private $messages = array();

    
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
        if(!$info) {
            return;
        }

        if(!isset($info[$this->getName()])) {
            $this->channel->flush();
            return;
        }

        $messages = $this->channel->getOutgoing();

        if(!self::DEBUG) {
            $this->assertEquals(sizeof($info[$this->getName()]['messages']), sizeof($messages), 'number of messages');        
        }
        
        for( $i=0 ; $i<sizeof($messages) ; $i++ ) {
            
            $msg = array();
            for( $j=0 ; $j<sizeof($messages[$i]) ; $j++ ) {
                $msg[] = $messages[$i][$j][3];
            }
            $msg = implode(" + ", $msg);
            
            if(self::DEBUG) {
                print('Comparison #'.$i.':'."\n");
                print('     Got: '. $msg ."\n");
                print('  Expect: '. $info[$this->getName()]['messages'][$i]."\n");
            }

            $this->assertEquals(
                $info[$this->getName()]['messages'][$i],
                $msg
            );
        }
        
        $this->channel->flush();
        
        // Only verify headers if our test channel is being used
        if($this->channel instanceof ObjectGraphTestCase__Channel) {
            
            if(isset($info[$this->getName()]['headers'])) {

                $headers = $this->channel->getMessageParts();

                if(self::DEBUG) {
                    foreach( $headers as $header ) {
                        print($header . "\n");
                    }
                }
                
                if(!self::DEBUG) {
                    $this->assertEquals(sizeof($info[$this->getName()]['headers']), sizeof($headers), 'number of headers');        
                }
                
                for( $i=0 ; $i<sizeof($headers) ; $i++ ) {
                    if(self::DEBUG) {
                        print('Comparison #'.$i.':'."\n");
                        print('     Got: '. $headers[$i]."\n");
                        print('  Expect: '. $info[$this->getName()]['headers'][$i]."\n");
                    }
                    
                    $this->assertEquals(
                        $info[$this->getName()]['headers'][$i],
                        $headers[$i]
                    );
                }
            }
        }
    }    
    
    
    private function getTestResultInfo()
    {
        if($this->resultInfo) {
            return $this->resultInfo;
        }
        
        if(!$this->testFile) {
            return null;
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
    
    public function addMessage($message) {
        $this->messages[] = $message;
    }
    public function getMessages() {
        return $this->messages;
    }
    
}

class ObjectGraphTestCase__Channel extends Wildfire_Channel_HttpHeader {
    
    private $parts = array();
       
    public function setMessagePart($key, $value) {
        $this->parts[$key] = $value;
    }
    public function getMessagePart($key) {
        if(!isset($this->parts[$key])) return false;
        return $this->parts[$key];
    }
    public function getMessageParts() {
        $parts = array();
        foreach( $this->parts as $key => $value ) {
            $parts[] = json_encode(array($key, $value));
        }
        return $parts;
    }
}
