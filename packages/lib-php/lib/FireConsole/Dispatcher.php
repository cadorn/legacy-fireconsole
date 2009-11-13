<?php

class FireConsole_Dispatcher
{
    private $channel = null;
    private $messageFactory = null;
    private $encoder = null;
    
    public function setChannel($channel)
    {
        if(is_string($channel)) {
//            $class = 'Wildfire_channel_' . $channel;
//            $channel = new $class();
        }
        $this->channel = $channel;
        return true;
    }
    
    public function setMessageFactory($messageFactory)
    {
        $this->messageFactory = $messageFactory;
        return true;
    }
    
    private function getChannel()
    {
        if(!$this->channel) {
//            require_once 'Wildfire/Channel/HttpHeader.php';
//            $this->channel = new Wildfire_Channel_HttpHeader();
        }
        return $this->channel;
    }
    
    private function getNewMessage($meta)
    {
        if(!$this->messageFactory) {
//            require_once 'Wildfire/Message.php';
//            $this->channel = new Wildfire_Message();
        }
        return $this->messageFactory->newMessage($meta);
    }

    private function getEncoder()
    {
        if(!$this->encoder) {
            require_once 'FireConsole/Encoder/Default.php';
            $this->encoder = new FireConsole_Encoder_Default();
        }
        return $this->encoder;
    }

    public function send($data, $meta)
    {
        $message = $this->getNewMessage($meta);
        $message->setMeta(json_encode($meta));
        $message->setData($this->getEncoder()->encode($data, $meta));
        $this->channel->enqueueOutgoing($message);
        return true;
    }
}
