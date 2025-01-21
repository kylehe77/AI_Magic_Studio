require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3001;

// Get API key from environment variable
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
  console.error('Error: UNSPLASH_ACCESS_KEY is not set in environment variables');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get('/api/unsplash/search', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
