<?php

require_once(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'common.inc.php');

require_once 'FireConsole/Dispatcher.php';


// instanciate a dispatcher
$dispatcher = new FireConsole_Dispatcher();


// register a custom LOCAL template pack (requires template pack to be present at given path on user's computer)
// local template packs are used primarily while developing the template pack
$id = realpath(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'CustomTemplates');
$dispatcher->registerTemplatePack(array(
    "location" => "file://" . $id
));
// prepare the ID for further use below
$id = preg_replace('/\\\+/i', '/', $id);              // windows
if(preg_match_all('/^(\w):(\/\w.*)/s', $id, $m)) {    // windows
    $id = $m[1][0] . $m[2][0];
} else {
    $id = substr($id, 1);
}

// render messages using the "console" template defined in ./CustomTemplates/lib/console.js
$dispatcher->send('This text is being rendered by the "console" template!', array(
    "fc.tpl.id" => $id . "#console"
//    "fc.tpl.reload" => true     // reload template every time (use only during template development)
));
$dispatcher->send(array("Hello", "World", "number", 10), array(
    "fc.tpl.id" => $id . "#console"
));


// render an object using the "object" template defined in ./CustomTemplates/lib/object.js
// we also use the "custom" template for the message
class TestObject {
    public $__fc_tpl_id = null;  // we set this below as we are not using a string literal
    protected $say = "This is the test object!";
}
$obj = new TestObject();
$obj->__fc_tpl_id = $id . "#object";
$dispatcher->send($obj, array(
    "fc.tpl.id" => $id . "#console"
));



// flush the channel to send the headers
$dispatcher->getChannel()->flush();

?>

<p>Open firebug and check the <i>Console</i> panel.</p>
