<?php

require_once(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'common.inc.php');

require_once 'FireConsole/Dispatcher.php';


// instanciate a dispatcher
$dispatcher = new FireConsole_Dispatcher();



// log message with file and line info
$dispatcher->send('Hello World', array(
    'fc.msg.file' => '.../' . basename(__FILE__),
    'fc.msg.line' => __LINE__
));

// labelled message
$dispatcher->send('Hello World', array(
    'fc.msg.label' => 'Say'
));

// raised priority messages
$dispatcher->send('Info Message', array(
    'fc.msg.priority' => 'info'
));
$dispatcher->send('Warning Message', array(
    'fc.msg.priority' => 'warn'
));
$dispatcher->send('Error Message', array(
    'fc.msg.priority' => 'error'
));

// message groups
$dispatcher->send('Group 1 Label', array(
    'fc.group.start' => true
));
    $dispatcher->send('Hello World');
    $dispatcher->send('Group 2 Label', array(
        'fc.group.start' => true,
        'fc.group.collapsed' => true,
        'fc.group.color' => 'magenta'
    ));
        $dispatcher->send('Hello World');
    $dispatcher->send('', array(
        'fc.group.end' => true
    ));
$dispatcher->send('', array(
    'fc.group.end' => true
));




// flush the channel to send the headers
$dispatcher->getChannel()->flush();

?>

<p>Open firebug and check the <i>Console</i> panel.</p>
