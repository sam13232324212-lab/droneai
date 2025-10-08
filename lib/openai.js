import { OpenAI } from 'openai';

// Initialize OpenAI client with Emergent universal key
export const openai = new OpenAI({
  apiKey: process.env.EMERGENT_LLM_KEY,
});

// Default model for ChatGPT
export const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Generate chat completion using OpenAI
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise} - ChatGPT response
 */
export async function generateChatCompletion(messages, options = {}) {
  try {
    const model = options.model || DEFAULT_MODEL;
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    return {
      text: response.choices[0].message.content,
      usage: response.usage,
      success: true
    };
  } catch (error) {
    console.error('Error generating chat completion:', error);
    return {
      text: null,
      error: error.message,
      success: false
    };
  }
}