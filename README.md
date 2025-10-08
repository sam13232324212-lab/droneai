# 🚁 DroneEdu Expert - AI-Powered Drone Career Assistant

A full-stack AI chatbot built with Next.js, Supabase, and ChatGPT API to guide users about CASA drone regulations, RePL/ReOC licensing, training options, and career pathways in Australia.

![DroneEdu Expert](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-14.2.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Vector%20Search-green)
![AI](https://img.shields.io/badge/AI-ChatGPT%20%2B%20Gemini-purple)

## ✨ Features

### 🤖 Intelligent AI Assistant
- **RAG (Retrieval Augmented Generation)**: Retrieves relevant information from a curated knowledge base before generating responses
- **ChatGPT Integration**: Uses OpenAI's GPT-4o-mini with Emergent LLM Key for natural conversations
- **Gemini Embeddings**: Vector embeddings for semantic search using Google's Gemini AI
- **Context-Aware**: Maintains conversation history for better responses

### 📚 Knowledge Base
- CASA drone regulations and safety rules
- RePL (Remote Pilot License) requirements and training
- ReOC (Remote Operator's Certificate) information
- Training provider comparisons (DroneCareerPro, GDroneSolutions, etc.)
- Career pathways and salary expectations
- Insurance requirements and costs

### 💬 Beautiful Chat Interface
- Modern, responsive design with Tailwind CSS
- Smooth animations using Framer Motion
- ShadCN UI components for consistency
- Quick action buttons for common questions
- Professional yet friendly tone with emojis

### 📊 Lead Capture System
- Contextual lead form appears after helpful interactions
- Smooth user experience with confirmation messages
- Saves contacts to Supabase for follow-up
- Non-intrusive, appears only when appropriate

### 🔍 Vector Search
- PostgreSQL with pgvector extension
- Cosine similarity search for relevant document retrieval
- 768-dimensional embeddings from Gemini
- Fast and accurate context matching

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│  React + Framer │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Routes     │
│  /api/chat      │◄──────┐
│  /api/leads     │       │
│  /api/rag       │       │
└────────┬────────┘       │
         │                │
         ├────────────────┤
         │                │
         ▼                ▼
┌──────────────┐  ┌──────────────┐
│   Supabase   │  │  AI Services │
│   (Postgres  │  │   - ChatGPT  │
│   + pgvector)│  │   - Gemini   │
└──────────────┘  └──────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14.2.3** - React framework with server-side rendering
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN UI** - High-quality React components
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with real-time capabilities
- **pgvector** - PostgreSQL extension for vector similarity search

### AI/ML
- **OpenAI GPT-4o-mini** - Chat completions
- **Google Gemini embedding-001** - Text embeddings
- **Emergent LLM Key** - Universal API key for both services

## 📦 Installation

### Prerequisites
- Node.js 18+ and Yarn
- Supabase account
- Emergent LLM Key

### Setup Steps

1. **Clone and Install**
```bash
cd /app
yarn install
```

2. **Configure Environment**
Environment variables are already set in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `EMERGENT_LLM_KEY` - Universal AI key

3. **Set Up Database**
- Go to your Supabase SQL Editor
- Run the SQL from `/app/supabase_setup.sql`
- This creates tables, indexes, and seed data

4. **Generate Embeddings**
```bash
curl -X POST http://localhost:3000/api/update-embeddings
```

5. **Start Development Server**
```bash
yarn dev
```

Visit: `http://localhost:3000`

## 📁 Project Structure

```
/app
├── app/
│   ├── api/
│   │   ├── [[...path]]/route.js    # Main API router
│   │   └── update-embeddings/      # Embedding generation
│   ├── page.js                      # Main chat interface
│   ├── layout.js                    # App layout
│   └── globals.css                  # Global styles
├── lib/
│   ├── supabase.js                  # Supabase client
│   ├── openai.js                    # OpenAI client
│   ├── gemini.js                    # Gemini embeddings
│   └── utils.js                     # Utility functions
├── components/
│   └── ui/                          # ShadCN components
├── scripts/
│   └── update-embeddings.js         # Embedding script
├── supabase_setup.sql               # Database schema
└── package.json                     # Dependencies
```

## 🚀 API Endpoints

### `POST /api/chat`
Main chat endpoint with RAG and ChatGPT integration.

**Request:**
```json
{
  "message": "What is a RePL?",
  "sessionId": "session_123",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "response": "✅ RePL (Remote Pilot License)...",
  "sessionId": "session_123",
  "contextUsed": true,
  "sources": ["https://www.casa.gov.au/drones"]
}
```

### `POST /api/leads`
Save lead information.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phone": "+61 4XX XXX XXX",
  "message": "Interested in RePL training"
}
```

### `POST /api/rag`
Add documents to knowledge base.

**Request:**
```json
{
  "source": "https://example.com",
  "content": "Document content...",
  "metadata": {"category": "training"}
}
```

### `GET /api/rag`
List all RAG documents.

### `POST /api/update-embeddings`
Generate embeddings for documents without them.

## 🎨 UI Components

### Chat Interface
- **Message Bubbles**: Differentiated user/assistant messages
- **Avatars**: User icon and Bot icon with gradient backgrounds
- **Animations**: Smooth entrance animations for messages
- **Loading State**: Animated dots while AI is thinking
- **Auto-scroll**: Automatic scroll to latest message

### Lead Form
- **Modal Dialog**: Non-intrusive popup
- **Form Validation**: Required fields enforced
- **Success Feedback**: Confirmation message in chat
- **Smart Timing**: Appears after 3 helpful responses

### Quick Actions
- Pre-configured question buttons
- One-click to populate input
- Common queries like "What is RePL?", "Compare Training"

## 🔒 Security

- API keys stored in environment variables
- Server-side API calls only
- Supabase Row Level Security enabled
- Input validation on all endpoints
- Rate limiting recommended for production

## 🧪 Testing

### Manual Testing
```bash
# Test API
curl http://localhost:3000/api

# Test chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a RePL?"}'

# Test lead submission
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Smith","email":"john@example.com"}'
```

### Check Embeddings
```bash
# Get embedding stats
curl http://localhost:3000/api/update-embeddings

# Generate missing embeddings
curl -X POST http://localhost:3000/api/update-embeddings
```

## 📊 Database Schema

### `leads` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| email | TEXT | Contact email |
| phone | TEXT | Phone number (optional) |
| message | TEXT | User message (optional) |
| created_at | TIMESTAMP | Submission time |

### `rag_docs` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| source | TEXT | Document source URL |
| content | TEXT | Document content |
| metadata | JSONB | Additional metadata |
| embedding | VECTOR(768) | Gemini embedding |
| created_at | TIMESTAMP | Creation time |

## 🔧 Configuration

### Adjust AI Parameters
Edit `/app/lib/openai.js`:
```javascript
export const DEFAULT_MODEL = 'gpt-4o-mini'; // or 'gpt-4o'
// Temperature: 0.7 (more creative) to 0.1 (more focused)
// Max tokens: 1000 (longer responses) to 500 (shorter)
```

### Adjust RAG Settings
Edit `/app/app/api/[[...path]]/route.js`:
```javascript
// Similarity threshold: 0.3 (more results) to 0.7 (fewer, more relevant)
match_threshold: 0.3,
// Number of context documents: 3-10
match_count: 5
```

### Customize System Prompt
Edit the `SYSTEM_PROMPT` constant in `/app/app/api/[[...path]]/route.js` to adjust the AI's personality and response format.

## 🚀 Deployment

The app is configured for deployment on Emergent platform but can be deployed anywhere Next.js runs:

### Vercel
```bash
vercel deploy
```

### Docker
```bash
docker build -t droneedu-expert .
docker run -p 3000:3000 droneedu-expert
```

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform.

## 📈 Future Enhancements

- [ ] Web search integration for live CASA updates
- [ ] Multi-language support (beyond English)
- [ ] Voice input/output
- [ ] PDF export of conversation
- [ ] Admin dashboard for leads
- [ ] Advanced analytics
- [ ] More training provider data
- [ ] Course booking integration
- [ ] Mobile app version

## 🤝 Contributing

This is a production application for DroneCareerPro. For modifications or enhancements, please contact the development team.

## 📄 License

Proprietary - DroneCareerPro.com

## 📞 Support

For technical support or questions:
- Check logs: `tail -f /var/log/supervisor/nextjs.out.log`
- Review setup: `SETUP_INSTRUCTIONS.md`
- API documentation: Visit `/api` endpoint

---

Built with ❤️ for the Australian drone community by DroneCareerPro
