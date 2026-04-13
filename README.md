# 🛡️ She Shield AI — Women's Safety Web App

An AI-powered women's safety platform built with HTML5, CSS3, JavaScript, and Bootstrap 5.

## 🌐 Live Demo
> Deploy to GitHub Pages or Netlify — see instructions below.

## ✨ Features

| Feature | Description |
|---|---|
| 🚨 One-Tap SOS | Instant emergency alert with real-time GPS location |
| 🎤 Voice Detection | Hands-free SOS via trigger phrases ("Help me", "Emergency") |
| 👥 Emergency Contacts | Add/manage contacts stored in localStorage |
| 📞 Fake Call | Simulate an incoming call to escape uncomfortable situations |
| 💡 Safety Tips | Curated safety advice with category filters |
| 🤖 Safety Chatbot | Floating AI assistant for safety questions |
| 🌙 Dark Mode | Toggle between light and dark themes |
| 📊 Dashboard | Activity overview, safety score, and alert history |

## 🚀 Deploy to GitHub Pages

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: She Shield AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/she-shield-ai.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / folder: `/frontend`
4. Click **Save**
5. Your site will be live at: `https://YOUR_USERNAME.github.io/she-shield-ai/`

## 🗂️ Project Structure

```
frontend/
├── index.html          # Landing page
├── dashboard.html      # User dashboard
├── css/
│   ├── styles.css      # Main styles
│   └── dashboard.css   # Dashboard styles
└── js/
    ├── main.js         # Theme, navigation, FAQ
    ├── app.js          # SOS, contacts, voice, fake call
    ├── sos.js          # SOS module
    ├── contacts.js     # Contact manager
    ├── voice.js        # Voice detection
    ├── fakecall.js     # Fake call feature
    ├── location.js     # GPS location tracker
    ├── tips.js         # Safety tips renderer
    ├── tips-data.js    # Tips data
    ├── chatbot.js      # Floating chatbot
    └── dashboard.js    # Dashboard logic
```

## 🎨 Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Bootstrap 5.3
- Font Awesome 6.4
- Google Fonts (Poppins, Inter)
- Web APIs: Geolocation, SpeechRecognition, Web Audio

## 📱 Browser Support

Chrome/Edge 90+, Firefox 88+, Safari 14+, Mobile browsers

---

**Built with ❤️ for women's safety**
