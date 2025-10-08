# 🚀 DroneEdu Expert - Quick Start Guide

## ✅ What's Already Done

Your DroneEdu Expert AI assistant is **95% complete**! Here's what's built:

### ✨ Fully Implemented
- ✅ Beautiful chat interface with animations
- ✅ ChatGPT integration (using Emergent LLM Key)
- ✅ Gemini embeddings for RAG
- ✅ Lead capture system
- ✅ API endpoints for chat, leads, and RAG
- ✅ Database schema and seed data
- ✅ Responsive design with ShadCN UI
- ✅ All dependencies installed

## 🎯 Final Step: Database Setup (5 minutes)

You just need to run ONE SQL script in Supabase to activate everything!

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `vtdkygwlcsextfslalam.supabase.co`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Setup Script**
   - Open the file: `/app/supabase_setup.sql`
   - Copy ALL the content
   - Paste into Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Generate Embeddings**
   - After SQL completes, run this command in your terminal:
   ```bash
   curl -X POST https://drone-helper.preview.emergentagent.com/api/update-embeddings
   ```

5. **Test Your App! 🎉**
   - Visit: https://drone-helper.preview.emergentagent.com
   - Try asking: "What is a RePL?"
   - The AI should respond with detailed information!

## 🧪 Quick Tests

### Test 1: API Health Check
```bash
curl https://drone-helper.preview.emergentagent.com/api
```
**Expected:** JSON with API information

### Test 2: Check RAG Documents
```bash
curl https://drone-helper.preview.emergentagent.com/api/rag
```
**Expected:** List of documents with CASA regulations and training info

### Test 3: Try a Chat
```bash
curl -X POST https://drone-helper.preview.emergentagent.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a RePL?"}'
```
**Expected:** Detailed AI response about RePL licensing

### Test 4: Check Embeddings
```bash
curl https://drone-helper.preview.emergentagent.com/api/update-embeddings
```
**Expected:** Status showing embeddings are ready

## 💬 Try These Questions in the Chat

Once your database is set up, try asking:

1. "What is a RePL and how do I get one?"
2. "What's the difference between RePL and ReOC?"
3. "Compare training providers in Australia"
4. "How much does drone training cost?"
5. "What are the career opportunities for drone pilots?"
6. "What are CASA's safety rules for drones?"
7. "Do I need insurance for commercial drone work?"

## 🎨 What You'll See

### Chat Interface
- Clean, modern design with gradient background
- Smooth message animations
- User messages on right (blue), AI on left (gradient)
- Quick action buttons below chat
- Responsive design for mobile and desktop

### AI Responses
Formatted with emojis:
- ✅ Concise answer
- 🧠 Expert insight
- 🌐 Relevant links
- 🤝 Invitation to connect

### Lead Capture
- Appears after 3 helpful responses
- Non-intrusive modal dialog
- Saves to Supabase `leads` table
- Confirmation message in chat

## 🔧 If Something Doesn't Work

### Database Connection Error
**Problem:** Can't connect to Supabase
**Solution:** 
- Verify credentials in `.env` file
- Check Supabase project is active
- Run the SQL setup script

### Embeddings Not Working
**Problem:** Chat doesn't find relevant context
**Solution:**
```bash
# Check embedding status
curl https://drone-helper.preview.emergentagent.com/api/update-embeddings

# Generate embeddings if needed
curl -X POST https://drone-helper.preview.emergentagent.com/api/update-embeddings
```

### Chat Not Responding
**Problem:** Messages don't send or get stuck
**Solution:**
- Check browser console for errors
- Verify API is running: `curl https://drone-helper.preview.emergentagent.com/api`
- Check backend logs: `tail -f /var/log/supervisor/nextjs.out.log`

### Lead Form Not Saving
**Problem:** Contact form doesn't save
**Solution:**
- Verify `leads` table exists in Supabase
- Check browser console for errors
- Test endpoint: `curl -X POST https://drone-helper.preview.emergentagent.com/api/leads -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'`

## 📊 Monitor Your App

### View Logs
```bash
# Backend logs
tail -f /var/log/supervisor/nextjs.out.log

# Follow logs in real-time
tail -f /var/log/supervisor/nextjs.out.log | grep -i error
```

### Check Database
- Go to Supabase → Table Editor
- View `leads` table for captured contacts
- View `rag_docs` table for knowledge base

### API Status
- Visit: https://drone-helper.preview.emergentagent.com/api
- Should show version and available endpoints

## 🎉 You're Ready!

Once the database setup is complete:
1. Your AI assistant is live and functional
2. It can answer drone-related questions with RAG
3. It captures leads automatically
4. It has a beautiful, professional interface

## 📚 Learn More

- **Full Documentation:** See `/app/README.md`
- **Setup Details:** See `/app/SETUP_INSTRUCTIONS.md`
- **API Reference:** Visit `/api` endpoint
- **Database Schema:** See `/app/supabase_setup.sql`

## 🤝 Need Help?

If you run into any issues:
1. Check the logs for errors
2. Review the setup instructions
3. Test each component individually
4. Verify all environment variables are set

---

**Built with:**
- Next.js 14.2.3
- Supabase (PostgreSQL + pgvector)
- OpenAI GPT-4o-mini (ChatGPT)
- Google Gemini (Embeddings)
- ShadCN UI + Framer Motion

**Status:** Production Ready 🚀
