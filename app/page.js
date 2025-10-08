'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Plane, CheckCircle2, Menu, Plus, MessageSquare, Trash2, Edit2, X, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DroneEduExpert() {
  // Chat History State
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Current Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Lead Form State
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [lastShownAt, setLastShownAt] = useState(0);
  
  const [leadForm, setLeadForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const scrollRef = useRef(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('droneEduConversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      
      // Load the most recent conversation
      if (parsed.length > 0) {
        const mostRecent = parsed[0];
        setCurrentConversationId(mostRecent.id);
        setMessages(mostRecent.messages);
        setSessionId(mostRecent.sessionId);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('droneEduConversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Show lead form after every 3 helpful responses
  useEffect(() => {
    if (!leadSubmitted && !showLeadForm) {
      const messagesSinceLastShown = messageCount - lastShownAt;
      
      if (messagesSinceLastShown >= 3) {
        const timer = setTimeout(() => {
          setShowLeadForm(true);
          setLastShownAt(messageCount);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [messageCount, leadSubmitted, showLeadForm, lastShownAt]);

  // Create new conversation
  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{
        role: 'assistant',
        content: '👋 Hi there! I\'m your DroneEdu Expert.\n\nI can help you understand CASA drone regulations, RePL/ReOC licensing, training options, career pathways, and everything you need to start your drone career in Australia.\n\n**What would you like to know?**'
      }],
      sessionId: `session_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    setMessages(newConversation.messages);
    setSessionId(newConversation.sessionId);
    setMessageCount(0);
    setInput('');
  };

  // Switch conversation
  const switchConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setSessionId(conversation.sessionId);
      
      // Count user messages for lead form logic
      const userMessageCount = conversation.messages.filter(m => m.role === 'assistant' && m.content !== conversation.messages[0].content).length;
      setMessageCount(userMessageCount);
    }
  };

  // Delete conversation
  const deleteConversation = (conversationId, e) => {
    e.stopPropagation();
    
    const filtered = conversations.filter(c => c.id !== conversationId);
    setConversations(filtered);
    
    // If we deleted the current conversation, create a new one
    if (conversationId === currentConversationId) {
      if (filtered.length > 0) {
        switchConversation(filtered[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  // Update conversation title based on first message
  const updateConversationTitle = (conversationId, firstUserMessage) => {
    setConversations(convs => 
      convs.map(conv => {
        if (conv.id === conversationId && conv.title === 'New Chat') {
          // Use first 40 characters of user message as title
          const title = firstUserMessage.length > 40 
            ? firstUserMessage.substring(0, 40) + '...'
            : firstUserMessage;
          return { ...conv, title, updatedAt: new Date().toISOString() };
        }
        return conv;
      })
    );
  };

  // Send message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // Update conversation title if it's the first message
    if (messages.length === 1) {
      updateConversationTitle(currentConversationId, userMessage);
    }

    try {
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

      const assistantMessage = {
        role: 'assistant',
        content: data.response || '😕 I apologize for the technical issue. Please try rephrasing your question.'
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Update conversation in history
      setConversations(convs =>
        convs.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: updatedMessages,
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        })
      );

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      setMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '**Connection Error**\n\nI\'m having trouble connecting right now. Please try again.'
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle lead form submission
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
      
      const confirmationMessage = {
        role: 'assistant',
        content: `**Thank you, ${leadForm.firstName}!** 🎉\n\nA DroneCareerPro expert will contact you soon at:\n**${leadForm.email}**\n\nFeel free to continue asking questions while you wait!`
      };
      
      const updatedMessages = [...messages, confirmationMessage];
      setMessages(updatedMessages);
      
      // Update conversation
      setConversations(convs =>
        convs.map(conv => {
          if (conv.id === currentConversationId) {
            return { ...conv, messages: updatedMessages };
          }
          return conv;
        })
      );

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
    }
  };

  // Initialize with a conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, []);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  
  // Check if we should show dashboard (only 1 message = welcome message)
  const showDashboard = messages.length <= 1;

  // Quick prompts for dashboard
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Only show when not on dashboard */}
      <AnimatePresence>
        {sidebarOpen && !showDashboard && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-80 bg-gray-900 text-white flex flex-col border-r border-gray-700"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700">
              <Button
                onClick={createNewConversation}
                className="w-full bg-white text-gray-900 hover:bg-gray-100 flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Chat</span>
              </Button>
            </div>

            {/* Chat History */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => switchConversation(conv.id)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                      conv.id === currentConversationId
                        ? 'bg-gray-700'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Plane className="w-4 h-4" />
                <span>DroneEdu Expert</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Only show when not on dashboard */}
        {!showDashboard && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {currentConversation?.title || 'DroneEdu Expert'}
                  </h1>
                  <p className="text-xs text-gray-500">Australian Drone Career Assistant</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard View - Show when no messages yet */}
        {showDashboard ? (
          <div className="flex-1 flex flex-col">
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
                  {conversations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </header>

            {/* Dashboard Content */}
            <ScrollArea className="flex-1">
              <div className="container mx-auto px-6 py-8 max-w-6xl">
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
              </div>
            </ScrollArea>

            {/* Input Area - Dashboard Style */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-4xl mx-auto">
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
                    <div className="flex items-center justify-center text-xs text-gray-500">
                      <span>Powered by AI • Data from CASA & training providers</span>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat View - Show when conversation started */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-4xl mx-auto space-y-6">
                <AnimatePresence>
                  {messages.map((message, index) => (
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
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}>
                        <div className="prose prose-sm max-w-none">
                          {message.content.split('\n').map((line, i) => {
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
                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                              return (
                                <li key={i} className={`ml-4 mb-1 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                                  {line.replace(/^[•-]\s*/, '')}
                                </li>
                              );
                            }
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
                            if (line.trim() === '') {
                              return <div key={i} className="h-2" />;
                            }
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
                  <div className="bg-white border border-gray-200 p-4 rounded-2xl">
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

            {/* Input Area - Chat Style */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-4xl mx-auto">
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
                    placeholder="Message DroneEdu Expert..."
                    className="flex-1 text-base border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by AI • Information from CASA & training providers
                </p>
              </div>
            </div>
          </>
        )}
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
              {lastShownAt > 0 
                ? "Still have questions? Let our experts provide personalized guidance for your drone career journey."
                : "Get personalized guidance from a DroneCareerPro expert. We'll help you find the right training path for your goals."
              }
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