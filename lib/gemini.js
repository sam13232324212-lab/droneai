import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client with Emergent universal key
const genAI = new GoogleGenerativeAI(process.env.EMERGENT_LLM_KEY);

/**
 * Generate embedding using Gemini
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Array of texts
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function generateBatchEmbeddings(texts) {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const embeddings = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => model.embedContent(text));
      const batchResults = await Promise.all(batchPromises);
      
      embeddings.push(...batchResults.map(result => result.embedding.values));
      
      // Add delay between batches
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return embeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
}