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
  
  // Check for location mentions
  const locationMatch = query.match(/(?:in|near|at|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const hasLocation = lowerQuery.includes('sydney') || lowerQuery.includes('melbourne') || 
                     lowerQuery.includes('brisbane') || lowerQuery.includes('perth') ||
                     lowerQuery.includes('adelaide') || lowerQuery.includes('location') || locationMatch;
  
  if (lowerQuery.includes('repl')) {
    let response = `**Remote Pilot License (RePL) - Your Path to Commercial Drone Flying**

**What is RePL?**
The Remote Pilot License (RePL) is your official CASA certification that allows you to operate drones commercially in Australia. Think of it as your drone pilot's license - without it, you can only fly recreationally.

**Requirements & Process:**

**Age & Prerequisites:**
• Must be at least 16 years old
• No prior aviation experience needed
• Good understanding of English (for safety communications)
• Basic understanding of meteorology and airspace

**Training Components:**
1. **Theory Training** (20-30 hours)
   - Aviation law and regulations
   - Meteorology basics
   - Aerodynamics and drone systems
   - Human factors and safety management
   - Navigation and flight planning

2. **Practical Training** (5-10 hours minimum)
   - Pre-flight checks and procedures
   - Basic flight maneuvers
   - Emergency procedures
   - Night operations (if applicable)
   - Advanced handling techniques

3. **Assessment**
   - Written examination (CASA-approved)
   - Practical flight test with certified instructor
   - Logbook verification

**Investment Details:**
• **Cost Range:** $2,000 - $4,000 AUD
  - Budget providers: $2,000 - $2,500
  - Mid-range: $2,500 - $3,200
  - Premium courses: $3,200 - $4,000

• **Timeline:** 2-4 weeks (intensive) or 6-12 weeks (part-time)

**What's Included:**
✓ All training materials and manuals
✓ Online theory modules access
✓ Practical flight time with instructor
✓ Drone equipment usage during training
✓ CASA examination fees (usually)
✓ Initial logbook
✓ Certificate upon completion`;

    if (hasLocation) {
      response += `\n\n**Training Locations:**
To provide specific training center recommendations, could you let me know which city you're in or closest to? Major training hubs include:
• Sydney & NSW region
• Melbourne & VIC region
• Brisbane & QLD region
• Perth & WA region
• Adelaide & SA region

This helps me recommend the most convenient and relevant options for you.`;
    }

    response += `\n\n**After You Get Your RePL:**
• Operate drones up to 25kg commercially
• Fly within standard operating conditions
• Work for drone service companies
• Start your own drone business (with ReOC)
• Upgrade to advanced ratings (night ops, BVLOS)

**Official CASA Information:**
🌐 https://www.casa.gov.au/drones

**Ready to Start?**
I can connect you with a DroneCareerPro expert who can provide personalized course recommendations and answer specific questions about your situation.`;

    return response;
  }
  
  if (lowerQuery.includes('reoc')) {
    return `**Remote Operator's Certificate (ReOC) - Operating Your Drone Business**

**What is ReOC?**
The Remote Operator's Certificate (ReOC) is CASA's approval that allows you to operate a commercial drone business in Australia. While RePL lets you fly commercially, ReOC lets you run drone operations as a business and employ other pilots.

**Do You Need ReOC?**

**You NEED ReOC if you:**
• Want to operate your own drone services business
• Plan to employ other drone pilots
• Need to conduct operations outside standard conditions
• Require approval for complex or high-risk operations
• Want to fly beyond visual line of sight (BVLOS)
• Need to operate at night regularly

**You DON'T need ReOC if you:**
• Work as an employee for a company with ReOC
• Fly recreationally only
• Do simple commercial work under someone else's ReOC

**ReOC Requirements:**

**Prerequisites:**
• Must hold a valid RePL first
• Demonstrated operational experience
• Understanding of safety management systems
• Business structure (company/sole trader)

**Documentation Needed:**
1. **Operations Manual**
   - Standard operating procedures
   - Emergency procedures
   - Maintenance schedules
   - Training procedures
   - Risk management processes

2. **Safety Management System (SMS)**
   - Hazard identification processes
   - Risk assessment methodologies
   - Safety reporting procedures
   - Safety performance monitoring

3. **Insurance Coverage**
   - Public liability (minimum $10 million recommended)
   - Hull insurance for equipment
   - Professional indemnity (advised)

4. **Personnel**
   - Chief Remote Pilot qualifications
   - Pilot training records
   - Staff competency framework

**Application Process:**

**Stage 1: Preparation** (1-2 months)
• Develop operations manual
• Establish SMS framework
• Arrange insurance coverage
• Document procedures and policies

**Stage 2: Application** (4-8 weeks)
• Submit application to CASA
• Provide all documentation
• Pay application fees
• CASA initial review

**Stage 3: Assessment** (4-8 weeks)
• CASA detailed document review
• Possible site inspection
• Interview with key personnel
• Request for additional information

**Stage 4: Approval** (2-4 weeks)
• Final CASA decision
• Certificate issuance
• Ongoing compliance obligations

**Total Timeline:** 3-6 months on average

**Investment:**
• **DIY Approach:** $5,000 - $8,000
  - Application fees
  - Insurance setup
  - Manual development time
  - Your own effort and research

• **Consultant-Assisted:** $10,000 - $15,000
  - Professional manual preparation
  - SMS development
  - Application management
  - Higher success rate

• **Full-Service Packages:** $15,000 - $25,000+
  - Complete documentation
  - CASA liaison
  - Staff training
  - Ongoing compliance support

**Ongoing Obligations:**
• Annual compliance reporting
• Safety management system maintenance
• Staff training records
• Equipment maintenance logs
• Insurance renewals
• Operations manual updates

**Common Mistakes to Avoid:**
• Incomplete operations manuals
• Inadequate SMS documentation
• Underestimating preparation time
• Poor risk assessment documentation
• Insufficient insurance coverage

**Official CASA Information:**
🌐 https://www.casa.gov.au/drones

**Expert Guidance Available:**
The ReOC process can be complex. I can connect you with specialists who have successfully guided hundreds of operators through the certification process.`;
  }
  
  if (lowerQuery.includes('training') || lowerQuery.includes('course') || lowerQuery.includes('provider') || lowerQuery.includes('compare')) {
    let response = `**Australian Drone Training Providers - Comprehensive Comparison**

**Top CASA-Approved Training Organizations:**

**1. DroneCareerPro**
📍 **Locations:** Melbourne, Sydney, Brisbane, Perth
💰 **Price:** $2,995 (all-inclusive)

**What's Included:**
• Comprehensive online theory modules (20+ hours)
• In-person practical training (2-3 days)
• All course materials and textbooks
• CASA examination fees
• Equipment usage during training
• Post-course support and mentorship
• Industry networking opportunities

**Course Structure:**
• Self-paced online learning (2-3 weeks)
• Weekend intensive practical sessions
• Small group sizes (max 6 students)
• Focus on real-world applications

**Specializations Available:**
• Aerial photography & videography
• Industrial inspection
• Agricultural monitoring
• Surveying and mapping

**Best For:**
Those seeking comprehensive career support and industry connections

---

**2. Global Drone Solutions**
📍 **Locations:** Sydney, Melbourne, Brisbane
💰 **Price:** $2,750

**What's Included:**
• 3-day intensive course format
• Theory and practical combined
• Online modules for pre-study
• Exam preparation workshops
• Equipment provided during training
• Job placement assistance
• Ongoing mentor support

**Course Structure:**
• Pre-course online theory (1 week)
• 3 consecutive days in-person
• Hands-on from day one
• Fast-track option available

**Unique Features:**
• Strong industry partnerships
• Job board access for graduates
• Equipment purchase discounts
• Business setup guidance

**Best For:**
Those wanting quick certification and job placement support

---

**3. Australian Drone Academy**
📍 **Locations:** All capital cities
💰 **Price:** $2,200 - $3,500 (varies by location)

**What's Included:**
• Flexible scheduling options
• Weekend and weekday courses
• Theory materials and resources
• Practical flight training
• Exam registration assistance

**Best For:**
Budget-conscious students or those needing flexible schedules

---

**4. Drone Training Australia**
📍 **Locations:** Regional centers + capital cities
💰 **Price:** $2,400 - $3,200

**What's Included:**
• Regional access (great for rural students)
• Practical training in various environments
• Agricultural drone specialization
• Industry-specific modules

**Best For:**
Regional students or those interested in agricultural applications

---

**Choosing the Right Provider:**

**Consider These Factors:**
1. **Location & Convenience**
   - Travel time and costs
   - Training environment (urban vs regional)
   - Accommodation if needed

2. **Course Format**
   - Intensive (3-5 days) vs Extended (2-4 weeks)
   - Online vs in-person balance
   - Weekend vs weekday availability

3. **Post-Course Support**
   - Job placement assistance
   - Industry connections
   - Ongoing mentorship
   - Equipment advice

4. **Specializations**
   - Aerial photography
   - Industrial inspection
   - Agriculture
   - Surveying
   - Emergency services

5. **Additional Value**
   - Industry networking events
   - Equipment purchase discounts
   - Business startup guidance
   - Advanced training pathways`;

    if (hasLocation) {
      response += `\n\n**Location-Specific Recommendation:**
You mentioned a location. To give you the most relevant recommendation, which city are you in or near? I can provide specific training centers, upcoming course dates, and local market insights for your area.`;
    } else {
      response += `\n\n**Need Location-Specific Info?**
Let me know which city you're in or planning to train in, and I'll provide:
• Nearby training centers with upcoming dates
• Local drone industry insights
• Regional career opportunities
• Best value options for your area`;
    }

    response += `\n\n**All providers are CASA-approved and will qualify you for RePL certification.**

**Official CASA Training Information:**
🌐 https://www.casa.gov.au/drones

**Ready to Choose?**
I can connect you with a DroneCareerPro advisor who can provide personalized recommendations based on your:
• Location and schedule
• Budget and financing options
• Career goals and interests
• Prior experience level`;

    return response;
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