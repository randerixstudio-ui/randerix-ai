# RANDERIX AI — Netlify Deployment Guide
## اردو + English Step-by-Step

---

## آپ کے پاس کیا ہے؟ (What's in this folder)

| File/Folder | Description |
|---|---|
| `index.html` | Homepage |
| `about.html` | About Architect Rimsha |
| `services.html` | Services & pricing |
| `ai-tools.html` | All 5 AI tools (Cost, Floor Plan, Interior, Chatbot, 3D) |
| `portfolio.html` | Project portfolio |
| `blog.html` | Blog + AI article generator |
| `contact.html` | Contact form + WhatsApp |
| `netlify/functions/chat.js` | AI Chatbot backend |
| `netlify/functions/estimate.js` | Cost Estimator backend |
| `netlify/functions/floorplan.js` | Floor Plan Generator backend |
| `netlify/functions/sketch-convert.js` | Sketch → Digital Plan backend |
| `netlify/functions/blog-generate.js` | AI Blog Writer backend |
| `netlify.toml` | Netlify configuration |
| `Randerix_AI_Investor_Pitch_Deck.pptx` | Investor pitch deck (20 slides) |

---

## STEP 1 — Anthropic API Key لیں
1. جائیں: https://console.anthropic.com
2. Account بنائیں → API Keys → "Create Key"
3. Key copy کریں (صرف ایک بار دکھتی ہے)

---

## STEP 2 — Netlify پر Deploy کریں (Drag & Drop — سب سے آسان)

1. https://app.netlify.com پر جائیں اور login کریں
2. **"Add new site" → "Deploy manually"** پر کلک کریں
3. اس پورے `randerix-ai` folder کو **drag & drop** کریں
4. Deploy ہونے کا انتظار کریں (1-2 منٹ)
5. آپ کو ایک URL ملے گا جیسے: `random-name-123.netlify.app`

---

## STEP 3 — API Key ڈالیں (سب سے اہم!)

1. Netlify dashboard → اپنی site → **Site configuration**
2. **Environment variables → Add a variable**
3. یہ ڈالیں:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** (وہ key جو Step 1 میں copy کی)
4. Save کریں
5. **Deploys → Trigger deploy → Deploy site** کریں

---

## STEP 4 — Test کریں
1. آپ کی Netlify URL کھولیں
2. **AI Tools** → **AI Consultant** tab کھولیں
3. لکھیں: "5 marla ghar ki cost kitni hogi?"
4. اگر AI جواب دے — سب کام کر رہا ہے! ✅

---

## Blog Admin Password
- Default: `randerix2025`
- Blog → "Admin: Generate Article" بٹن پر کلک کریں

---

## مسئلہ ہو تو؟
- Netlify Dashboard → **Functions** tab → logs چیک کریں
- یقینی بنائیں `ANTHROPIC_API_KEY` environment variable میں صحیح ہے
- دوبارہ deploy کریں (Deploys → Trigger deploy)

---

## WhatsApp Support
مدد کے لیے: **+92 329 4839897**
