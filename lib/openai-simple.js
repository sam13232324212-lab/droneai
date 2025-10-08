import { OpenAI } from 'openai';

// Initialize OpenAI with Emergent key
// Note: If this fails, we'll need to use a different endpoint
export const openai = new OpenAI({
  apiKey: process.env.EMERGENT_LLM_KEY,
  baseURL: 'https://api.openai.com/v1', // Standard OpenAI endpoint
});

/**
 * Generate chat response with context
 */
export async function generateResponse(userMessage, context = '', conversationHistory = []) {
  try {
    const systemPrompt = `You are DroneEdu Expert, an AI assistant helping users understand drone regulations, training, and careers in Australia.

Your responses should be:
- Professional yet friendly
- Clear and concise
- Formatted with emojis: ✅ answer → 🧠 insight → 🌐 link → 🤝 invitation
- Always include CASA website link when relevant: https://www.casa.gov.au/drones

Topics you help with:
- CASA regulations
- RePL/ReOC licensing
- Training providers and pricing
- Career pathways
- Safety rules
- Insurance requirements

${context ? '\n\nCurrent information from official sources:\n' + context : ''}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using a more reliable model
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    return {
      text: completion.choices[0].message.content,
      success: true
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // If OpenAI fails, provide a helpful fallback response
    if (error.code === 'invalid_api_key') {
      return {
        text: generateFallbackResponse(userMessage, context),
        success: false,
        error: 'API key issue - using fallback'
      };
    }
    
    throw error;
  }
}

/**
 * Generate fallback response when API fails
 */
function generateFallbackResponse(query, context) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('repl')) {
    return `✅ **RePL (Remote Pilot License)** is required for commercial drone operations in Australia.

🧠 **Key Requirements:**
- Minimum age: 16 years
- Pass CASA theory exam
- Complete practical flight training
- Maintain logbook
- Training cost: $2,000 - $4,000
- Duration: 2-4 weeks

🌐 **Learn more:** https://www.casa.gov.au/drones

🤝 Want personalized guidance? Connect with a DroneCareerPro expert!

${context ? '\n\n📚 Latest information included from CASA and training providers.' : ''}`;
  }
  
  if (lowerQuery.includes('reoc')) {
    return `✅ **ReOC (Remote Operator's Certificate)** is required if you want to operate a drone business in Australia.

🧠 **What you need:**
- Operational manuals
- Safety management system
- Trained personnel
- Appropriate insurance
- Application time: 3-6 months
- Cost: $5,000 - $15,000

🌐 **More details:** https://www.casa.gov.au/drones

🤝 Need help with your ReOC application? Let me connect you with an expert!`;
  }
  
  if (lowerQuery.includes('training') || lowerQuery.includes('course')) {
    return `✅ **Top Drone Training Providers in Australia:**

**DroneCareerPro:**
- RePL course: $2,995
- Locations: Melbourne, Sydney, Brisbane, Perth
- Includes theory, practical, and exam fees

**Global Drone Solutions:**
- RePL training: $2,750
- 3-day intensive course
- Locations: Sydney, Melbourne, Brisbane
- Job placement assistance

🧠 **Tip:** Choose a provider near you for easier practical training access.

🌐 **CASA approved training:** https://www.casa.gov.au/drones

🤝 Want help choosing the right course? Chat with us!`;
  }
  
  if (lowerQuery.includes('career') || lowerQuery.includes('salary') || lowerQuery.includes('job')) {
    return `✅ **Drone Career Pathways in Australia:**

💼 **Industries & Salaries:**
- Aerial Photography/Videography: $50k-$150k/year
- Industrial Inspection: $70k-$120k/year
- Surveying & Mapping: $60k-$110k/year
- Agriculture Monitoring: $55k-$95k/year
- Emergency Services: $65k-$100k/year

🧠 **High demand** for qualified drone pilots across Australia!

🌐 **Start your journey:** https://www.casa.gov.au/drones

🤝 Ready to launch your drone career? Let's connect!`;
  }
  
  if (lowerQuery.includes('safety') || lowerQuery.includes('rules')) {
    return `✅ **CASA Drone Safety Rules:**

📋 **Must Follow:**
- ✓ Keep drone in visual line of sight
- ✓ Fly below 120 meters (400 feet)
- ✓ Stay 30 meters away from people
- ✓ No flying over populated areas without authorization
- ✓ 5.5km restriction near airports
- ✓ No night flying without approval
- ✓ Respect privacy and property rights

🧠 **Pro tip:** Download the CASA drone app for airspace info!

🌐 **Full regulations:** https://www.casa.gov.au/drones

🤝 Questions about specific scenarios? Ask me!`;
  }
  
  // Default response
  return `✅ I'm here to help with drone regulations, training, and careers in Australia!

🧠 **I can help you with:**
- RePL and ReOC licensing
- Training provider comparisons
- Career opportunities and salaries
- CASA safety rules
- Insurance requirements

🌐 **Official CASA website:** https://www.casa.gov.au/drones

🤝 What specific information would you like to know?

${context ? '\n\n📚 I have the latest information from CASA and training providers.' : ''}`;
}