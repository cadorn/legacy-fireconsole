<?php

class app_test_Info extends PHPGI_App
{
    public function run($env)
    {
        $libraryInfo = $this->getLibraryInfo();
        $wildfireInfo = $this->getWildfireInfo();
        
        $info = array();
        $info['loggingLibrary'] = array(
//            'uid' => $libraryInfo['uid']
            'url' => 'http://github.com/cadorn/fireconsole/tree/master/packages/lib-php/'
        );
        $info['wildfireLibrary'] = array(
//            'uid' => $libraryInfo['uid']
            'url' => 'http://github.com/cadorn/wildfire/tree/master/packages/lib-php/'
        );
        
        return array('status'=> 200, 'body'=> $info);
    }
    
    private function getLibraryInfo() {
        return json_decode(file_get_contents(dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'package.json'), true);
    }

    private function getWildfireInfo() {
        
        $dir = dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR;
        if(!file_exists($dir . 'using')) {
            $dir = dirname(dirname($dir)) . DIRECTORY_SEPARATOR;
        }

        return json_decode(file_get_contents($dir . 
                           'using' . DIRECTORY_SEPARATOR . 
                           'github.com' . DIRECTORY_SEPARATOR . 
                           'cadorn' . DIRECTORY_SEPARATOR . 
                           'wildfire' . DIRECTORY_SEPARATOR . 
                           'raw' . DIRECTORY_SEPARATOR . 
                           'master' . DIRECTORY_SEPARATOR . 
                           'lib-php' . DIRECTORY_SEPARATOR . 
                           'package.json'), true);
    }
}

$app = PHPGI_Wrapper::getMiddleware('Json')->app(new app_test_Info());
