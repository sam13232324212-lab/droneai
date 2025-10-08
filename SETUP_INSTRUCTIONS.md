# DroneEdu Expert - Setup Instructions

## 🎉 Your AI Drone Assistant is Almost Ready!

The application code is complete and running. Now you just need to set up the Supabase database.

## 📋 Database Setup (Required - 5 minutes)

### Step 1: Access your Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project: **vtdkygwlcsextfslalam.supabase.co**

### Step 2: Run the Setup SQL
1. In the Supabase dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `/app/supabase_setup.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)

This will:
- Enable the `pgvector` extension for embeddings
- Create `leads` table (for contact form submissions)
- Create `rag_docs` table (for knowledge base with vector embeddings)
- Create the `match_rag_docs` function (for RAG retrieval)
- Insert seed data with CASA regulations and training info

### Step 3: Generate Embeddings for Seed Data
After running the SQL, we need to generate embeddings for the seed data.

Run this command to generate embeddings:
```bash
curl -X POST http://localhost:3000/api/update-embeddings
```

This will process all documents in the database and generate their vector embeddings.

## ✅ Verify Everything Works

### Test 1: Check API
```bash
curl http://localhost:3000/api
```

Should return JSON with available endpoints.

### Test 2: Check RAG Documents
```bash
curl http://localhost:3000/api/rag
```

Should return list of documents with their content.

### Test 3: Try a Chat Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a RePL?"}'
```

Should return a formatted response about RePL licensing.

## 🚀 Access Your App

Once database setup is complete, your DroneEdu Expert is live at:
**https://drone-helper.preview.emergentagent.com**

## 📱 Features

### ✨ AI Chat Assistant
- Answers questions about CASA regulations
- Explains RePL and ReOC requirements
- Compares training providers
- Discusses career pathways and salaries
- Uses RAG for accurate, source-backed responses

### 📊 Lead Capture
- Contextual form appears after helpful interactions
- Saves leads to Supabase `leads` table
- Smooth user experience with confirmation

### 🎨 Beautiful UI
- Modern, responsive design
- Smooth animations with Framer Motion
- ShadCN UI components
- Professional yet friendly tone

## 🔧 What's Been Built

### Backend (Next.js API)
- ✅ `/api/chat` - Main conversation endpoint with RAG + ChatGPT
- ✅ `/api/leads` - Save contact information
- ✅ `/api/rag` - Manage RAG documents
- ✅ Vector similarity search using Gemini embeddings

### Frontend (Next.js + React)
- ✅ Beautiful chat interface
- ✅ Message animations
- ✅ Lead capture dialog
- ✅ Quick action buttons
- ✅ Responsive design

### Integrations
- ✅ Supabase (database + vector search)
- ✅ OpenAI (ChatGPT with Emergent LLM Key)
- ✅ Gemini (embeddings with Emergent LLM Key)
- ✅ Framer Motion (animations)

## 📝 Next Steps (Optional Enhancements)

After the basic setup works, you can:

1. **Add More Training Data**
   - Scrape additional training provider websites
   - Add more CASA regulation details
   - Include pricing comparisons

2. **Web Search Integration**
   - Connect to live CASA updates
   - Real-time course pricing
   - Latest industry news

3. **Analytics**
   - Track popular questions
   - Monitor lead conversion
   - User engagement metrics

4. **Enhanced Features**
   - Multi-language support
   - Voice input/output
   - PDF export of chat history
   - Calendar booking integration

## 🆘 Troubleshooting

### Database Connection Issues
If you see database errors:
1. Verify Supabase credentials in `.env`
2. Check that pgvector extension is enabled
3. Ensure tables are created correctly

### Embedding Generation Errors
If embeddings fail:
1. Check Emergent LLM Key is valid
2. Verify sufficient API credits
3. Check network connectivity

### Chat Not Responding
If chat doesn't work:
1. Check browser console for errors
2. Verify API endpoint responds: `curl http://localhost:3000/api`
3. Check backend logs: `tail -f /var/log/supervisor/nextjs.out.log`

## 📞 Support

Need help? Contact the DroneCareerPro team or check the logs:
```bash
tail -f /var/log/supervisor/nextjs.out.log
```
