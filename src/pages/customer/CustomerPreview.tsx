import { useState, useEffect, useRef } from 'react';
import { useCustomerOnboarding } from '@/hooks/useCustomerOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, MessageSquare, Mic, MicOff, Send, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CustomerPreview() {
  const { customerProfile, isLoading } = useCustomerOnboarding();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<any>(null);
  const [chatSettings, setChatSettings] = useState<any>(null);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerProfile?.id) return;

      // Fetch phone number
      const { data: phoneData } = await supabase
        .from('customer_phone_numbers')
        .select('phone_number')
        .eq('customer_id', customerProfile.id)
        .maybeSingle();
      
      if (phoneData) setPhoneNumber(phoneData.phone_number);

      // Fetch voice settings
      const { data: voiceData } = await supabase
        .from('voice_settings')
        .select('*')
        .eq('customer_id', customerProfile.id)
        .maybeSingle();
      
      if (voiceData) setVoiceSettings(voiceData);

      // Fetch chat settings
      const { data: chatData } = await supabase
        .from('chat_settings')
        .select('*')
        .eq('customer_id', customerProfile.id)
        .maybeSingle();
      
      if (chatData) setChatSettings(chatData);
    };

    fetchCustomerData();
  }, [customerProfile?.id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isChatLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      // Build system prompt from customer settings
      const businessName = customerProfile?.business_name || 'the business';
      const greeting = chatSettings?.greeting_text || `Hello! Welcome to ${businessName}. How can I help you today?`;
      const tone = chatSettings?.tone || 'professional';
      const instructions = chatSettings?.instructions || '';

      const systemPrompt = `You are a helpful AI assistant for ${businessName}. 
Your tone is ${tone}.
${instructions ? `Additional instructions: ${instructions}` : ''}
If this is the start of the conversation, greet with: "${greeting}"`;

      const { data, error } = await supabase.functions.invoke('demo-chat', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        }
      });

      if (error) throw error;

      const assistantMessage = data?.response || 'I apologize, but I encountered an issue. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCallPhone = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error('No phone number assigned yet');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Preview Your AI</h1>
        <p className="text-muted-foreground mt-2">
          Test your AI assistant before going live. Try the chat or call your AI phone number.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Chat Preview */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat Preview
            </CardTitle>
            <CardDescription>
              Test your AI's chat responses
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation to test your AI</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleListening}
                  className={isListening ? 'bg-red-500/10 text-red-500' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isChatLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {isListening && (
                <p className="text-xs text-red-500 mt-2 animate-pulse">Listening...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voice/Phone Preview */}
        <Card className="h-[600px]">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Voice Preview
            </CardTitle>
            <CardDescription>
              Call your AI phone number to test voice interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[calc(100%-88px)] p-8">
            {phoneNumber ? (
              <div className="text-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Phone className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your AI Phone Number</p>
                  <p className="text-3xl font-mono font-bold text-primary">{phoneNumber}</p>
                </div>
                <Button size="lg" className="gap-2" onClick={handleCallPhone}>
                  <Phone className="h-5 w-5" />
                  Call Now
                </Button>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Call this number from your phone to experience your AI assistant exactly as your customers will.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Phone className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No phone number assigned yet.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/customer/settings/deploy'}>
                  Set Up Phone Number
                </Button>
              </div>
            )}

            {/* Voice Settings Summary */}
            {voiceSettings && (
              <div className="mt-8 p-4 bg-muted/50 rounded-lg w-full max-w-sm">
                <h4 className="font-medium mb-2 text-sm">Voice Configuration</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Voice: {voiceSettings.voice_gender || 'Default'}</p>
                  <p>Style: {voiceSettings.voice_style || 'Professional'}</p>
                  <p>Pace: {voiceSettings.response_pace || 'Normal'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
