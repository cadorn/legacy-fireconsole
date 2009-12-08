<?php

class FireConsole_Dispatcher
{
    private $channel = null;
    private $messageFactory = null;
    private $encoder = null;
    
    public function setChannel($channel)
    {
        if(is_string($channel)) {
            require_once 'Wildfire/Channel/' . $channel . '.php';
            $class = 'Wildfire_Channel_' . $channel;
            $channel = new $class();
        }
        return $this->channel = $channel;
    }

    public function registerTemplatePack($info) {
        if(!isset($info['project.url'])) {
            throw new Exception("'project.url' not provided!");
        }
        if(!isset($info['source.url'])) {
            throw new Exception("'source.url' not provided!");
        }
        if(!isset($info['descriptor'])) {
            throw new Exception("'descriptor' not provided!");
        }
        if(!isset($info['descriptor']['location'])) {
            throw new Exception("'descriptor' > 'location' not provided!");
        }
        $message = $this->getNewMessage(null);
        $message->setReceiver("http://pinf.org/cadorn.org/fireconsole/meta/Receiver/TemplatePack/0.1");
        $message->setData(json_encode(array(
            "action" => "require",
            "info" => $info
        )));
        $this->channel->enqueueOutgoing($message);
    }

    public function setMessageFactory($messageFactory)
    {
        $this->messageFactory = $messageFactory;
        return true;
    }
    
    public function getChannel()
    {
        if(!$this->channel) {
            require_once 'Wildfire/Channel/HttpHeader.php';
            $this->channel = new Wildfire_Channel_HttpHeader();
        }
        return $this->channel;
    }
    
    private function getNewMessage($meta)
    {
        if(!$this->messageFactory) {
            require_once 'Wildfire/Message.php';
            return new Wildfire_Message();
        }
        return $this->messageFactory->newMessage($meta);
    }

    public function getEncoder()
    {
        if(!$this->encoder) {
            require_once 'FireConsole/Encoder/Default.php';
            $this->encoder = new FireConsole_Encoder_Default();
        }
        return $this->encoder;
    }

    public function send($data, $meta='')
    {
        $message = $this->getNewMessage($meta);
        $message->setReceiver("http://pinf.org/cadorn.org/fireconsole/meta/Receiver/Console/0.1");
        if($meta) $message->setMeta(json_encode($meta));
        $message->setData($this->getEncoder()->encode($data, $meta));
        $this->channel->enqueueOutgoing($message);
        return true;
    }
}
