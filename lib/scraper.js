import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape CASA drone regulations
 */
export async function scrapeCASA() {
  try {
    const url = 'https://www.casa.gov.au/drones';
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const content = [];
    
    // Extract main content
    $('p, h1, h2, h3, li').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 20) {
        content.push(text);
      }
    });
    
    return {
      source: 'CASA',
      url: url,
      content: content.join('\n'),
      success: true
    };
  } catch (error) {
    console.error('Error scraping CASA:', error.message);
    return {
      source: 'CASA',
      url: 'https://www.casa.gov.au/drones',
      content: getCASAFallbackContent(),
      success: false,
      error: error.message
    };
  }
}

/**
 * Scrape Global Drone Solutions
 */
export async function scrapeGlobalDroneSolutions() {
  try {
    const url = 'https://gdronesolutions.com.au';
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const content = [];
    
    // Extract main content
    $('p, h1, h2, h3, li').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 20) {
        content.push(text);
      }
    });
    
    return {
      source: 'Global Drone Solutions',
      url: url,
      content: content.join('\n'),
      success: true
    };
  } catch (error) {
    console.error('Error scraping Global Drone Solutions:', error.message);
    return {
      source: 'Global Drone Solutions',
      url: 'https://gdronesolutions.com.au',
      content: getGDroneFallbackContent(),
      success: false,
      error: error.message
    };
  }
}

/**
 * Get fallback CASA content if scraping fails
 */
function getCASAFallbackContent() {
  return `CASA Drone Regulations in Australia:

RePL (Remote Pilot License):
- Required for commercial drone operations
- Must be at least 16 years old
- Pass theory exam and practical training
- Cost: $2,000 - $4,000 depending on provider
- Training duration: 2-4 weeks

ReOC (Remote Operator's Certificate):
- Required for drone businesses
- Demonstrates safety management systems
- Application process: 3-6 months
- Cost: $5,000 - $15,000

Safety Rules:
- Keep drone in visual line of sight
- Fly below 120 meters (400 feet)
- Keep 30 meters away from people
- No flying over populated areas without authorization
- 5.5km restriction near airports
- No night flying without approval
- Respect privacy and property rights

Insurance:
- Mandatory for commercial operations
- Public liability minimum $10 million recommended
- Annual cost: $500 - $3,000

For more information: https://www.casa.gov.au/drones`;
}

/**
 * Get fallback GDrone content if scraping fails
 */
function getGDroneFallbackContent() {
  return `Global Drone Solutions Australia:

RePL Training:
- Price: $2,750 (all-inclusive)
- 3-day intensive course format
- Pre-course online theory modules
- Comprehensive practical flight training
- CASA examination fees included
- Professional equipment provided
- Available across Australia

Locations:
- Training centers nationwide
- All capital cities covered
- Regional training available
- Mobile training units for remote areas

Course Features:
- Hands-on training with professional equipment
- Experienced CASA-approved instructors
- Small class sizes for personalized attention
- Industry-recognized certification
- Fast-track certification option
- Real-world scenario training

Post-Course Support:
- 3-month mentorship program
- Job placement assistance
- Graduate job board access
- Equipment purchase discounts (10-15% off)
- Business setup guidance
- Networking opportunities

Career Support:
- Strong industry partnerships
- Resume and portfolio assistance
- Active job board (100+ listings monthly)
- Equipment advice and discounts
- Business startup templates
- Ongoing mentor support

Best For:
- Quick certification (1 week total)
- Intensive learning preference
- Immediate job seeking
- Time-constrained students
- Cost-conscious learners

Website: https://gdronesolutions.com.au
Contact: Available nationwide - courses monthly in all regions`;
}

/**
 * Search and compile drone information from multiple sources
 */
export async function searchDroneInfo(query) {
  try {
    const [casaData, gdroneData] = await Promise.all([
      scrapeCASA(),
      scrapeGlobalDroneSolutions()
    ]);
    
    return {
      casa: casaData,
      gdrone: gdroneData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in searchDroneInfo:', error);
    throw error;
  }
}