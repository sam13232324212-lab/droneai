// Script to generate embeddings for RAG documents that don't have them yet
// Usage: node scripts/update-embeddings.js

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const emergentKey = process.env.EMERGENT_LLM_KEY;

if (!supabaseUrl || !supabaseAnonKey || !emergentKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, EMERGENT_LLM_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const genAI = new GoogleGenerativeAI(emergentKey);

async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

async function updateEmbeddings() {
  console.log('🚀 Starting embedding generation...\n');

  try {
    // Fetch all documents without embeddings
    const { data: docs, error: fetchError } = await supabase
      .from('rag_docs')
      .select('id, content')
      .is('embedding', null);

    if (fetchError) {
      throw new Error(`Failed to fetch documents: ${fetchError.message}`);
    }

    if (!docs || docs.length === 0) {
      console.log('✅ All documents already have embeddings!');
      return;
    }

    console.log(`📄 Found ${docs.length} documents without embeddings\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      console.log(`Processing ${i + 1}/${docs.length}: ${doc.id.substring(0, 8)}...`);

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

        console.log(`✅ Success\n`);
        successCount++;

        // Small delay to avoid rate limits
        if (i < docs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`❌ Failed: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Embedding generation complete!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
updateEmbeddings();
