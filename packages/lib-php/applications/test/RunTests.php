<?php

require_once('PHPUnit/Framework/TestListener.php');


class app_test_RunTests extends PHPGI_App
{
    public function run($env)
    {
        $qs = array();
        parse_str($env->get('QUERY_STRING'), $qs);
        if(!isset($qs['suite']) || strpos($qs['suite'], '.')!==false) {
            return array('status'=> 403);
        }
        
        $dir = dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR .
               'tests' . DIRECTORY_SEPARATOR .
               'Client';
        $file = $dir . DIRECTORY_SEPARATOR . $qs['suite'] . 'Test.php';
        if(!file_exists($file)) {
            return array('status'=> 403);
        }
        
        require($file);
        
        $class = 'Client_' . str_replace('/','_', $qs['suite']) . 'Test';

        $reflectionClass = new ReflectionClass($class);
        $mode = ($reflectionClass->hasProperty('mode'))?$reflectionClass->getStaticPropertyValue('mode'):'header';


        $listener = new app_test_RunTest__TestListener();

        if($qs['test']) {
            $suite = new $class();
            $suite->setName($qs['test']);
            $result = new PHPUnit_Framework_TestResult();
            $result->addListener($listener);
            $suite->run($result);
        } else {
            $suite = new PHPUnit_Framework_TestSuite($class);
            $result = new PHPUnit_Framework_TestResult();
            $result->addListener($listener);
            $suite->run($result);
        }

        $response = array();
        $response['type'] = $mode;
        
        $errors = $listener->getErrors();
        if($errors) {
            $response['errors'] = array();
            foreach( $errors as $error ) {
                $response['errors'][] = $error;
            }
        }
        
        $failures = $listener->getFailures();
        if($failures) {
            $response['failures'] = array();
            foreach( $failures as $failure ) {
                $response['failures'][] = $failure;
            }
        }

        if($mode=="js") {
            $messages = $listener->getMessages();
            if($messages) {
                $response['tests'] = array();
                foreach($messages as $message ) {
                    $response['tests'][] = $message;
                }
            }
        } else {
            $messages = $listener->getMessages();
            if($messages) {
                $response['messages'] = array();
                foreach($messages as $message ) {
                    $msg = array();
                    for( $i=0 ; $i<sizeof($message) ; $i++ ) {
                        $msg[] = $message[$i][3];
                    }
                    $response['messages'][] = $msg;
                }
            }
        }
        return array('status'=> 200, 'body'=> $response);
    }
}

$app = PHPGI_Wrapper::getMiddleware('Json')->app(new app_test_RunTests());



class app_test_RunTest__TestListener implements PHPUnit_Framework_TestListener
{
    private $errors = array();
    private $failures = array();
    private $messages = array();
    
    public function getErrors()
    {
        return $this->errors;
    }
    
    public function getFailures()
    {
        return $this->failures;
    }
    
    public function getMessages()
    {
        return $this->messages;
    }
    
    public function addError(PHPUnit_Framework_Test $test, Exception $e, $time)
    {
        $this->errors[] = array($e->getMessage(), $e->getFile(), $e->getLine());
    }
 
    public function addFailure(PHPUnit_Framework_Test $test, PHPUnit_Framework_AssertionFailedError $e, $time)
    {
        $this->failures[] = array($e->getMessage(), $e->getFile(), $e->getLine());
    }
 
    public function addIncompleteTest(PHPUnit_Framework_Test $test, Exception $e, $time)
    {
    }
    
    public function addSkippedTest(PHPUnit_Framework_Test $test, Exception $e, $time)
    {
    }
    
    public function startTest(PHPUnit_Framework_Test $test)
    {
        $test->setChannelName('HttpHeader');
        $test->setChannelFlushing(true);
    }
    
    public function endTest(PHPUnit_Framework_Test $test, $time)
    {
        $reflectionClass = new ReflectionClass(get_class($test));
        $mode = ($reflectionClass->hasProperty('mode'))?$reflectionClass->getStaticPropertyValue('mode'):'header';
        
        if($mode=='js') {
            $messages = $test->getMessages();
            if($messages) {
                foreach( $messages as $message ) {
                    $this->messages[] = $message;
                }
            }
        } else {
            $channel = $test->getChannel();
            $messages = $channel->getOutgoing();
            if($messages) {
                foreach( $messages as $message ) {
                    $this->messages[] = $message;
                }
            }
        }
    }
    
    public function startTestSuite(PHPUnit_Framework_TestSuite $suite)
    {
    }
    
    public function endTestSuite(PHPUnit_Framework_TestSuite $suite)
    {
    }
}