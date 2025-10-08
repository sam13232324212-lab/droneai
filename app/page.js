'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Plane, CheckCircle2, Sparkles, Globe, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DroneEduExpert() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 G\'day! I\'m DroneEdu Expert, your AI guide to drone careers in Australia.\n\n✨ Ask me about CASA regulations, RePL/ReOC licensing, training providers, or career opportunities!\n\n🚁 I scrape live data from CASA and training providers to give you the most current information.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  
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
          conversationHistory: conversationHistory
        }),
      });

      const data = await response.json();

      // Always add the response, even if there's an error
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.response || '😕 Sorry, I encountered an error. Please try again.'
      }]);

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      setMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: '😕 Connection error. Please check your internet and try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadForm),
      });

      const data = await response.json();

      setLeadSubmitted(true);
      setShowLeadForm(false);
      
      // Add confirmation message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🎉 Thanks ${leadForm.firstName}! A DroneCareerPro expert will contact you soon at ${leadForm.email}.\n\n✅ Feel free to keep asking questions while you wait!`
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
      alert('Thank you! We\'ve received your information.');
      setShowLeadForm(false);
    }
  };

  const quickActions = [
    { icon: BookOpen, text: 'What is RePL?', query: 'What is a RePL and how do I get one?' },
    { icon: TrendingUp, text: 'Career Pathways', query: 'What are the career opportunities for drone pilots in Australia?' },
    { icon: Globe, text: 'Training Providers', query: 'Compare drone training providers in Australia' },
    { icon: Sparkles, text: 'CASA Rules', query: 'What are the CASA safety rules for drones?' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background  elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header with glassmorphism */}
      <header className="relative backdrop-blur-md bg-white/5 border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">DroneEdu Expert</h1>
                <p className="text-sm text-blue-200">AI-Powered Australian Drone Career Guide</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-xs text-blue-200">
              <Sparkles className="w-4 h-4" />
              <span>Live data from CASA & training providers</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Glassmorphism card */}
        <Card className="h-[calc(100vh-280px)] flex flex-col shadow-2xl backdrop-blur-xl bg-white/10 border-white/20">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {/* Avatar with glow effect */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/50' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/50'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-6 h-6 text-white" />
                      ) : (
                        <Bot className="w-6 h-6 text-white" />
                      )}
                    </motion.div>

                    {/* Message Bubble with glassmorphism */}
                    <div className={`flex-1 max-w-[85%] ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`inline-block p-5 rounded-2xl backdrop-blur-md shadow-xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            : 'bg-white/90 text-gray-800 border border-white/20'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator with better animation */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/20">
                    <div className="flex space-x-2">
                      <motion.div
                        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area with glassmorphism */}
          <CardContent className="border-t border-white/10 backdrop-blur-md bg-white/5 p-6">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex space-x-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about RePL, training, careers, or regulations..."
                className="flex-1 text-base bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-white/50 mt-3 text-center">
              🌐 Live data from CASA • Powered by AI • Information verified with official sources
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions with glassmorphism */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInput(action.query)}
              className="flex items-center space-x-2 p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all shadow-lg text-white text-sm"
            >
              <action.icon className="w-5 h-5 text-blue-300" />
              <span>{action.text}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lead Capture Dialog */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/95">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
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
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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