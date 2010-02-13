<?php

// ensure our lib directory is on the include path, if not we add it

$libPath = dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR . "lib";

$includePath = explode(PATH_SEPARATOR, get_include_path());
if(!in_array($libPath, $includePath)) {
    array_push($includePath, $libPath);
    set_include_path(implode(PATH_SEPARATOR, $includePath));
}
