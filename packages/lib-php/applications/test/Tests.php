<?php

class app_test_Tests extends PHPGI_App
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
        
        $tests = array();        
        foreach( new DirectoryIterator($dir) as $groupDir ) {
            if(!$groupDir->isDor && $groupDir->isDir()) {
                foreach( new DirectoryIterator($groupDir->getPathname()) as $testFile ) {
                    if(!$testFile->isDot() && $testFile->isFile()) {

                        $file = $testFile->getPathname();

                        if(substr(basename($file), -8, 8)=='Test.php' && $groupDir->getBasename().'/'.substr(basename($file), 0, -8)==$qs['suite']) {
        
                            require($file);
        
                            $class = 'Client_' . str_replace('/','_', $qs['suite']) . 'Test';
                            
                            $reflectionClass = new ReflectionClass($class);
                            foreach( $reflectionClass->getMethods() as $method ) {
                                if(substr($method->getName(),0,4)=='test') {
                                    $tests[] = array(
                                        'name' => $method->getName(),
                                        'suite' => $groupDir->getBasename() . '/' . substr(basename($file), 0, -8)
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return array('status'=> 200, 'body'=> $tests);
    }
}

$app = PHPGI_Wrapper::getMiddleware('Json')->app(new app_test_Tests());
