import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateChatCompletion } from '@/lib/openai';
import { generateEmbedding, generateBatchEmbeddings } from '@/lib/gemini';

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
🌐 [Relevant link]
🤝 [Invitation to connect]

Key topics you help with:
- CASA drone regulations in Australia
- RePL (Remote Pilot License) requirements and training
- ReOC (Remote Operator's Certificate) for drone businesses
- Drone training providers and pricing
- Career pathways and salary expectations
- Safety rules and insurance requirements
- Course comparisons (DroneCareerPro, GDroneSolutions, etc.)

If you don't have specific information, politely apologize and recommend connecting with an expert.`;

// POST /api/chat - Main chat endpoint
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

    // Step 1: Generate embedding for the user query
    let relevantContext = [];
    try {
      const queryEmbedding = await generateEmbedding(message);
      
      // Step 2: Retrieve relevant documents from RAG
      const { data: ragResults, error: ragError } = await supabase.rpc(
        'match_rag_docs',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.3,
          match_count: 5
        }
      );
      
      if (!ragError && ragResults && ragResults.length > 0) {
        relevantContext = ragResults.map(doc => ({
          source: doc.source,
          content: doc.content,
          similarity: doc.similarity
        }));
      }
    } catch (embeddingError) {
      console.error('Error in RAG retrieval:', embeddingError);
      // Continue without RAG context
    }

    // Step 3: Prepare context for ChatGPT
    let contextText = '';
    if (relevantContext.length > 0) {
      contextText = '\n\nRelevant information from knowledge base:\n';
      relevantContext.forEach((doc, idx) => {
        contextText += `\n[${idx + 1}] From ${doc.source}:\n${doc.content}\n`;
      });
    }

    // Step 4: Build conversation messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + contextText },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Step 5: Get ChatGPT response
    const chatResponse = await generateChatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000
    });

    if (!chatResponse.success) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    // Step 6: Return formatted response
    return NextResponse.json({
      response: chatResponse.text,
      sessionId: sessionId || `session_${Date.now()}`,
      contextUsed: relevantContext.length > 0,
      sources: relevantContext.map(doc => doc.source)
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Failed to save contact information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! A DroneCareerPro expert will contact you soon.',
      leadId: data.id
    });
  } catch (error) {
    console.error('Error in leads endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/rag - Add documents to RAG
async function handleRAGAdd(request) {
  try {
    const body = await request.json();
    const { source, content, metadata = {} } = body;
    
    if (!source || !content) {
      return NextResponse.json(
        { error: 'Source and content are required' },
        { status: 400 }
      );
    }

    // Generate embedding for the content
    const embedding = await generateEmbedding(content);
    
    // Insert document with embedding
    const { data, error } = await supabase
      .from('rag_docs')
      .insert({
        source,
        content,
        metadata,
        embedding
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting RAG document:', error);
      return NextResponse.json(
        { error: 'Failed to add document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documentId: data.id
    });
  } catch (error) {
    console.error('Error in RAG add endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/rag - List RAG documents
async function handleRAGList() {
  try {
    const { data, error } = await supabase
      .from('rag_docs')
      .select('id, source, content, metadata, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RAG documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documents: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error in RAG list endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/web-search - Web search fallback
async function handleWebSearch(request) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Note: This would use the web_search_tool if implemented
    // For now, return a placeholder
    return NextResponse.json({
      results: [],
      message: 'Web search not implemented yet'
    });
  } catch (error) {
    console.error('Error in web search endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
  } else if (path.includes('/rag')) {
    return handleRAGAdd(request);
  } else if (path.includes('/web-search')) {
    return handleWebSearch(request);
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

  if (path.includes('/rag')) {
    return handleRAGList();
  } else {
    return NextResponse.json({
      message: 'DroneEdu Expert API',
      version: '1.0.0',
      endpoints: {
        'POST /api/chat': 'Main chat endpoint',
        'POST /api/leads': 'Save lead information',
        'POST /api/rag': 'Add documents to RAG',
        'GET /api/rag': 'List RAG documents'
      }
    });
  }
}