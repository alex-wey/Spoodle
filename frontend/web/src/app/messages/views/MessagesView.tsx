'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Send,
  ArrowLeft
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: "vet" | "owner";
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  ownerName: string;
  ownerImage?: string;
  petName: string;
  petBreed: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  appointmentId?: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    ownerName: "Sarah Johnson",
    petName: "Max",
    petBreed: "Golden Retriever",
    lastMessage: "Thank you so much! Also, should I bring his previous vaccination records?",
    lastMessageTime: "2024-01-15T09:20:00Z",
    unreadCount: 1,
    appointmentId: "1",
    messages: [
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
    ]
  },
  {
    id: "2",
    ownerName: "Michael Davis",
    petName: "Luna", 
    petBreed: "Tabby Cat",
    lastMessage: "Luna seems to be doing much better after the treatment. Thank you!",
    lastMessageTime: "2024-01-14T16:30:00Z",
    unreadCount: 0,
    messages: [
      {
        id: "4",
        senderId: "vet1",
        senderName: "Dr. Chen",
        senderType: "vet", 
        content: "How is Luna feeling after yesterday's treatment?",
        timestamp: "2024-01-14T16:00:00Z",
        read: true
      },
      {
        id: "5",
        senderId: "owner2",
        senderName: "Michael Davis",
        senderType: "owner",
        content: "Luna seems to be doing much better after the treatment. Thank you!",
        timestamp: "2024-01-14T16:30:00Z", 
        read: true
      }
    ]
  },
  {
    id: "3",
    ownerName: "Jennifer Wilson",
    petName: "Rocky",
    petBreed: "German Shepherd", 
    lastMessage: "Perfect, see you tomorrow for the follow-up!",
    lastMessageTime: "2024-01-13T14:20:00Z",
    unreadCount: 0,
    messages: [
      {
        id: "6",
        senderId: "vet1",
        senderName: "Dr. Martinez",
        senderType: "vet",
        content: "Rocky's surgery went very well. Please bring him in tomorrow for a follow-up check.",
        timestamp: "2024-01-13T14:00:00Z",
        read: true
      },
      {
        id: "7",
        senderId: "owner3",
        senderName: "Jennifer Wilson",
        senderType: "owner",
        content: "Perfect, see you tomorrow for the follow-up!",
        timestamp: "2024-01-13T14:20:00Z",
        read: true
      }
    ]
  }
];

export default function MessagesView() {
  const router = useRouter();
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const filteredConversations = conversations.filter(conv => {
    const searchTerm = searchQuery.toLowerCase();
    return conv.ownerName.toLowerCase().includes(searchTerm) ||
           conv.petName.toLowerCase().includes(searchTerm) ||
           conv.lastMessage.toLowerCase().includes(searchTerm);
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: "vet1",
        senderName: "Dr. Chen",
        senderType: "vet", 
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // In a real app, this would update the conversation via API
      console.log("Sending message:", message);
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
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="flex h-screen bg-background">
      {/* Conversations List */}
      <div className="w-96 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Messages</h1>
            {totalUnreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {totalUnreadCount}
              </Badge>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedConversation?.id === conversation.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.ownerImage} alt={conversation.ownerName} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {conversation.ownerName.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm truncate">{conversation.ownerName}</h3>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          About {conversation.petName} ({conversation.petBreed})
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.ownerImage} alt={selectedConversation.ownerName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedConversation.ownerName.split(' ').map(n => n.charAt(0)).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedConversation.ownerName}</h2>
                    <p className="text-sm text-muted-foreground">
                      About {selectedConversation.petName} ({selectedConversation.petBreed})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/pet-owners/${selectedConversation.id}`)}>
                        View Owner Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/pets/${selectedConversation.id}`)}>
                        View Pet Profile
                      </DropdownMenuItem>
                      {selectedConversation.appointmentId && (
                        <DropdownMenuItem onClick={() => router.push(`/appointment/${selectedConversation.appointmentId}`)}>
                          View Appointment
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Clear Chat History</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((message) => (
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging with pet owners.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
