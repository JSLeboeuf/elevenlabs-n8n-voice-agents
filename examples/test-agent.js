/**
 * Test de création d'agent
 * Exemple d'utilisation de la librairie
 */

require('dotenv').config();
const AgentCreator = require('../src/agent-creator');

async function testCreateAgent() {
  console.log('🎙️ Test de création d\'agent ElevenLabs\n');

  // Vérifier les clés API
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY manquante dans .env');
    process.exit(1);
  }

  const creator = new AgentCreator(process.env.ELEVENLABS_API_KEY);

  try {
    // Test 1: Créer un agent de rendez-vous
    console.log('📅 Création d\'un agent de prise de rendez-vous...');
    const appointmentAgent = await creator.createAppointmentAgent({
      name: 'Assistant AutoScale RDV',
      webhookUrl: process.env.TEST_WEBHOOK_URL || 'https://autoscaleai2001.app.n8n.cloud/webhook-test/appointment-webhook'
    });

    if (appointmentAgent.success) {
      console.log('✅ Agent rendez-vous créé!');
      console.log(`   ID: ${appointmentAgent.agent.agentId}`);
      console.log(`   Tool ID: ${appointmentAgent.tool.toolId}`);
    } else {
      console.log('❌ Erreur:', appointmentAgent.error);
    }

    // Test 2: Créer un agent de support
    console.log('\n🎧 Création d\'un agent de support client...');
    const supportAgent = await creator.createSupportAgent({
      name: 'Support AutoScale',
      prompt: 'Assistant de support technique expert en solutions cloud et automatisation.'
    });

    if (supportAgent.success) {
      console.log('✅ Agent support créé!');
      console.log(`   ID: ${supportAgent.agent.agentId}`);
      console.log(`   Tools: ${Object.keys(supportAgent.tools).length} tools créés`);
    }

    // Test 3: Créer un agent personnalisé
    console.log('\n🛠️ Création d\'un agent personnalisé...');
    const customAgent = await creator.createCustomAgent({
      name: 'Agent Custom Test',
      language: 'fr',
      prompt: 'Agent de test personnalisé qui répond aux questions.',
      tools: [
        {
          name: 'custom_tool',
          description: 'Outil personnalisé de test',
          webhookUrl: 'https://example.com/webhook',
          schema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Question' }
            }
          }
        }
      ]
    });

    if (customAgent.success) {
      console.log('✅ Agent personnalisé créé!');
      console.log(`   ID: ${customAgent.agentId}`);
    }

    // Lister tous les agents
    console.log('\n📋 Liste des agents:');
    const client = creator.client;
    const listResult = await client.listAgents();
    
    if (listResult.success && listResult.data) {
      console.log(`   Total: ${listResult.data.length || 0} agents`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le test
testCreateAgent();