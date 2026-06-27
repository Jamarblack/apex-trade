import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── Live market state ─────────────────────────────────────────────────────
let liveMarketState = {
  SOL:  { price: 184.27, volume24h: 2_450_000_000, change24h: 4.6  },
  BASE: { price: 3200.00, volume24h: 890_000_000,  change24h: 0.8  },
};

// ── Oracle: CoinGecko (free, no key, reliable) ────────────────────────────
const fetchMarketData = async () => {
  try {
    const res  = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true'
    );
    const data = await res.json();

    if (data?.solana?.usd) {
      liveMarketState.SOL.price     = data.solana.usd;
      liveMarketState.SOL.change24h = parseFloat((data.solana.usd_24h_change ?? 0).toFixed(2));
      liveMarketState.SOL.volume24h = data.solana.usd_24h_vol ?? liveMarketState.SOL.volume24h;
      console.log(`✅ SOL: $${liveMarketState.SOL.price.toFixed(2)}`);
    }

    if (data?.ethereum?.usd) {
      liveMarketState.BASE.price     = data.ethereum.usd;
      liveMarketState.BASE.change24h = parseFloat((data.ethereum.usd_24h_change ?? 0).toFixed(2));
      liveMarketState.BASE.volume24h = data.ethereum.usd_24h_vol ?? liveMarketState.BASE.volume24h;
      console.log(`✅ ETH/BASE: $${liveMarketState.BASE.price.toFixed(2)}`);
    }
  } catch (err) {
    console.warn('CoinGecko oracle failed — keeping last prices', err);
  }
};

// Fetch on startup, then every 15 s (CoinGecko free tier rate limit)
fetchMarketData();
setInterval(fetchMarketData, 15_000);

// Micro-volatility every 1 s to simulate live order book between oracle updates
setInterval(() => {
  liveMarketState.SOL.price  += (Math.random() - 0.5) * 0.08;
  liveMarketState.BASE.price += (Math.random() - 0.5) * 1.20;
}, 1_000);

// ── Endpoint 1: Market ticks ──────────────────────────────────────────────
app.get('/api/markets/ticks', (_req, res) => {
  res.json({
    kpis: [
      { asset: 'SOL',  ...liveMarketState.SOL  },
      { asset: 'BASE', ...liveMarketState.BASE },
    ],
  });
});

// ── Endpoint 2: AI Prediction stream ─────────────────────────────────────
app.get('/api/predictions/stream', async (_req, res) => {
  const targetAsset  = Math.random() > 0.5 ? 'SOL' : 'BASE';
  const currentPrice = liveMarketState[targetAsset].price;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an elite crypto trading AI. The current price of ${targetAsset} is $${currentPrice.toFixed(2)}.
Generate a single technical trading signal as a STRICT JSON object with NO markdown, no backticks, no extra text:
{"id":"abc123","asset":"${targetAsset}","action":"BUY","confidence":78,"reason":"One sentence technical reason."}
action must be "BUY" or "SELL". confidence must be a number between 60 and 99.
    `.trim();

    const result = await model.generateContent(prompt);
    let raw      = result.response.text().trim().replace(/```json|```/g, '').trim();

    const prediction = JSON.parse(raw);
    prediction.ts    = Date.now();
    res.json(prediction);
  } catch (err) {
    console.error('Gemini prediction error:', err);
    // Fallback so frontend never breaks
    const REASONS = [
      'Order-flow imbalance +2.4σ detected',
      'Funding rate divergence across venues',
      'Liquidity sweep above key resistance',
      'Whale accumulation cluster on-chain',
      'Volatility compression breakout signal',
      'RSI divergence on 15m timeframe',
      'Cross-venue basis arbitrage opportunity',
    ];
    res.json({
      id:         Math.random().toString(36).slice(2, 8),
      asset:      targetAsset,
      action:     Math.random() > 0.5 ? 'BUY' : 'SELL',
      confidence: Math.round(62 + Math.random() * 30),
      reason:     REASONS[Math.floor(Math.random() * REASONS.length)],
      ts:         Date.now(),
    });
  }
});

// ── Endpoint 3: Trade execution ───────────────────────────────────────────
app.post('/api/agent/execute', (req, res) => {
  const { action, risk, network } = req.body;
  const targetAsset  = network === 'solana' ? 'SOL' : 'BASE';
  const currentPrice = liveMarketState[targetAsset].price;

  res.json({
    success: true,
    execution: {
      id:     Math.random().toString(36).slice(2, 9),
      ts:     Date.now(),
      asset:  targetAsset,
      action: action || (Math.random() > 0.5 ? 'BUY' : 'SELL'),
      amount: (Math.random() * (risk / 10)).toFixed(4),
      price:  currentPrice,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    },
  });
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Apex Trade Engine running on port ${PORT}`);
  console.log(`   → Ticks:       http://localhost:${PORT}/api/markets/ticks`);
  console.log(`   → Predictions: http://localhost:${PORT}/api/predictions/stream`);
  console.log(`   → Execute:     http://localhost:${PORT}/api/agent/execute`);
});