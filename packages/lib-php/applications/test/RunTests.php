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

        $suite = new PHPUnit_Framework_TestSuite($class);
        $result = new PHPUnit_Framework_TestResult;
        $listener = new app_test_RunTest__TestListener();
        $result->addListener($listener);
        $suite->run($result);

        $response = array();
        
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
         
        $messages = $listener->getMessages();
        if($messages) {
            $response['messages'] = array();
            foreach($messages as $message ) {
                $response['messages'][] = array(
                    'meta' => json_decode($message->getMeta()),
                    'data' => json_decode($message->getData())
                );
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
        $channel = $test->getChannel();
        $messages = $channel->getOutgoing();
        if($messages) {
            foreach( $messages as $message ) {
                $this->messages[] = $message;
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