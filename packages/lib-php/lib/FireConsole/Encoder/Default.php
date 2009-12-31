<?php

require_once 'Zend/Reflection/Class.php';

class FireConsole_Encoder_Default {

    const UNDEFINED = '_U_N_D_E_F_I_N_E_D_';
    
    protected $options = array('maxObjectDepth' => 10,
                               'maxArrayDepth' => 20,
                               'includeLanguageMeta' => true);    
    
    
    /**
     * @Insight Filter = On
     */
    protected $_origin = self::UNDEFINED;
    
    
    /**
     * @Insight Filter = On
     */
    protected $_instances = array();
    
    
    public function setOption($name, $value)
    {
        $this->options[$name] = $value;
    }    
    
    public function setOrigin($variable)
    {
        $this->_origin = $variable;
        
        // reset some variables
        $this->_instances = array();

        return true;
    }
    
    public function encode($data=self::UNDEFINED, $meta=self::UNDEFINED)
    {
        if($data!==self::UNDEFINED) {
            $this->setOrigin($data);
        }
        
        // TODO: Use $meta['fc.encoder.options'] to control encoding
        
        $graph = array();
        
        if($this->_origin!==self::UNDEFINED) {
            $graph['origin'] = $this->_encodeVariable($this->_origin);
        }
        
        if($this->_instances) {
            foreach( $this->_instances as $key => $value ) {
                $graph['instances'][$key] = $value[1];
            }
        }
        
        return json_encode($graph);
    }


    protected function _encodeVariable($Variable, $ObjectDepth = 1, $ArrayDepth = 1)
    {
/*        
        if($Variable===self::UNDEFINED) {
            $var = array('type'=>'constant', 'constant'=>'undefined');
            if($this->options['includeLanguageMeta']) {
                $var['fc.lang.type'] = 'undefined';
            }
            return $var;
        } else
*/

        if(is_null($Variable)) {
            $var = array('type'=>'constant', 'constant'=>'null');
            if($this->options['includeLanguageMeta']) {
                $var['fc.lang.type'] = 'null';
            }
            return $var;
        } else
        if(is_bool($Variable)) {
            $var = array('type'=>'constant', 'constant'=>($Variable)?'true':'false');
            if($this->options['includeLanguageMeta']) {
                $var['fc.lang.type'] = 'boolean';
            }
            return $var;
        } else
        if(is_int($Variable)) {
            $var = array('type'=>'text', 'text'=>(string)$Variable);
            if($this->options['includeLanguageMeta']) {
                $var['fc.lang.type'] = 'integer';
            }
            return $var;
        } else
        if(is_float($Variable)) {
            $var = array('type'=>'text', 'text'=>(string)$Variable);
            if($this->options['includeLanguageMeta']) {
                $var['fc.lang.type'] = 'float';
            }
            return $var;
        } else
        if(is_object($Variable)) {
            
            return array('type'=>'reference', 'reference'=> $this->_encodeInstance($Variable, $ObjectDepth, $ArrayDepth));
            
        } else
        if(is_array($Variable)) {
            
            // Check if we have an indexed array (list) or an associative array (map)
            if(self::is_list($Variable)) {
                return array('type'=>'array', 'array'=> $this->_encodeArray($Variable, $ObjectDepth, $ArrayDepth));
            } else {
                return array('type'=>'map', 'map'=> $this->_encodeAssociativeArray($Variable, $ObjectDepth, $ArrayDepth));
            }
        } else
        if(is_resource($Variable)) {
            // TODO: Try and get more info about resource
            $var = array('type'=>'text', 'text'=>(string)$Variable);
            if($this->options['includeLanguageMeta']) {
                $var['fc.lang.type'] = 'resource';
            }
            return $var;
        } else
        if(is_string($Variable)) {
            $var = array('type'=>'text');
            // TODO: Add info about encoding
            if(self::is_utf8($Variable)) {
                $var['text'] = $Variable;
            } else {
                $var['text'] = utf8_encode($Variable);
            }
            if($this->options['includeLanguageMeta']) {
                $var['fc.lang.type'] = 'string';
            }
            return $var;
            
        } else {
            $var = array('type'=>'text', 'text'=>(string)$Variable);
            if($this->options['includeLanguageMeta']) {
                $var['fc.lang.type'] = 'unknown';
            }
            return $var;
        }        
    }
    
    protected function _getInstanceID($Object)
    {
        foreach( $this->_instances as $key => $instance ) {
            if($instance[0]===$Object) {
                return $key;
            }
        }
        return null;
    }
    
    protected function _encodeInstance($Object, $ObjectDepth = 1, $ArrayDepth = 1)
    {
        $id = $this->_getInstanceID($Object);
        if($id!==null) {
            return $id;
        }
        
        $id = sizeof($this->_instances);
        $this->_instances[$id] = array($Object);
        $this->_instances[$id][1] = $this->_encodeObject($Object, $ObjectDepth, $ArrayDepth);
        
        return $id;
    }    
    
    protected function _encodeAssociativeArray($Variable, $ObjectDepth = 1, $ArrayDepth = 1)
    {
        if ($ArrayDepth > $this->options['maxArrayDepth']) {
          return '** Max Array Depth ('.$this->options['maxArrayDepth'].') **';
        }
      
        foreach ($Variable as $key => $val) {
          
          // Encoding the $GLOBALS PHP array causes an infinite loop
          // if the recursion is not reset here as it contains
          // a reference to itself. This is the only way I have come up
          // with to stop infinite recursion in this case.
          if($key=='GLOBALS'
             && is_array($val)
             && array_key_exists('GLOBALS',$val)) {
            $val['GLOBALS'] = '** Recursion (GLOBALS) **';
          }
          
          $return[] = array($this->_encodeVariable($key), $this->_encodeVariable($val, 1, $ArrayDepth + 1));
        }
        return $return;    
    }
    
    protected function _encodeArray($Variable, $ObjectDepth = 1, $ArrayDepth = 1)
    {
        if ($ArrayDepth > $this->options['maxArrayDepth']) {
          return array('notice'=>'Max Array Depth ('.$this->options['maxArrayDepth'].')');
        }
        $items = array();
        foreach ($Variable as $val) {
          $items[] = $this->_encodeVariable($val, 1, $ArrayDepth + 1);
        }
        return $items;     
    }
    
    
    protected function _encodeObject($Object, $ObjectDepth = 1, $ArrayDepth = 1)
    {
        if ($ObjectDepth > $this->options['maxObjectDepth']) {
          return array('notice'=>'Max Object Depth ('.$this->options['maxObjectDepth'].')');
        }

        $return = array('type'=>'dictionary');

        $class = get_class($Object);
        if($this->options['includeLanguageMeta']) {
            $return['fc.lang.class'] = $class;
        }
        
        $classAnnotations = $this->_getClassAnnotations($class);

        $properties = $this->_getClassProperties($class);
        $reflectionClass = new ReflectionClass($class);  
        
        if($this->options['includeLanguageMeta']) {
            $return['fc.lang.file'] = $reflectionClass->getFileName();
        }
        
        $members = (array)$Object;
        foreach( $properties as $name => $property ) {
          
          if($name=='__fc_tpl_id') {
              $return['fc.tpl.id'] = $property->getValue($Object);
              continue;
          }
          
          $info = array();
          $info['name'] = $name;
          
          $raw_name = $name;
          if($property->isStatic()) {
            $info['static'] = 1;
          }
          if($property->isPublic()) {
            $info['visibility'] = 'public';
          } else
          if($property->isPrivate()) {
            $info['visibility'] = 'private';
            $raw_name = "\0".$class."\0".$raw_name;
          } else
          if($property->isProtected()) {
            $info['visibility'] = 'protected';
            $raw_name = "\0".'*'."\0".$raw_name;
          }

          if(isset($classAnnotations['$'.$name])
             && isset($classAnnotations['$'.$name]['Filter'])
             && $classAnnotations['$'.$name]['Filter']=='On') {
                   
              $info['notice'] = 'Trimmed by annotation filter';
          } else
          if(isset($this->objectFilters[$class])
             && is_array($this->objectFilters[$class])
             && in_array($name,$this->objectFilters[$class])) {
                   
              $info['notice'] = 'Trimmed by registered filters';
          }

          if(isset($info['notice'])) {

              try {
                      
                $info['value'] = $this->_trimVariable($property->getValue($Object));
                  
              } catch(ReflectionException $e) {
                $info['value'] =  $this->_encodeVariable(self::UNDEFINED);
                $info['notice'] .= ', Need PHP 5.3 to get value';
              }

          } else {

            if(array_key_exists($raw_name,$members)) {
//            if(array_key_exists($raw_name,$members)
 //              && !$property->isStatic()) {

                $info['value'] = $this->_encodeVariable($members[$raw_name], $ObjectDepth + 1, 1);
            
            } else {
              if(method_exists($property,'setAccessible')) {
                $property->setAccessible(true);
              }
              try {
                      
                  $info['value'] = $this->_encodeVariable($property->getValue($Object), $ObjectDepth + 1, 1);
                  
              } catch(ReflectionException $e) {
                  $info['value'] =  $this->_encodeVariable(self::UNDEFINED);
                  $info['notice'] = 'Need PHP 5.3 to get value';
              }
            }
          }
          
          $return['dictionary'][$info['name']] = $info['value'];
          if(isset($info['notice'])) {
              $return['dictionary'][$info['name']]['fc.encoder.notice'] = $info['notice'];
          }
          if($this->options['includeLanguageMeta']) {
              if(isset($info['visibility'])) {
                  $return['dictionary'][$info['name']]['fc.lang.visibility'] = $info['visibility'];
              }
              if(isset($info['static'])) {
                  $return['dictionary'][$info['name']]['fc.lang.static'] = $info['static'];
              }
          }
//          $return['members'][] = $info;
        }
        
        // Include all members that are not defined in the class
        // but exist in the object
        foreach( $members as $name => $value ) {
          
          if ($name{0} == "\0") {
            $parts = explode("\0", $name);
            $name = $parts[2];
          }
          
          if(!isset($properties[$name])) {
            
            $info = array();
            $info['undeclared'] = 1;
            $info['name'] = $name;

            if(isset($classAnnotations['$'.$name])
               && isset($classAnnotations['$'.$name]['Filter'])
               && $classAnnotations['$'.$name]['Filter']=='On') {
                       
                $info['notice'] = 'Trimmed by annotation filter';
            } else
            if(isset($this->objectFilters[$class])
               && is_array($this->objectFilters[$class])
               && in_array($name,$this->objectFilters[$class])) {
                       
                $info['notice'] = 'Trimmed by registered filters';
            }
            
            if(isset($info['notice'])) {
                $info['value'] = $this->_trimVariable($value);
            } else {
                $info['value'] = $this->_encodeVariable($value, $ObjectDepth + 1, 1);
            }

            $return['dictionary'][$info['name']] = $info['value'];
            if($this->options['includeLanguageMeta']) {
                $return['dictionary'][$info['name']]['fc.lang.undeclared'] = 1;
            }
            if(isset($info['notice'])) {
              $return['dictionary'][$info['name']]['fc.encoder.notice'] = $info['notice'];
            }

//            $return['members'][] = $info;    
          }
        }

        return $return;
    }

    protected function _trimVariable($var, $length=20)
    {
        if(is_null($var)) {
            return 'NULL';
        } else
        if(is_bool($var)) {
            return ($var)?'TRUE':'FALSE';
        } else
        if(is_int($var) || is_float($var) || is_double($var)) {
            return $this->_trimString((string)$var, $length);
        } else
        if(is_object($var)) {
            return $this->_trimString(get_class($var), $length);
        } else
        if(is_array($var)) {
            return $this->_trimString(serialize($var), $length);
        } else
        if(is_resource($var)) {
            return $this->_trimString('' . $var);
        } else
        if(is_string($var)) {
            return '\'' . $this->_trimString($var, $length) . '\'';
        } else {
            return '\'' . $this->_trimString($var, $length) . '\'';
        }
    }
    
    protected function _trimString($string, $length=20)
    {
        if(strlen($string)<=$length+3) {
            return $string;
        }
        return substr($string, 0, $length) . '...';
    }    
    
    protected function _getClassProperties($class)
    {
        $reflectionClass = new ReflectionClass($class);  
                
        $properties = array();

        // Get parent properties first
        if($parent = $reflectionClass->getParentClass()) {
            $properties = $this->_getClassProperties($parent->getName());
        }
        
        foreach( $reflectionClass->getProperties() as $property) {
          $properties[$property->getName()] = $property;
        }
        
        return $properties;
    }
    
    protected function _getClassAnnotations($class)
    {
        $annotations = array();
        
        // TODO: Go up to parent classes (let subclasses override tags from parent classes)
        
        $reflectionClass = new Zend_Reflection_Class($class);
        
        foreach( $reflectionClass->getProperties() as $property ) {
            
            $docblock = $property->getDocComment();
            if($docblock) {
                
                $tags = $docblock->getTags('Insight');
                if($tags) {
                    foreach($tags as $tag) {
                       
                       list($name, $value) = $this->_parseAnnotationTag($tag);
                       
                       $annotations['$'.$property->getName()][$name] = $value;
                    }
                }
            }
        }
        
        return $annotations;
    }
    
    protected function _parseAnnotationTag($tag) {
        
        if(!preg_match_all('/^([^)\s]*?)\s*=\s*(.*?)$/si', $tag->getDescription(), $m)) {
            Insight_Annotator::setVariables(array('tag'=>$tag));
            throw new Exception('Tag format not valid!');
        }
        
        return array($m[1][0], $m[2][0]);
    }
    
    
    protected static function is_list($array)
    {
        $i = 0;
        foreach( array_keys($array) as $k ) {
            if( $k !== $i++ ) {
                $i = -1;
                break;
            }
        }
        if($i==-1) {
            // Array is a map
            return false;
        } else {
            // Array is a list
            return true;
        }
    }

 
    /**
     * is_utf8 - Checks if a string complies with UTF-8 encoding
     * 
     * @see http://us2.php.net/mb_detect_encoding#85294
     */
    protected static function is_utf8($str) {
        $c=0; $b=0;
        $bits=0;
        $len=strlen($str);
        for($i=0; $i<$len; $i++){
            $c=ord($str[$i]);
            if($c > 128){
                if(($c >= 254)) return false;
                elseif($c >= 252) $bits=6;
                elseif($c >= 248) $bits=5;
                elseif($c >= 240) $bits=4;
                elseif($c >= 224) $bits=3;
                elseif($c >= 192) $bits=2;
                else return false;
                if(($i+$bits) > $len) return false;
                while($bits > 1){
                    $i++;
                    $b=ord($str[$i]);
                    if($b < 128 || $b > 191) return false;
                    $bits--;
                }
            }
        }
        return true;
    }    
}
