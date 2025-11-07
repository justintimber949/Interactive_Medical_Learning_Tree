// ========================================
// BACKEND SERVER - INTERACTIVE MEDICAL LEARNING TREE
// ========================================

import express from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Prompts from './prompts.js';

// Load environment variables
dotenv.config();

// ========================================
// INISIALISASI
// ========================================
const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Multer (untuk upload file)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (untuk frontend jika dalam satu folder)
app.use(express.static('frontend'));

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Membagi teks panjang menjadi chunks untuk menghindari token limit
 * @param {string} text - Teks lengkap dari PDF
 * @param {number} maxLength - Panjang maksimal per chunk
 * @returns {Array<string>} Array of text chunks
 */
function splitTextIntoChunks(text, maxLength = 5000) {
  const chunks = [];
  const paragraphs = text.split('\n\n');
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      // Jika paragraph sendiri terlalu panjang, potong paksa
      if (paragraph.length > maxLength) {
        for (let i = 0; i < paragraph.length; i += maxLength) {
          chunks.push(paragraph.slice(i, i + maxLength));
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += '\n\n' + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Menggabungkan multiple JSON trees menjadi satu
 * @param {Array<Object>} trees - Array of JSON tree objects
 * @returns {Object} Combined tree
 */
function mergeTrees(trees) {
  if (trees.length === 0) return { name: "Root", children: [] };
  if (trees.length === 1) return trees[0];

  const mergedTree = {
    name: "Materi Pembelajaran",
    children: []
  };

  trees.forEach((tree, index) => {
    if (tree && tree.children) {
      // Jika tree memiliki children, tambahkan sebagai section
      mergedTree.children.push({
        name: `Bagian ${index + 1}`,
        children: tree.children
      });
    } else if (tree && tree.name) {
      // Jika tree adalah single node
      mergedTree.children.push(tree);
    }
  });

  return mergedTree;
}

// ========================================
// ENDPOINT 1: UPLOAD & ANALISIS PDF
// ========================================
app.post('/upload-pdf', upload.single('pdfFile'), async (req, res) => {
  console.log('📄 Received PDF upload request');

  if (!req.file) {
    return res.status(400).json({ 
      error: 'No file uploaded',
      message: 'Please upload a PDF file'
    });
  }

  try {
    // 1. Ekstraksi teks dari PDF
    console.log('📖 Extracting text from PDF...');
    const data = await pdf(req.file.buffer);
    const fullText = data.text;

    if (!fullText || fullText.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty PDF',
        message: 'The PDF appears to be empty or contains no extractable text'
      });
    }

    console.log(`✅ Extracted ${fullText.length} characters`);

    // 2. Split text into manageable chunks
    const textChunks = splitTextIntoChunks(fullText, 4000);
    console.log(`📦 Split into ${textChunks.length} chunks`);

    // 3. Process each chunk with Gemini API
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const treeParts = [];

    for (let i = 0; i < textChunks.length; i++) {
      console.log(`🤖 Processing chunk ${i + 1}/${textChunks.length}...`);
      
      const prompt = Prompts.getStructurePrompt(textChunks[i]);
      
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text();
        
        // Parse JSON response
        const jsonData = JSON.parse(jsonText);
        treeParts.push(jsonData);
        
      } catch (chunkError) {
        console.error(`⚠️ Error processing chunk ${i + 1}:`, chunkError.message);
        // Continue with other chunks even if one fails
      }
    }

    // 4. Merge all tree parts
    const finalTree = mergeTrees(treeParts);
    console.log('✅ Successfully created learning tree');

    // 5. Send response
    res.json({
      success: true,
      tree: finalTree,
      metadata: {
        originalLength: fullText.length,
        chunksProcessed: textChunks.length,
        filename: req.file.originalname
      }
    });

  } catch (error) {
    console.error('❌ Error during PDF processing:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ========================================
// ENDPOINT 2: GET ANALOGY
// ========================================
app.post('/get-analogy', async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ 
      error: 'Topic required',
      message: 'Please provide a topic parameter'
    });
  }

  try {
    console.log(`🎯 Generating analogy for: ${topic}`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = Prompts.getAnalogyPrompt(topic);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Analogy generated successfully');

    res.json({
      success: true,
      topic: topic,
      analogy: text
    });

  } catch (error) {
    console.error('❌ Error generating analogy:', error);
    res.status(500).json({
      error: 'Failed to generate analogy',
      message: error.message
    });
  }
});

// ========================================
// ENDPOINT 3: GET CLINICAL RELEVANCE
// ========================================
app.post('/get-clinical', async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ 
      error: 'Topic required',
      message: 'Please provide a topic parameter'
    });
  }

  try {
    console.log(`🏥 Generating clinical relevance for: ${topic}`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = Prompts.getKlinisPrompt(topic);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Clinical relevance generated successfully');

    res.json({
      success: true,
      topic: topic,
      clinical: text
    });

  } catch (error) {
    console.error('❌ Error generating clinical relevance:', error);
    res.status(500).json({
      error: 'Failed to generate clinical relevance',
      message: error.message
    });
  }
});

// ========================================
// ENDPOINT 4: CHATBOT (START CHAT)
// ========================================
const chatSessions = new Map(); // Simple in-memory storage

app.post('/start-chat', async (req, res) => {
  const { topic, sessionId } = req.body;

  if (!topic) {
    return res.status(400).json({ 
      error: 'Topic required',
      message: 'Please provide a topic parameter'
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const systemPrompt = Prompts.getChatbotSystemPrompt(topic);
    
    // Create new chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: `Saya siap membantu Anda memahami ${topic}. Apa yang ingin Anda tanyakan?` }],
        },
      ],
    });

    // Store chat session
    const newSessionId = sessionId || Date.now().toString();
    chatSessions.set(newSessionId, { chat, topic });

    console.log(`💬 Chat session started for: ${topic}`);

    res.json({
      success: true,
      sessionId: newSessionId,
      topic: topic,
      message: `Saya siap membantu Anda memahami ${topic}. Apa yang ingin Anda tanyakan?`
    });

  } catch (error) {
    console.error('❌ Error starting chat:', error);
    res.status(500).json({
      error: 'Failed to start chat',
      message: error.message
    });
  }
});

// ========================================
// ENDPOINT 5: CHATBOT (SEND MESSAGE)
// ========================================
app.post('/chat-message', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ 
      error: 'SessionId and message required'
    });
  }

  const session = chatSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      message: 'Please start a new chat session'
    });
  }

  try {
    console.log(`💬 Processing message in session ${sessionId}`);

    const result = await session.chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      response: text,
      topic: session.topic
    });

  } catch (error) {
    console.error('❌ Error sending chat message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message
    });
  }
});

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeSessions: chatSessions.size
  });
});

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================
app.use((err, req, res, next) => {
  console.error('⚠️ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🏥 Medical Learning Tree API Server     ║
║   🚀 Server running on port ${PORT}        ║
║   📍 http://localhost:${PORT}              ║
╚════════════════════════════════════════════╝
  `);
  console.log('✅ Gemini API initialized');
  console.log('✅ All endpoints ready\n');
});