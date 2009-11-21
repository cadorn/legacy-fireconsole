<?php

class app_test_Suites extends PHPGI_App
{
    public function run($env)
    {
        $dir = dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR .
               'tests' . DIRECTORY_SEPARATOR .
               'Client';
        
        $suites = array();        
        foreach( new DirectoryIterator($dir) as $groupDir ) {
            if(!$groupDir->isDor && $groupDir->isDir()) {
                
                $suite = array(
                    'name' => $groupDir->getBasename(),
                    'url' => 'http://github.com/cadorn/fireconsole/tree/master/packages/lib-php/tests/Client/' .
                             $groupDir->getBasename() . '/',
                    'tests' => array()
                );
                
                foreach( new DirectoryIterator($groupDir->getPathname()) as $testFile ) {
                    if(!$testFile->isDot() && $testFile->isFile()) {
                        $file = $testFile->getPathname();
                        if(substr($file, -8, 8)=='Test.php') {
                            $suite['tests'][] = array(
                                'name' => substr(basename($file), 0, -8),
                                'url' => 'http://github.com/cadorn/fireconsole/tree/master/packages/lib-php/tests/Client/' .
                                         $groupDir->getBasename() . '/' . $testFile->getBasename()
                            );
                        }
                    }
                }
                
                $suites[] = $suite;
            }
        }
        
        return array('status'=> 200, 'body'=> $suites);
    }
}

$app = PHPGI_Wrapper::getMiddleware('Json')->app(new app_test_Suites());
