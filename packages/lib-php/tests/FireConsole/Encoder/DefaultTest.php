<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';
require_once 'PHPUnit/Framework.php';

require_once 'FireConsole/Encoder/Default.php';
 
class FireConsole_Encoder_DefaultTest extends PHPUnit_Framework_TestCase
{
    public function testBasicVariables()
    {
        $options = array();
        
        $tests = array();
        $tests[] = array(null, 'a:1:{s:6:"origin";a:1:{s:4:"type";s:4:"null";}}');
        $tests[] = array(true, 'a:1:{s:6:"origin";a:2:{s:4:"type";s:7:"boolean";s:5:"value";s:1:"1";}}');
        $tests[] = array(false, 'a:1:{s:6:"origin";a:2:{s:4:"type";s:7:"boolean";s:5:"value";s:1:"0";}}');
        $tests[] = array(100, 'a:1:{s:6:"origin";a:2:{s:4:"type";s:7:"integer";s:5:"value";i:100;}}');
        $tests[] = array(10.5, 'a:1:{s:6:"origin";a:2:{s:4:"type";s:5:"float";s:5:"value";d:10.5;}}');
        $tests[] = array(0x33, 'a:1:{s:6:"origin";a:2:{s:4:"type";s:7:"integer";s:5:"value";i:51;}}');
        $tests[] = array(tmpfile(), 'a:1:{s:6:"origin";a:2:{s:4:"type";s:8:"resource";s:5:"value";s:0:"";}}');
        $tests[] = array(array('a','b'), 'a:1:{s:6:"origin";a:2:{s:4:"type";s:5:"array";s:5:"array";a:2:{i:0;a:2:{s:4:"type";s:6:"string";s:5:"value";s:1:"a";}i:1;a:2:{s:4:"type";s:6:"string";s:5:"value";s:1:"b";}}}}');
        $tests[] = array(array('Hello'=>'World'), 'a:1:{s:6:"origin";a:2:{s:4:"type";s:3:"map";s:3:"map";a:1:{i:0;a:2:{i:0;a:2:{s:4:"type";s:6:"string";s:5:"value";s:5:"Hello";}i:1;a:2:{s:4:"type";s:6:"string";s:5:"value";s:5:"World";}}}}}');
        
        foreach( $tests as $test ) {

            $encoder = new FireConsole_Encoder_Default();
            $encoder->setOrigin($test[0]);
            $json = $encoder->encode();
            
            if(!$test[1]) {
                // NOTE: This is just to add tests. Leave the test pattern empty and it will print out result.
                var_dump($json);
                var_dump(serialize($json));
                $this->fail('You need to add a test pattern!');
            } else {

                $this->assertEquals($json, unserialize($test[1]));
                $this->assertEquals(serialize($json), $test[1]);
                
            }
        }
    }

    public function testBasicObject()
    {
        $options = array();
        
        $variable = new FireConsole_Encoder_DefaultTest__Class1();
        $variable->undeclared_var = 'Undecraled Var';
        
        $encoder = new FireConsole_Encoder_Default();
        $encoder->setOrigin($variable);
        $json = $encoder->encode();
        
        $this->assertEquals($json['origin'], unserialize('a:2:{s:4:"type";s:6:"object";s:8:"instance";i:0;}'));
        $this->assertEquals($json['instances'][0]['class'], 'FireConsole_Encoder_DefaultTest__Class1');
        $this->assertEquals($json['instances'][0]['file'], __FILE__);
        $this->assertEquals($json['instances'][0]['members'], unserialize('a:2:{i:0;a:3:{s:4:"name";s:4:"var1";s:10:"visibility";s:6:"public";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:8:"Test Var";}}i:1;a:3:{s:10:"undeclared";i:1;s:4:"name";s:14:"undeclared_var";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:14:"Undecraled Var";}}}'));
    }
    
    public function testObjectMembers()
    {
        $options = array();
        
        $variable = new FireConsole_Encoder_DefaultTest__Class2();
        
        $encoder = new FireConsole_Encoder_Default();
        $encoder->setOrigin($variable);
        $json = $encoder->encode();

        $this->assertEquals(sizeof($json['instances'][0]['members']), 6);

        $this->assertEquals($json['instances'][0]['members'][0], unserialize('a:3:{s:4:"name";s:10:"public_var";s:10:"visibility";s:6:"public";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:10:"Public Var";}}'));
        $this->assertEquals($json['instances'][0]['members'][1], unserialize('a:3:{s:4:"name";s:13:"protected_var";s:10:"visibility";s:9:"protected";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:13:"Protected Var";}}'));
        $this->assertEquals($json['instances'][0]['members'][2], unserialize('a:3:{s:4:"name";s:11:"private_var";s:10:"visibility";s:7:"private";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:11:"Private Var";}}'));
        $this->assertEquals($json['instances'][0]['members'][3], unserialize('a:4:{s:4:"name";s:16:"staic_public_var";s:6:"static";i:1;s:10:"visibility";s:6:"public";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:17:"Static Public Var";}}'));

        if(version_compare(phpversion(), '5.3','>=')) {
            
            $this->fail('This needs to be implemented for PHP 5.3+');
            
        } else {
            $this->assertEquals($json['instances'][0]['members'][4], unserialize('a:5:{s:4:"name";s:20:"static_protected_var";s:6:"static";i:1;s:10:"visibility";s:9:"protected";s:5:"value";a:1:{s:4:"type";s:9:"undefined";}s:6:"notice";s:25:"Need PHP 5.3 to get value";}'));
            $this->assertEquals($json['instances'][0]['members'][5], unserialize('a:5:{s:4:"name";s:18:"static_private_var";s:6:"static";i:1;s:10:"visibility";s:7:"private";s:5:"value";a:1:{s:4:"type";s:9:"undefined";}s:6:"notice";s:25:"Need PHP 5.3 to get value";}'));
        }
    }
    
    public function testSubclassedObjectMembers()
    {
        $options = array();
        
        $variable = new FireConsole_Encoder_DefaultTest__Class3();
        
        $encoder = new FireConsole_Encoder_Default();
        $encoder->setOrigin($variable);
        $json = $encoder->encode();

        $this->assertEquals(sizeof($json['instances'][0]['members']), 7);

        $this->assertEquals($json['instances'][0]['members'][0], unserialize('a:3:{s:4:"name";s:10:"public_var";s:10:"visibility";s:6:"public";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:10:"Public Var";}}'));
        $this->assertEquals($json['instances'][0]['members'][1], unserialize('a:3:{s:4:"name";s:13:"protected_var";s:10:"visibility";s:9:"protected";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:22:"Modified Protected Var";}}'));
        $this->assertEquals($json['instances'][0]['members'][3], unserialize('a:4:{s:4:"name";s:16:"staic_public_var";s:6:"static";i:1;s:10:"visibility";s:6:"public";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:17:"Static Public Var";}}'));
        $this->assertEquals($json['instances'][0]['members'][6], unserialize('a:3:{s:4:"name";s:18:"another_public_var";s:10:"visibility";s:6:"public";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:18:"Another Public Var";}}'));

        if(version_compare(phpversion(), '5.3','>=')) {
            
            $this->fail('This needs to be implemented for PHP 5.3+');
            
        } else {

            $this->assertEquals($json['instances'][0]['members'][2], unserialize('a:4:{s:4:"name";s:11:"private_var";s:10:"visibility";s:7:"private";s:5:"value";a:1:{s:4:"type";s:9:"undefined";}s:6:"notice";s:25:"Need PHP 5.3 to get value";}'));
            $this->assertEquals($json['instances'][0]['members'][4], unserialize('a:5:{s:4:"name";s:20:"static_protected_var";s:6:"static";i:1;s:10:"visibility";s:9:"protected";s:5:"value";a:1:{s:4:"type";s:9:"undefined";}s:6:"notice";s:25:"Need PHP 5.3 to get value";}'));
            $this->assertEquals($json['instances'][0]['members'][5], unserialize('a:5:{s:4:"name";s:18:"static_private_var";s:6:"static";i:1;s:10:"visibility";s:7:"private";s:5:"value";a:1:{s:4:"type";s:9:"undefined";}s:6:"notice";s:25:"Need PHP 5.3 to get value";}'));
        }
    }    

    public function testCyclicalObjectMembers()
    {
        $options = array();
        
        $variable = new FireConsole_Encoder_DefaultTest__Class1();
        $variable->object1 = $variable;
        $variable->object2 = new FireConsole_Encoder_DefaultTest__Class1();
        $variable->object2->object1 = $variable->object2;
        $variable->object2->object2 = $variable;
        
        $encoder = new FireConsole_Encoder_Default();
        $encoder->setOrigin($variable);
        $json = $encoder->encode();

        $this->assertEquals($json['instances'][0]['members'], unserialize('a:3:{i:0;a:3:{s:4:"name";s:4:"var1";s:10:"visibility";s:6:"public";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:8:"Test Var";}}i:1;a:3:{s:10:"undeclared";i:1;s:4:"name";s:7:"object1";s:5:"value";a:2:{s:4:"type";s:6:"object";s:8:"instance";i:0;}}i:2;a:3:{s:10:"undeclared";i:1;s:4:"name";s:7:"object2";s:5:"value";a:2:{s:4:"type";s:6:"object";s:8:"instance";i:1;}}}'));
        $this->assertEquals($json['instances'][1]['members'], unserialize('a:3:{i:0;a:3:{s:4:"name";s:4:"var1";s:10:"visibility";s:6:"public";s:5:"value";a:2:{s:4:"type";s:6:"string";s:5:"value";s:8:"Test Var";}}i:1;a:3:{s:10:"undeclared";i:1;s:4:"name";s:7:"object1";s:5:"value";a:2:{s:4:"type";s:6:"object";s:8:"instance";i:1;}}i:2;a:3:{s:10:"undeclared";i:1;s:4:"name";s:7:"object2";s:5:"value";a:2:{s:4:"type";s:6:"object";s:8:"instance";i:0;}}}'));
    }
    
}



class FireConsole_Encoder_DefaultTest__Class1
{
    public $var1 = 'Test Var';
}

class FireConsole_Encoder_DefaultTest__Class2
{
    public $public_var = 'Public Var';
    protected $protected_var = 'Protected Var';
    private $private_var = 'Private Var';

    static public $staic_public_var = 'Static Public Var';
    static protected $static_protected_var = 'Static Protected Var';
    static private $static_private_var = 'Static Private Var';
}

class FireConsole_Encoder_DefaultTest__Class3 extends FireConsole_Encoder_DefaultTest__Class2
{
    public $another_public_var = 'Another Public Var';
    protected $protected_var = 'Modified Protected Var';
}
