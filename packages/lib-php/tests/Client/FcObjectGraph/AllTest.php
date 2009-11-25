<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

class Client_FcObjectGraph_AllTest extends ObjectGraphTestCase
{
    var $testFile = __FILE__;

    /**
     * @see http://github.com/cadorn/domplate-reps/blob/master/packages/fc-object-graph/lib/text.js
     */
    public function testText()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send('Hello World'); // string
        $this->dispatcher->send(1);             // integer
        $this->dispatcher->send(10.5);          // float
        $this->dispatcher->send(0x33);          // float
        $this->dispatcher->send('Resource id #460');     // resource (resources get converted to strings so this works for testing)
    }

    /**
     * @see http://github.com/cadorn/domplate-reps/blob/master/packages/fc-object-graph/lib/constant.js
     */
    public function testConstant()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(null);  // null
        $this->dispatcher->send(true);  // boolean
        $this->dispatcher->send(false); // boolean
    }

    /**
     * @see http://github.com/cadorn/domplate-reps/blob/master/packages/fc-object-graph/lib/array.js
     */
    public function test1Array()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);
        $this->dispatcher->send(array(1, 2));
    }
    public function testArray()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(array(1, 2));
        $this->dispatcher->send(array('1', 2));
        $this->dispatcher->send(array(1, '2'));
        $this->dispatcher->send(array('1', '2'));
        
    }

    /**
     * @see http://github.com/cadorn/domplate-reps/blob/master/packages/fc-object-graph/lib/array.js
     */
    public function testNestedArray()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(array(1, 2, array('element1', 'element2'), '4'));
        $this->dispatcher->send(array(1, 2, new Client_FcObjectGraph_AllTest__TestObject1(), '4'));
    }

    /**
     * @see http://github.com/cadorn/domplate-reps/blob/master/packages/fc-object-graph/lib/map.js
     */
    public function testMap()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(array(1 => 2));
        $this->dispatcher->send(array('1' => 2));
        $this->dispatcher->send(array(1 => '2'));
        $this->dispatcher->send(array('1' => '2'));

        $this->dispatcher->send(array(1, '2'=>3));
        $this->dispatcher->send(array(1, '2'=>'3'));
        $this->dispatcher->send(array('1', 2=>3));
        $this->dispatcher->send(array('1', '2'=>3));
        $this->dispatcher->send(array('1', 2=>'3'));
        $this->dispatcher->send(array('1', '2'=>'3'));
    }
    
    /**
     * @see http://github.com/cadorn/domplate-reps/blob/master/packages/fc-object-graph/lib/map.js
     */
    public function testNestedMap()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(array('1', '2'=>'3', array('element1', 'element2'),
                                '4' => array('element1', array('element2' => 'element3')),
                                '5'));

        $obj = new Client_FcObjectGraph_AllTest__TestObject1();
        $obj->child = $obj;
        $obj->var2 = 'val2';

        $this->dispatcher->send(array('1', '2'=>'3', new Client_FcObjectGraph_AllTest__TestObject1(),
                                '4' => $obj,
                                '5'));
    }
    
//    public function testDictionary() {
            
//    }

    /**
     * @see http://github.com/cadorn/domplate-reps/blob/master/packages/fc-object-graph/lib/dictionary.js
     * @see http://github.com/cadorn/domplate-reps/blob/master/packages/fc-object-graph/lib/reference.js
     */
    public function testInstance()
    {
        $this->dispatcher->getEncoder()->setOption('includeLanguageMeta', false);

        $this->dispatcher->send(new Client_FcObjectGraph_AllTest__TestObject());
        $this->dispatcher->send(new Client_FcObjectGraph_AllTest__TestObject1());

        $obj = new Client_FcObjectGraph_AllTest__TestObject1();
        $obj->child = new Client_FcObjectGraph_AllTest__TestObject1();
        $obj->child->child = new Client_FcObjectGraph_AllTest__TestObject1();
        $obj->var2 = 'val2';
        $this->dispatcher->send($obj);

        // circular
        $obj = new Client_FcObjectGraph_AllTest__TestObject1();
        $obj->child = new Client_FcObjectGraph_AllTest__TestObject1();
        $obj->var2 = 'val2';
        $obj->self = $obj;
        $obj->var3 = 'val3';
        $this->dispatcher->send($obj);
    }
}

class Client_FcObjectGraph_AllTest__TestObject
{
}

class Client_FcObjectGraph_AllTest__TestObject1
{
    public $var1 = 'val1';
}
