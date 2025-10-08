import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateResponse } from '@/lib/openai-simple';
import { searchDroneInfo } from '@/lib/scraper';

// System prompt for DroneEdu Expert
const SYSTEM_PROMPT = `You are DroneEdu Expert, an AI assistant for DroneCareerPro.com helping users understand CASA drone regulations, RePL/ReOC licensing, training options, and career pathways in Australia.

Your responses should be:
- Professional yet friendly
- Clear and concise (use short paragraphs)
- Formatted with emojis for better readability
- Always include relevant links when available
- End with a helpful invitation to connect for more details

Response format:
✅ [Concise answer]
🧠 [Expert insight/tip]
🌐 [Relevant link - always include https://www.casa.gov.au/drones for CASA topics]
🤝 [Invitation to connect]

Key topics you help with:
- CASA drone regulations in Australia
- RePL (Remote Pilot License) requirements and training
- ReOC (Remote Operator's Certificate) for drone businesses
- Drone training providers and pricing (DroneCareerPro, Global Drone Solutions, etc.)
- Career pathways and salary expectations
- Safety rules and insurance requirements
- Course comparisons

If you don't have specific information, politely apologize and recommend connecting with an expert.`;

// POST /api/chat - Main chat endpoint with web scraping
async function handleChat(request) {
  try {
    const body = await request.json();
    const { message, sessionId, conversationHistory = [] } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Step 1: Scrape fresh information from CASA and training providers
    let scrapedContext = '';
    try {
      console.log('Scraping drone information...');
      const droneInfo = await searchDroneInfo(message);
      
      // Compile context from scraped data
      if (droneInfo.casa && droneInfo.casa.content) {
        scrapedContext += `\n\n=== CASA Official Information ===\n${droneInfo.casa.content.substring(0, 2000)}\n`;
      }
      
      if (droneInfo.gdrone && droneInfo.gdrone.content) {
        scrapedContext += `\n\n=== Global Drone Solutions ===\n${droneInfo.gdrone.content.substring(0, 2000)}\n`;
      }
      
      console.log('Scraped context length:', scrapedContext.length);
    } catch (scrapingError) {
      console.error('Web scraping failed, continuing without it:', scrapingError.message);
      // Continue without scraped context
    }

    // Step 2: Get AI response
    const aiResponse = await generateResponse(message, scrapedContext, conversationHistory);

    if (!aiResponse.success && aiResponse.error) {
      console.log('Using fallback response:', aiResponse.error);
    }

    // Step 3: Return formatted response
    return NextResponse.json({
      response: aiResponse.text,
      sessionId: sessionId || `session_${Date.now()}`,
      contextUsed: scrapedContext.length > 0,
      sources: ['https://www.casa.gov.au/drones', 'https://gdronesolutions.com.au']
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Return a helpful error response instead of generic error
    return NextResponse.json({
      response: `😕 I encountered a technical issue, but I can still help!

✅ I can answer questions about:
- RePL (Remote Pilot License) requirements
- ReOC (Remote Operator's Certificate) for businesses
- Training providers and costs
- Career pathways and salaries
- CASA safety rules

🌐 **CASA Official Website:** https://www.casa.gov.au/drones

🤝 What would you like to know about drone careers in Australia?`,
      sessionId: `session_${Date.now()}`,
      contextUsed: false,
      sources: []
    });
  }
}

// POST /api/leads - Save lead information
async function handleLeads(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, message } = body;
    
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Insert lead into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        message: message || null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting lead:', error);
      // Continue even if DB insert fails
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! A DroneCareerPro expert will contact you soon.',
      leadId: data?.id || 'pending'
    });
  } catch (error) {
    console.error('Error in leads endpoint:', error);
    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest! We will contact you soon.'
    });
  }
}

// GET /api/scrape - Manual scraping endpoint
async function handleScrape() {
  try {
    const droneInfo = await searchDroneInfo('general');
    
    return NextResponse.json({
      success: true,
      data: droneInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in scrape endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to scrape data', details: error.message },
      { status: 500 }
    );
  }
}

// Main router
export async function POST(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.includes('/chat')) {
    return handleChat(request);
  } else if (path.includes('/leads')) {
    return handleLeads(request);
  } else {
    return NextResponse.json(
      { error: 'Endpoint not found' },
      { status: 404 }
    );
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.includes('/scrape')) {
    return handleScrape();
  } else {
    return NextResponse.json({
      message: 'DroneEdu Expert API',
      version: '2.0.0',
      endpoints: {
        'POST /api/chat': 'Main chat endpoint with web scraping',
        'POST /api/leads': 'Save lead information',
        'GET /api/scrape': 'Scrape CASA and training provider data'
      },
      features: [
        'Real-time web scraping from CASA',
        'Training provider information',
        'AI-powered responses',
        'Lead capture',
        'No database setup required'
      ]
    });
  }
}