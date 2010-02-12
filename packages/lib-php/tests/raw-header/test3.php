<?php

// Protocol not first header and complete random order for other headers

header('x-wf-1-1-1-5: 53||{"origin":{"type":"text","text":"Resource id #460"}}|');
header('x-wf-1-index: 5');
header('X-Wf-1-1-1-3: 41||{"origin":{"type":"text","text":"10.5"}}|');
header('X-Wf-1-1-1-1: 48||{"origin":{"type":"text","text":"Hello World"}}|');
header('x-wf-1-1-1-sender: ttp://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.2.0');
header('X-Wf-1-1-1-2: 38||{"origin":{"type":"text","text":"1"}}|');
header('X-Wf-Protocol-1: http://registry.pinf.org/cadorn.org/github/wildfire/@meta/protocol/component/0.1.0');
header('x-wf-1-1-receiver: http://registry.pinf.org/cadorn.org/github/fireconsole/@meta/receiver/console/0.1.0');
header('X-Wf-1-1-1-4: 39||{"origin":{"type":"text","text":"51"}}|');
