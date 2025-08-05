# 🎙️ ElevenLabs n8n Voice Agents

Automatisation complète pour créer et gérer des agents vocaux ElevenLabs via n8n workflows.

## 🚀 Fonctionnalités

- ✅ Création automatique d'agents vocaux ElevenLabs
- ✅ Configuration de tools/webhooks personnalisés
- ✅ Intégration n8n pour workflows automatisés
- ✅ Gestion des rendez-vous et appels
- ✅ Support multilingue (FR, EN, ES, etc.)
- ✅ Templates prêts à l'emploi

## 📋 Prérequis

- Compte ElevenLabs avec clé API
- Instance n8n (cloud ou self-hosted)
- Node.js 16+ (optionnel pour scripts locaux)

## 🔧 Installation

### 1. Cloner le repo
```bash
git clone https://github.com/JSLeboeuf/elevenlabs-n8n-voice-agents.git
cd elevenlabs-n8n-voice-agents
```

### 2. Configuration
```bash
cp .env.example .env
# Éditer .env avec vos clés API
```

### 3. Importer les workflows n8n
- Ouvrir n8n
- Importer les fichiers depuis `workflows/`

## 🎯 Utilisation Rapide

### Créer un agent via API
```javascript
const agent = await createVoiceAgent({
  name: "Assistant AutoScale",
  language: "fr",
  voice: "Adam",
  prompt: "Assistant pour prise de rendez-vous"
});
```

### Via n8n Workflow
1. Déclencher le workflow "Create Voice Agent"
2. Fournir les paramètres requis
3. L'agent est créé automatiquement!

## 📁 Structure du Projet

```
elevenlabs-n8n-voice-agents/
├── src/                    # Code source
│   ├── elevenlabs-client.js
│   ├── n8n-integration.js
│   └── agent-creator.js
├── workflows/              # Workflows n8n exportés
│   ├── create-agent.json
│   ├── appointment-handler.json
│   └── webhook-processor.json
├── docs/                   # Documentation
│   ├── API.md
│   ├── WORKFLOWS.md
│   └── EXAMPLES.md
├── examples/               # Exemples d'utilisation
│   ├── appointment-bot/
│   ├── support-agent/
│   └── sales-assistant/
└── tools/                  # Outils et scripts
    ├── test-webhook.js
    └── agent-manager.js
```

## 🔌 API Endpoints

### Créer un Agent
```http
POST /api/agents/create
{
  "name": "Mon Assistant",
  "language": "fr",
  "voice": "Adam",
  "prompt": "Description du comportement",
  "tools": ["checkavailability"]
}
```

### Configurer un Tool
```http
POST /api/tools/create
{
  "name": "checkavailability",
  "webhook": "https://your-n8n.com/webhook/appointment",
  "schema": {...}
}
```

## 🔄 Workflows n8n Inclus

1. **Create Voice Agent** - Création automatique d'agents
2. **Appointment Handler** - Gestion des rendez-vous
3. **Webhook Processor** - Traitement des requêtes tools
4. **Agent Manager** - CRUD complet des agents
5. **Analytics Dashboard** - Suivi des performances

## 🛠️ Configuration Avancée

### Variables d'Environnement
```env
# ElevenLabs
ELEVENLABS_API_KEY=sk_xxx
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB

# n8n
N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud
N8N_API_KEY=xxx

# Options
DEFAULT_LANGUAGE=fr
DEFAULT_MODEL=eleven_turbo_v2_5
WEBHOOK_TIMEOUT=20
```

### Personnalisation des Prompts
Voir `docs/PROMPTS.md` pour des exemples de prompts optimisés.

## 📊 Exemples de Use Cases

- 🏥 **Santé**: Prise de rendez-vous médicaux
- 🏪 **Retail**: Assistant de vente
- 🎓 **Éducation**: Tuteur virtuel
- 🏢 **Entreprise**: Support client 24/7
- 🍕 **Restaurant**: Prise de commandes

## 🤝 Contribution

Les contributions sont bienvenues! Voir `CONTRIBUTING.md`.

## 📄 Licence

MIT - Voir `LICENSE`

## 🔗 Liens Utiles

- [Documentation ElevenLabs](https://elevenlabs.io/docs)
- [Documentation n8n](https://docs.n8n.io)
- [Support Discord](https://discord.gg/elevenlabs)

---

Créé avec ❤️ par AutoScale AI
