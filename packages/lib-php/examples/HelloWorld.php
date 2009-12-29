<?php

require_once 'FireConsole/Dispatcher.php';

$dispatcher = new FireConsole_Dispatcher();

$dispatcher->send('Hello World', array(
    'fc.msg.file' => '.../' . basename(__FILE__),
    'fc.msg.line' => __LINE__
));

$dispatcher->getChannel()->flush();

?>

<p>Open firebug and check the <i>Console</i> panel.</p>
