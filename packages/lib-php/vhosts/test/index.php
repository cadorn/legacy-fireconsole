<?php

// HACK: Until PHP platform hooks are working properly
set_include_path("/Users/cadorn/pinf/workspaces/github.com/cadorn/modular-php/packages/core/lib" . PATH_SEPARATOR . get_include_path());
require_once("ModularPHP/Bootstrap.php");




ModularPHP_Bootstrap::Program("/Users/cadorn/pinf/builds/registry.pinf.org/cadorn.org/github/fireconsole/packages/lib-php/master/raw", 'lib-php',
array(
    "system" => array(
        array("path" => "/Users/cadorn/pinf/workspaces/github.com/cadorn/modular-php-packages/packages/phpunit",
              "locator" => array(
                "catalog" => "http://registry.pinf.org/cadorn.org/github/modular-php-packages/packages/catalog.json",
                "name" => "phpunit",
                "revision" => "naster"
              ))
    )
)
);

// initialize and run PHPGI wrapper and app

mp_require('PHPGI/Wrapper');
mp_require('PHPGI/App');

class app extends PHPGI_App
{
    public function run($env)
    {
        $paths = PHPGI_Wrapper::GetHelper('PathInfoToPaths')->help($env, array('base.path'=>dirname(dirname(dirname(__FILE__))).DIRECTORY_SEPARATOR.'applications'.DIRECTORY_SEPARATOR.'test'));
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
