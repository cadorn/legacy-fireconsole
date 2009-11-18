<?php

require_once('PHPUnit/Framework/TestListener.php');


class app_test_RunTest extends PHPGI_App
{
    public function run($env)
    {
        $qs = array();
        parse_str($env->get('QUERY_STRING'), $qs);
        if(!isset($qs['path']) || strpos($qs['path'], '.')!==false) {
            return array('status'=> 403);
        }
        
        $dir = dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR .
               'tests' . DIRECTORY_SEPARATOR .
               'Client';
        $file = $dir . DIRECTORY_SEPARATOR . $qs['path'] . 'Test.php';
        if(!file_exists($file)) {
            return array('status'=> 403);
        }
        
        require($file);
        
        $class = 'Client_' . str_replace('/','_', $qs['path']) . 'Test';

        $suite = new PHPUnit_Framework_TestSuite($class);
        $result = new PHPUnit_Framework_TestResult;
        $listener = new app_test_RunTest__TestListener();
        $result->addListener($listener);
        $suite->run($result);
        
        $errors = $listener->getErrors();
        if($errors) {
            foreach( $errors as $error ) {
                var_dump($error);
            }
        }
        
        $failures = $listener->getFailures();
        if($failures) {
            foreach( $failures as $failure ) {
                var_dump($failure);
            }
        }
        
        return array('status'=> 200, 'body'=> 'Ok');
    }
}

$app = PHPGI_Wrapper::getMiddleware('Json')->app(new app_test_RunTest());



class app_test_RunTest__TestListener implements PHPUnit_Framework_TestListener
{
    private $errors = array();
    private $failures = array();
    
    public function getErrors()
    {
        return $this->errors;
    }
    
    public function getFailures()
    {
        return $this->failures;
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
    }
    
    public function startTestSuite(PHPUnit_Framework_TestSuite $suite)
    {
    }
    
    public function endTestSuite(PHPUnit_Framework_TestSuite $suite)
    {
    }
}