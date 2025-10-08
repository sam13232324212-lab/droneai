import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/gemini';

export async function POST(request) {
  try {
    console.log('Starting embedding generation...');

    // Fetch all documents without embeddings
    const { data: docs, error: fetchError } = await supabase
      .from('rag_docs')
      .select('id, content')
      .is('embedding', null);

    if (fetchError) {
      console.error('Error fetching documents:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    if (!docs || docs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All documents already have embeddings',
        processed: 0
      });
    }

    console.log(`Found ${docs.length} documents without embeddings`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      console.log(`Processing ${i + 1}/${docs.length}: ${doc.id}`);

      try {
        // Generate embedding
        const embedding = await generateEmbedding(doc.content);

        // Update document with embedding
        const { error: updateError } = await supabase
          .from('rag_docs')
          .update({ embedding: embedding })
          .eq('id', doc.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        console.log(`✓ Success for ${doc.id}`);
        successCount++;

        // Small delay to avoid rate limits
        if (i < docs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`✗ Failed for ${doc.id}:`, error.message);
        errorCount++;
        errors.push({
          id: doc.id,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Embedding generation complete',
      processed: successCount,
      failed: errorCount,
      total: docs.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Fatal error in embedding generation:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get stats about embeddings
    const { data: total, error: totalError } = await supabase
      .from('rag_docs')
      .select('id', { count: 'exact', head: true });

    const { data: withEmbeddings, error: embeddedError } = await supabase
      .from('rag_docs')
      .select('id', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    const { data: withoutEmbeddings, error: noEmbedError } = await supabase
      .from('rag_docs')
      .select('id', { count: 'exact', head: true })
      .is('embedding', null);

    if (totalError || embeddedError || noEmbedError) {
      throw new Error('Failed to fetch stats');
    }

    return NextResponse.json({
      total: total || 0,
      with_embeddings: withEmbeddings || 0,
      without_embeddings: withoutEmbeddings || 0,
      ready: (withoutEmbeddings || 0) === 0
    });
  } catch (error) {
    console.error('Error fetching embedding stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
