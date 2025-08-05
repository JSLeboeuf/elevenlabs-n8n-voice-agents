# 📚 Guide de Configuration - ElevenLabs n8n Voice Agents

## 🎯 Vue d'ensemble

Ce guide vous aidera à configurer l'intégration complète entre ElevenLabs et n8n pour créer des agents vocaux qui peuvent prendre des rendez-vous automatiquement.

## 🔧 Configuration Étape par Étape

### 1️⃣ Configuration n8n

1. **Importer le workflow**
   - Ouvrez votre instance n8n
   - Allez dans "Workflows" > "Import"
   - Importez `workflows/appointment-booking-system.json`

2. **Configurer les credentials (optionnel)**
   - Si vous voulez sauvegarder dans Google Sheets:
     - Ajoutez vos credentials Google
     - Créez une feuille "Rendez-vous" avec colonnes: ID, Nom, Email, Date, Status, Créé le
   - Pour envoyer des emails:
     - Configurez SMTP credentials

3. **Activer le workflow**
   - Cliquez sur "Active" pour activer le workflow
   - Notez l'URL du webhook (format: `https://your-n8n.com/webhook/appointment-webhook`)

### 2️⃣ Configuration ElevenLabs

#### Agent existant (recommandé)
Si vous avez déjà créé l'agent avec le script:
- **Agent ID**: `agent_6701k1w6p61qeaebesj0bvqdt5b9`
- **Tool ID**: `tool_5101k1w8h1p2eprvsbeeqctbr94w`
- L'agent est déjà configuré et prêt!

#### Créer un nouvel agent

1. **Via API (recommandé)**
```bash
# Copier .env.example vers .env
cp .env.example .env

# Éditer .env avec vos clés
nano .env

# Tester la création
npm install
node examples/test-agent.js
```

2. **Via Dashboard ElevenLabs**
   - Allez sur [ElevenLabs Dashboard](https://elevenlabs.io)
   - Créez un nouvel agent conversationnel
   - Configuration:
     - **Nom**: Assistant Rendez-vous
     - **Langue**: Français
     - **Voix**: Adam (ou autre)
     - **Modèle**: eleven_turbo_v2_5

### 3️⃣ Configuration du Tool/Webhook

Le tool doit être configuré avec:
- **URL**: Votre webhook n8n (ex: `https://autoscaleai2001.app.n8n.cloud/webhook-test/appointment-webhook`)
- **Méthode**: POST
- **Schema**:
  ```json
  {
    "tool": "string - check ou book",
    "name": "string - nom du client",
    "email": "string - email du client",
    "startTime": "string - date/heure souhaitée"
  }
  ```

### 4️⃣ Prompt de l'Agent

Utilisez ce prompt optimisé:

```
Tu es un assistant vocal professionnel pour la prise de rendez-vous chez AutoScale AI. Voici tes instructions:

1. ACCUEIL: Salue chaleureusement et demande comment tu peux aider

2. COLLECTE INFO:
- Demande le nom complet
- Demande email (épelle-le si nécessaire)
- Demande la date et heure souhaitée

3. UTILISATION DU TOOL:
- Utilise tool=check pour vérifier les disponibilités
- Utilise tool=book pour confirmer la réservation

4. CONFIRMATION:
- Répète toutes les infos avant de réserver
- Donne le numéro de confirmation
- Mentionne email de confirmation

Parle en français, sois professionnel mais amical. Réponds de manière concise.
```

## 🧪 Test de l'Intégration

### Test via Script
```bash
cd elevenlabs-n8n-voice-agents
npm install axios
node examples/test-booking-flow.js
```

### Test via Agent Vocal
1. Ouvrez le dashboard ElevenLabs
2. Trouvez votre agent "Assistant Rendez-vous AutoScale"
3. Cliquez sur "Test Agent"
4. Commencez par: "Bonjour, je voudrais prendre rendez-vous"

### Flux de Conversation Type
```
👤 User: "Bonjour, je voudrais prendre rendez-vous"
🤖 Agent: "Bonjour! Je serais ravi de vous aider. Puis-je avoir votre nom complet?"
👤 User: "Jean Dupont"
🤖 Agent: "Merci M. Dupont. Quelle est votre adresse email?"
👤 User: "jean.dupont@example.com"
🤖 Agent: "Parfait. Pour quand souhaitez-vous le rendez-vous?"
👤 User: "Demain après-midi si possible"
🤖 Agent: [Appelle tool check] "Je vérifie les disponibilités..."
🤖 Agent: "J'ai plusieurs créneaux disponibles demain après-midi: 14h, 15h et 16h. Lequel préférez-vous?"
👤 User: "14h serait parfait"
🤖 Agent: [Appelle tool book] "Je réserve votre créneau..."
🤖 Agent: "Parfait! Votre rendez-vous est confirmé pour demain à 14h. Numéro de confirmation: RDV-ABC123. Vous recevrez un email de confirmation."
```

## 🔍 Débogage

### Vérifier les logs n8n
- Allez dans Executions
- Vérifiez les webhooks reçus
- Examinez les erreurs éventuelles

### Problèmes courants

1. **"Tool not found"**
   - Recréez le tool avec le bon ID
   - Mettez à jour l'agent avec le nouveau tool ID

2. **Webhook timeout**
   - Vérifiez que n8n est actif
   - Vérifiez l'URL du webhook
   - Augmentez le timeout dans ElevenLabs (20s par défaut)

3. **Agent ne comprend pas les commandes**
   - Vérifiez le prompt
   - Assurez-vous que la langue est "fr"
   - Testez avec des phrases simples

## 📊 Monitoring

### Métriques à suivre
- Taux de succès des réservations
- Temps moyen de conversation
- Erreurs de webhook
- Satisfaction client

### Logs utiles
- n8n: Executions history
- ElevenLabs: Agent analytics
- Webhook responses

## 🚀 Optimisations

### Performance
- Utilisez `optimize_streaming_latency: 3` pour réduire la latence
- Gardez les réponses concises
- Pré-chargez les disponibilités si possible

### Expérience utilisateur
- Message d'accueil clair
- Confirmation avant réservation
- Gestion des erreurs gracieuse
- Support multi-lingue possible

## 🔒 Sécurité

- Ne stockez jamais les clés API dans le code
- Utilisez HTTPS pour tous les webhooks
- Validez les données côté n8n
- Limitez les accès aux workflows sensibles

---

Pour plus d'aide, consultez:
- [Documentation ElevenLabs](https://elevenlabs.io/docs)
- [Documentation n8n](https://docs.n8n.io)
- [Issues GitHub](https://github.com/JSLeboeuf/elevenlabs-n8n-voice-agents/issues)