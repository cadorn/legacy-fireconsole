<?php

class app_test_ListTests extends PHPGI_App
{
    public function run($env)
    {
        $dir = dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR .
               'tests' . DIRECTORY_SEPARATOR .
               'Client';
        
        $tests = array();        
        foreach( new DirectoryIterator($dir) as $groupDir ) {
            if(!$groupDir->isDor && $groupDir->isDir()) {
                foreach( new DirectoryIterator($groupDir->getPathname()) as $testFile ) {
                    if(!$testFile->isDot() && $testFile->isFile()) {
                        $file = $testFile->getPathname();
                        if(substr($file, -8, 8)=='Test.php') {
                            $tests[] = $groupDir->getBasename() . DIRECTORY_SEPARATOR . substr(basename($file), 0, -8);
                        }
                    }
                }
            }
        }
        
        return array('status'=> 200, 'body'=> $tests);
    }
}

$app = PHPGI_Wrapper::getMiddleware('Json')->app(new app_test_ListTests());
