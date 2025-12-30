import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../ui/dialog";
import { MessageSquare, Send, Phone, Video } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: "vet" | "owner";
  content: string;
  timestamp: string;
  read: boolean;
}

interface MessagingPopupProps {
  ownerName: string;
  ownerImage?: string;
  petName: string;
  appointmentId: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "owner1",
    senderName: "Sarah Johnson",
    senderType: "owner",
    content: "Hi Dr. Chen, I wanted to ask about Max's vaccination. Is it okay if he had a small snack this morning?",
    timestamp: "2024-01-15T09:15:00Z",
    read: true
  },
  {
    id: "2", 
    senderId: "vet1",
    senderName: "Dr. Chen",
    senderType: "vet",
    content: "Hi Sarah! A small snack is perfectly fine. It won't interfere with the vaccination at all. See you at 9:00 AM!",
    timestamp: "2024-01-15T09:18:00Z",
    read: true
  },
  {
    id: "3",
    senderId: "owner1", 
    senderName: "Sarah Johnson",
    senderType: "owner",
    content: "Thank you so much! Also, should I bring his previous vaccination records?",
    timestamp: "2024-01-15T09:20:00Z",
    read: false
  }
];

export function MessagingPopup({ ownerName, ownerImage, petName }: MessagingPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [messagingEnabled, setMessagingEnabled] = useState(true);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: "vet1",
        senderName: "Dr. Chen", 
        senderType: "vet",
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const unreadCount = messages.filter(msg => !msg.read && msg.senderType === "owner").length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative gap-2">
          <MessageSquare className="h-4 w-4" />
          Messages
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={ownerImage} alt={ownerName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {ownerName.split(' ').map(n => n.charAt(0)).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">{ownerName}</DialogTitle>
                <p className="text-sm text-muted-foreground">About {petName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Messaging Toggle */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="messaging-toggle"
                checked={messagingEnabled}
                onCheckedChange={setMessagingEnabled}
              />
              <Label htmlFor="messaging-toggle" className="text-sm">
                Enable messaging for this appointment
              </Label>
            </div>
            {messagingEnabled && (
              <Badge variant="secondary" className="text-xs">
                Owner can send messages
              </Badge>
            )}
          </div>
        </DialogHeader>

        {messagingEnabled ? (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.senderType === 'vet' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${message.senderType === 'vet' ? 'order-1' : 'order-2'}`}>
                      <div className={`rounded-lg px-3 py-2 ${
                        message.senderType === 'vet' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${message.senderType === 'vet' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                        {!message.read && message.senderType === 'owner' && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Message Input */}
            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Messaging Disabled</h3>
              <p className="text-muted-foreground">
                Enable messaging to allow communication with the pet owner about this appointment.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}