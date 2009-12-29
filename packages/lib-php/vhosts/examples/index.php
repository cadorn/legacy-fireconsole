<?php

// locate modular-php package to bootstrap program
$path = DIRECTORY_SEPARATOR.implode(array('using','github.com','cadorn','modular-php','raw','master','core','lib','ModularPHP','Bootstrap.php'),DIRECTORY_SEPARATOR);
if(!file_exists(($file = dirname(dirname(dirname(__FILE__)))).$path) && !file_exists(($file = dirname(dirname($file))).$path)) {
    throw new Exception("Could not locate ModularPHP Core package!");
}
require_once($file.$path);
ModularPHP_Bootstrap::Program($file, 'lib-php');


// HACK: Remove this once PHPUnit is packaged
set_include_path(
    '/pinf/pear/PEAR' . 
    PATH_SEPARATOR . 
    get_include_path()
);


// initialize and run PHPGI wrapper and app

mp_require('PHPGI/Wrapper', 'modular-php-phpgi');
mp_require('PHPGI/App', 'modular-php-phpgi');

class app extends PHPGI_App
{
    public function run($env)
    {
        $paths = PHPGI_Wrapper::GetHelper('PathInfoToPaths')->help($env, array('base.path'=>dirname(dirname(dirname(__FILE__))).DIRECTORY_SEPARATOR.'examples'));
        if(!file_exists($paths['php'])) {
            return array('status' => 403);
        } else {
            $response = array('status'=> 200);
            ob_start();
            $app = null;
            include($paths['php']);
            if($app!==null) {
                return $app->run($env);
            } else {
                $response['body'] = ob_get_clean();
            }
            return $response;
        }
    }
}

$wrapper = new PHPGI_Wrapper();
$wrapper->setApp(
    PHPGI_Wrapper::GetMiddleware('ShowStatus')->app(
        new app()
    )
);
$wrapper->run();
