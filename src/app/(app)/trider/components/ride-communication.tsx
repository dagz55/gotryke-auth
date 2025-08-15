"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Phone, 
  MessageSquare, 
  Clock,
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface Message {
  id: string;
  sender: 'trider' | 'passenger';
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'location';
}

interface RideCommunicationProps {
  passengerName: string;
  tripId: string;
  onSendMessage?: (message: string) => void;
  onCall?: () => void;
}

export function RideCommunication({ 
  passengerName, 
  tripId, 
  onSendMessage, 
  onCall 
}: RideCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pre-defined quick messages for Triders
  const quickMessages = [
    "I'm on my way to pick you up",
    "I've arrived at the pickup location",
    "Running 5 minutes late due to traffic",
    "Could you please wait at the main entrance?",
    "Thank you for riding with GoTryke!"
  ];

  useEffect(() => {
    // Initialize with system messages
    const initialMessages: Message[] = [
      {
        id: '1',
        sender: 'system' as const,
        content: `Trip started with ${passengerName}`,
        timestamp: new Date(),
        type: 'system'
      }
    ];

    // Simulate some passenger messages for demo
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: '2',
        sender: 'passenger',
        content: "Hi! I'm waiting near the main entrance",
        timestamp: new Date(),
        type: 'text'
      }]);
    }, 2000);

    setMessages(initialMessages);
  }, [passengerName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'trider',
      content: content.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    onSendMessage?.(content);

    // Simulate passenger typing response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate passenger response
      const responses = [
        "Thanks for the update!",
        "Okay, I'll be right there",
        "No problem, take your time",
        "Got it, thank you!",
        "See you soon!"
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'passenger',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000 + Math.random() * 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Chat with {passengerName}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Trip #{tripId.slice(-6)}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCall}
              className="p-2 h-8 w-8"
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'trider' ? 'justify-end' : 'justify-start'
              } ${message.type === 'system' ? 'justify-center' : ''}`}
            >
              {message.type === 'system' ? (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3" />
                  <span>{message.content}</span>
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              ) : (
                <div className={`flex items-end space-x-2 max-w-[80%] ${
                  message.sender === 'trider' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {message.sender === 'trider' ? 'T' : getInitials(passengerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg px-3 py-2 ${
                    message.sender === 'trider'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(passengerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="flex-shrink-0">
          <div className="grid grid-cols-1 gap-1 mb-3">
            {quickMessages.slice(0, 2).map((message, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 justify-start"
                onClick={() => sendMessage(message)}
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                {message}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex space-x-2 flex-shrink-0">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}