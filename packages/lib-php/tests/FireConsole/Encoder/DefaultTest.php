<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';
require_once 'PHPUnit/Framework.php';

require_once 'FireConsole/Encoder/Default.php';


mp_require('functions/mp_json_to_array');


class FireConsole_Encoder_DefaultTest extends PHPUnit_Framework_TestCase
{
    public function testBasicVariables()
    {
        $options = array();
        
        $tests = array();
        $tests[] = array(null, 'a:1:{s:6:"origin";a:3:{s:4:"type";s:8:"constant";s:8:"constant";s:4:"null";s:12:"fc.lang.type";s:4:"null";}}');
        $tests[] = array(true, 'a:1:{s:6:"origin";a:3:{s:4:"type";s:8:"constant";s:8:"constant";s:4:"true";s:12:"fc.lang.type";s:7:"boolean";}}');
        $tests[] = array(false, 'a:1:{s:6:"origin";a:3:{s:4:"type";s:8:"constant";s:8:"constant";s:5:"false";s:12:"fc.lang.type";s:7:"boolean";}}');
        $tests[] = array("a", 'a:1:{s:6:"origin";a:3:{s:4:"type";s:4:"text";s:4:"text";s:1:"a";s:12:"fc.lang.type";s:6:"string";}}');
        $tests[] = array(100, 'a:1:{s:6:"origin";a:3:{s:4:"type";s:4:"text";s:4:"text";s:3:"100";s:12:"fc.lang.type";s:7:"integer";}}');
        $tests[] = array(10.5, 'a:1:{s:6:"origin";a:3:{s:4:"type";s:4:"text";s:4:"text";s:4:"10.5";s:12:"fc.lang.type";s:5:"float";}}');
        $tests[] = array(0x33, 'a:1:{s:6:"origin";a:3:{s:4:"type";s:4:"text";s:4:"text";s:2:"51";s:12:"fc.lang.type";s:7:"integer";}}');
        $tests[] = array(tmpfile(), 'a:1:{s:6:"origin";a:3:{s:4:"type";s:4:"text";s:4:"text";s:12:"__RESOURCE__";s:12:"fc.lang.type";s:8:"resource";}}', '__RESOURCE__');
        $tests[] = array(array('a','b'), 'a:1:{s:6:"origin";a:2:{s:4:"type";s:5:"array";s:5:"array";a:2:{i:0;a:3:{s:4:"type";s:4:"text";s:4:"text";s:1:"a";s:12:"fc.lang.type";s:6:"string";}i:1;a:3:{s:4:"type";s:4:"text";s:4:"text";s:1:"b";s:12:"fc.lang.type";s:6:"string";}}}}');
        $tests[] = array(array('a'=>'b'), 'a:1:{s:6:"origin";a:2:{s:4:"type";s:3:"map";s:3:"map";a:1:{i:0;a:2:{i:0;a:3:{s:4:"type";s:4:"text";s:4:"text";s:1:"a";s:12:"fc.lang.type";s:6:"string";}i:1;a:3:{s:4:"type";s:4:"text";s:4:"text";s:1:"b";s:12:"fc.lang.type";s:6:"string";}}}}}');
        
        foreach( $tests as $test ) {
            $encoder = new FireConsole_Encoder_Default();
            $encoder->setOrigin($test[0]);
            list($data, $meta) = $encoder->encode();
            $json = mp_json_to_array($data);

            if(isset($test[2]) && $test[2]=="__RESOURCE__") {
                $json['origin']['text'] = '__RESOURCE__';
            }
            
            if(!$test[1]) {
                // NOTE: This is just to add tests. Leave the test pattern empty and it will print out result.
                var_dump($json);
                var_dump(serialize($json));
                $this->fail('You need to add a test pattern!');
            } else {

                $this->assertEquals(unserialize($test[1]), $json, serialize($test[0]));
                $this->assertEquals($test[1], serialize($json), serialize($test[0]));
                
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
        list($data, $meta) = $encoder->encode();
        $json = mp_json_to_array($data);
        
        $this->assertEquals($json['origin'], unserialize('a:2:{s:4:"type";s:9:"reference";s:9:"reference";i:0;}'));
        $this->assertEquals($json['instances'][0]['type'], 'dictionary');
        $this->assertEquals($json['instances'][0]['fc.lang.class'], 'FireConsole_Encoder_DefaultTest__Class1');
        $this->assertEquals($json['instances'][0]['fc.lang.file'], __FILE__);
        $this->assertEquals($json['instances'][0]['dictionary'], unserialize('a:2:{s:4:"var1";a:4:{s:4:"type";s:4:"text";s:4:"text";s:8:"Test Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:6:"public";}s:14:"undeclared_var";a:4:{s:4:"type";s:4:"text";s:4:"text";s:14:"Undecraled Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.undeclared";i:1;}}'));
    }
    
    public function testObjectMembers()
    {
        $options = array();
        
        $variable = new FireConsole_Encoder_DefaultTest__Class2();
        
        $encoder = new FireConsole_Encoder_Default();
        $encoder->setOrigin($variable);
        list($data, $meta) = $encoder->encode();
        $json = mp_json_to_array($data);

        $this->assertEquals(sizeof($json['instances'][0]['dictionary']), 6);

        $this->assertEquals($json['instances'][0]['dictionary']['public_var'], unserialize('a:4:{s:4:"type";s:4:"text";s:4:"text";s:10:"Public Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:6:"public";}'));
        $this->assertEquals($json['instances'][0]['dictionary']['protected_var'], unserialize('a:4:{s:4:"type";s:4:"text";s:4:"text";s:13:"Protected Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:9:"protected";}'));
        $this->assertEquals($json['instances'][0]['dictionary']['private_var'], unserialize('a:4:{s:4:"type";s:4:"text";s:4:"text";s:11:"Private Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:7:"private";}'));
        $this->assertEquals($json['instances'][0]['dictionary']['staic_public_var'], unserialize('a:5:{s:4:"type";s:4:"text";s:4:"text";s:17:"Static Public Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:6:"public";s:14:"fc.lang.static";i:1;}'));

        if(version_compare(phpversion(), '5.3','>=')) {
            
            $this->assertEquals($json['instances'][0]['dictionary']['static_protected_var'], unserialize('a:5:{s:4:"type";s:4:"text";s:4:"text";s:20:"Static Protected Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:9:"protected";s:14:"fc.lang.static";i:1;}'));
            $this->assertEquals($json['instances'][0]['dictionary']['static_private_var'], unserialize('a:5:{s:4:"type";s:4:"text";s:4:"text";s:18:"Static Private Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:7:"private";s:14:"fc.lang.static";i:1;}'));
            
        } else {
            $this->fail('This needs to be implemented for PHP <5.3');
        }
    }
    
    public function testSubclassedObjectMembers()
    {
        $options = array();
        
        $variable = new FireConsole_Encoder_DefaultTest__Class3();
        
        $encoder = new FireConsole_Encoder_Default();
        $encoder->setOrigin($variable);
        list($data, $meta) = $encoder->encode();
        $json = mp_json_to_array($data);

        $this->assertEquals(sizeof($json['instances'][0]['dictionary']), 7);

        $this->assertEquals($json['instances'][0]['dictionary']['public_var'], unserialize('a:4:{s:4:"type";s:4:"text";s:4:"text";s:10:"Public Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:6:"public";}'));
        $this->assertEquals($json['instances'][0]['dictionary']['protected_var'], unserialize('a:4:{s:4:"type";s:4:"text";s:4:"text";s:22:"Modified Protected Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:9:"protected";}'));
        $this->assertEquals($json['instances'][0]['dictionary']['staic_public_var'], unserialize('a:5:{s:4:"type";s:4:"text";s:4:"text";s:17:"Static Public Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:6:"public";s:14:"fc.lang.static";i:1;}'));
        $this->assertEquals($json['instances'][0]['dictionary']['another_public_var'], unserialize('a:4:{s:4:"type";s:4:"text";s:4:"text";s:18:"Another Public Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:6:"public";}'));

        if(version_compare(phpversion(), '5.3','>=')) {
            
            $this->assertEquals($json['instances'][0]['dictionary']['private_var'], unserialize('a:4:{s:4:"type";s:4:"text";s:4:"text";s:11:"Private Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:7:"private";}'));
            $this->assertEquals($json['instances'][0]['dictionary']['static_protected_var'], unserialize('a:5:{s:4:"type";s:4:"text";s:4:"text";s:20:"Static Protected Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:9:"protected";s:14:"fc.lang.static";i:1;}'));
            $this->assertEquals($json['instances'][0]['dictionary']['static_private_var'], unserialize('a:5:{s:4:"type";s:4:"text";s:4:"text";s:18:"Static Private Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:7:"private";s:14:"fc.lang.static";i:1;}'));
            
        } else {

            $this->fail('This needs to be implemented for PHP <5.3');

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
        list($data, $meta) = $encoder->encode();
        $json = mp_json_to_array($data);

        $this->assertEquals($json['instances'][0]['dictionary'], unserialize('a:3:{s:4:"var1";a:4:{s:4:"type";s:4:"text";s:4:"text";s:8:"Test Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:6:"public";}s:7:"object1";a:3:{s:4:"type";s:9:"reference";s:9:"reference";i:0;s:18:"fc.lang.undeclared";i:1;}s:7:"object2";a:3:{s:4:"type";s:9:"reference";s:9:"reference";i:1;s:18:"fc.lang.undeclared";i:1;}}'));
        $this->assertEquals($json['instances'][1]['dictionary'], unserialize('a:3:{s:4:"var1";a:4:{s:4:"type";s:4:"text";s:4:"text";s:8:"Test Var";s:12:"fc.lang.type";s:6:"string";s:18:"fc.lang.visibility";s:6:"public";}s:7:"object1";a:3:{s:4:"type";s:9:"reference";s:9:"reference";i:1;s:18:"fc.lang.undeclared";i:1;}s:7:"object2";a:3:{s:4:"type";s:9:"reference";s:9:"reference";i:0;s:18:"fc.lang.undeclared";i:1;}}'));
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
