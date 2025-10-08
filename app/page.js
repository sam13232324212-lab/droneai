'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Plane, CheckCircle2, Sparkles, BookOpen, TrendingUp, Building2, Shield, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DroneEduExpert() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi there! I\'m your DroneEdu Expert.\n\nI can help you understand CASA drone regulations, RePL/ReOC licensing, training options, career pathways, and everything you need to start your drone career in Australia.\n\n**I provide:**\n- Current information from CASA official sources\n- Training provider comparisons\n- Career guidance and salary insights\n- Location-specific recommendations\n\n**What would you like to know?**'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [userLocation, setUserLocation] = useState('');
  
  const [leadForm, setLeadForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Show lead form after 3 helpful responses
  useEffect(() => {
    if (messageCount >= 3 && !leadSubmitted && !showLeadForm) {
      const timer = setTimeout(() => {
        setShowLeadForm(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messageCount, leadSubmitted, showLeadForm]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Get conversation history (last 5 messages for context)
      const conversationHistory = newMessages.slice(-6, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
          conversationHistory: conversationHistory,
          userLocation: userLocation || 'Australia'
        }),
      });

      const data = await response.json();

      // Always add the response, even if there's an error
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.response || '😕 I apologize for the technical issue. Please try rephrasing your question or ask about:\n\n• RePL licensing requirements\n• ReOC certification process\n• Training provider comparisons\n• Career opportunities and salaries\n• CASA safety regulations\n\n**Official CASA Website:** https://www.casa.gov.au/drones'
      }]);

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      setMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: '**Connection Error**\n\nI\'m having trouble connecting right now. Here are some quick answers:\n\n**RePL (Remote Pilot License):**\n- Required for commercial drone operations\n- Cost: $2,000 - $4,000\n- Duration: 2-4 weeks\n- Available nationwide\n\n**Training Providers:**\n- DroneCareerPro: $2,995\n- Global Drone Solutions: $2,750\n\n**Official Information:** https://www.casa.gov.au/drones\n\nPlease try your question again, or I can connect you with an expert.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadForm),
      });

      setLeadSubmitted(true);
      setShowLeadForm(false);
      
      // Add confirmation message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Thank you, ${leadForm.firstName}!** 🎉\n\nA DroneCareerPro expert will contact you soon at:\n**${leadForm.email}**\n\nFeel free to continue asking questions while you wait. I\'m here to help!`
      }]);

      // Reset form
      setLeadForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      setShowLeadForm(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '**Thank you for your interest!**\n\nWe\'ve received your information and will be in touch soon.'
      }]);
    }
  };

  const quickPrompts = [
    { 
      icon: BookOpen, 
      title: 'RePL Requirements', 
      query: 'What are the requirements to get a RePL in Australia?',
      subtitle: 'Licensing & certification'
    },
    { 
      icon: Building2, 
      title: 'Training Providers', 
      query: 'Compare drone training providers in Australia with pricing',
      subtitle: 'Courses & prices'
    },
    { 
      icon: TrendingUp, 
      title: 'Career Opportunities', 
      query: 'What career opportunities are available for drone pilots in Australia?',
      subtitle: 'Jobs & salaries'
    },
    { 
      icon: Shield, 
      title: 'CASA Regulations', 
      query: 'What are the main CASA safety rules for flying drones in Australia?',
      subtitle: 'Safety & compliance'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2.5 rounded-xl">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DroneEdu Expert</h1>
                <p className="text-sm text-gray-500">Australian Drone Career Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold mb-3">
              <span className="text-gray-800">Hi there,</span>{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                aspiring pilot
              </span>
            </h2>
            <h3 className="text-2xl font-medium text-gray-700 mb-3">
              What would you like to know?
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Use one of the common prompts below or ask your own question
            </p>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {quickPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  onClick={() => setInput(prompt.query)}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-300 transition-all text-left"
                >
                  <div className="flex flex-col items-start space-y-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <prompt.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{prompt.title}</h4>
                      <p className="text-xs text-gray-500">{prompt.subtitle}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-500 hover:text-purple-600 flex items-center justify-center mx-auto space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Refresh Prompts</span>
            </button>
          </motion.div>
        )}

        {/* Chat Messages */}
        {messages.length > 1 && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <ScrollArea className="h-[calc(100vh-350px)] p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                <AnimatePresence>
                  {messages.slice(1).map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-blue-600' 
                            : 'bg-gradient-to-br from-purple-600 to-blue-600'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-white" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block text-left p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-50 text-gray-800 border border-gray-100'
                          }`}>
                            <div className="prose prose-sm max-w-none">
                              {message.content.split('\n').map((line, i) => {
                                // Bold text with **
                                if (line.includes('**')) {
                                  const parts = line.split('**');
                                  return (
                                    <p key={i} className={`mb-2 last:mb-0 ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                                      {parts.map((part, j) => 
                                        j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
                                      )}
                                    </p>
                                  );
                                }
                                // Bullet points
                                if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                                  return (
                                    <li key={i} className={`ml-4 mb-1 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                                      {line.replace(/^[•-]\s*/, '')}
                                    </li>
                                  );
                                }
                                // Links
                                if (line.includes('http')) {
                                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                                  const parts = line.split(urlRegex);
                                  return (
                                    <p key={i} className={`mb-2 last:mb-0 ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                                      {parts.map((part, j) => 
                                        urlRegex.test(part) ? 
                                          <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">
                                            {part}
                                          </a> : part
                                      )}
                                    </p>
                                  );
                                }
                                // Empty lines
                                if (line.trim() === '') {
                                  return <div key={i} className="h-2" />;
                                }
                                // Regular text
                                return (
                                  <p key={i} className={`mb-2 last:mb-0 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                                    {line}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* Input Area */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="space-y-3"
          >
            <div className="flex space-x-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask whatever you want..."
                className="flex-1 text-base border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <button type="button" className="hover:text-purple-600 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>Add Location</span>
                </button>
              </div>
              <span>Powered by AI • Data from CASA & training providers</span>
            </div>
          </form>
        </Card>
      </div>

      {/* Lead Capture Dialog */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
              <span>Connect with an Expert</span>
            </DialogTitle>
            <DialogDescription>
              Get personalized guidance from a DroneCareerPro expert. We'll help you find the right training path for your goals.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name</label>
                <Input
                  value={leadForm.firstName}
                  onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                <Input
                  value={leadForm.lastName}
                  onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                  placeholder="Smith"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Phone (Optional)</label>
              <Input
                type="tel"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                placeholder="+61 4XX XXX XXX"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Message (Optional)</label>
              <Input
                value={leadForm.message}
                onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                placeholder="Tell us about your goals..."
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Connect Now
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowLeadForm(false)}
              >
                Later
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}