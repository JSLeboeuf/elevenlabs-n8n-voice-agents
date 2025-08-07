/**
 * Crée ou met à jour le tool ElevenLabs pour le webhook n8n
 */

require('dotenv').config();
const ElevenLabsClient = require('./src/elevenlabs-client');

// Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ? `${process.env.N8N_WEBHOOK_URL}/appointment-webhook` : undefined;

async function setupTool() {
  if (!ELEVENLABS_API_KEY || !AGENT_ID || !WEBHOOK_URL) {
    console.error('❌ Variables manquantes. Requiert ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, N8N_WEBHOOK_URL');
    process.exit(1);
  }
  const client = new ElevenLabsClient(ELEVENLABS_API_KEY);
  
  console.log('🔧 Configuration du tool ElevenLabs pour le webhook n8n...\n');
  
  // Configuration du tool
  const toolConfig = {
    name: 'appointment_booking_tool',
    description: 'Gestionnaire de rendez-vous - vérifie les disponibilités et réserve des créneaux',
    webhookUrl: WEBHOOK_URL,
    schema: {
      type: 'object',
      properties: {
        tool: {
          type: 'string',
          enum: ['check', 'book'],
          description: 'Action à effectuer: check pour vérifier, book pour réserver'
        },
        name: {
          type: 'string',
          description: 'Nom complet du client'
        },
        email: {
          type: 'string',
          description: 'Email du client',
          format: 'email'
        },
        startTime: {
          type: 'string',
          description: 'Date et heure souhaitées (ex: demain 14h)'
        }
      },
      required: ['tool', 'name']
    }
  };
  
  // Créer le tool
  console.log('📤 Création du tool...');
  console.log(`   Webhook URL: ${WEBHOOK_URL}`);
  
  const toolResult = await client.createTool(toolConfig);
  
  if (toolResult.success) {
    console.log(`\n✅ Tool créé avec succès!`);
    console.log(`   Tool ID: ${toolResult.toolId}`);
    
    // Ajouter le tool à l'agent
    console.log(`\n🔗 Ajout du tool à l'agent ${AGENT_ID}...`);
    const linkResult = await client.addToolToAgent(AGENT_ID, toolResult.toolId);
    
    if (linkResult.success) {
      console.log('✅ Tool ajouté à l\'agent avec succès!');
      
      // Vérifier la configuration de l'agent
      const agentResult = await client.getAgent(AGENT_ID);
      if (agentResult.success) {
        console.log('\n📋 Configuration actuelle de l\'agent:');
        console.log(JSON.stringify(agentResult.data, null, 2));
      }
      
      console.log('\n🎉 Configuration terminée!');
      console.log('\nPour tester:');
      console.log('1. Allez sur ElevenLabs Dashboard');
      console.log('2. Trouvez votre agent "Assistant Rendez-vous AutoScale"');
      console.log('3. Testez avec "Je voudrais prendre rendez-vous"');
      
      return toolResult.toolId;
    } else {
      console.error('❌ Erreur lors de l\'ajout du tool à l\'agent:', linkResult.error);
    }
  } else {
    console.error('❌ Erreur lors de la création du tool:', toolResult.error);
  }
}

// Test direct du webhook
async function testWebhook() {
  console.log('\n\n🧪 Test direct du webhook n8n...');
  
  const axios = require('axios');
  const testData = {
    tool: 'check',
    name: 'Test Direct API',
    email: 'test@example.com',
    startTime: 'demain 15h'
  };
  
  try {
    console.log(`\n📤 Envoi vers: ${WEBHOOK_URL}`);
    console.log('   Données:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    
    console.log('\n✅ Réponse du webhook:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('\n❌ Erreur webhook:', error.response.status);
      console.error('   Message:', error.response.data);
    } else {
      console.error('\n❌ Erreur réseau:', error.message);
    }
  }
}

// Exécuter
async function main() {
  const toolId = await setupTool();
  if (toolId) {
    await testWebhook();
  }
}

main().catch(console.error);