const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://buildlead.xyz', 'https://buildlead.vercel.app'],
  credentials: true
}));

app.use(express.json());

const WHOP_API_KEY = process.env.WHOP_API_KEY;

// Verify Whop purchase endpoint
app.post('/api/verify-whop', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ valid: false, error: 'No user ID provided' });
  }

  if (!WHOP_API_KEY) {
    console.error('WHOP_API_KEY not configured');
    return res.status(500).json({ valid: false, error: 'Server configuration error' });
  }

  try {
    const response = await fetch(`https://api.whop.com/api/v2/memberships?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${WHOP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Whop API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Check if user has active membership for your product
    const hasActiveMembership = data.data?.some(membership => 
      membership.status === 'active' && 
      membership.plan_id === 'plan_3K6z9JF9ht5oU'
    );

    res.json({ valid: hasActiveMembership });
  } catch (error) {
    console.error('Whop verification error:', error);
    res.status(500).json({ valid: false, error: 'Verification failed' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'BuildLead API running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WHOP_API_KEY configured: ${WHOP_API_KEY ? 'Yes' : 'No'}`);
});