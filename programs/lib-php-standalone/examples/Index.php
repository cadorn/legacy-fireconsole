<?php

foreach( new DirectoryIterator(dirname(__FILE__)) as $item ) {

    if(!$item->isDot() && $item->isFile() &&
       $item->getFilename()!='Index.php' &&
       $item->getFilename()!='common.inc.php' &&
       substr($item->getFilename(),0,5)!='.tmp_') {

        print('<p><a href="' . $item->getFilename() . '">' . $item->getFilename() . '</a></p>');        
    }
}
