/**
 * Met à jour le tool ElevenLabs avec la bonne URL du webhook n8n
 */

require('dotenv').config();
const axios = require('axios');

// Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const TOOL_ID = process.env.ELEVENLABS_TOOL_ID;
const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ? `${process.env.N8N_WEBHOOK_URL}/appointment-webhook` : undefined;

async function updateTool() {
  const url = `https://api.elevenlabs.io/v1/convai/conversation/update_tool/${TOOL_ID}`;
  
  const toolConfig = {
    description: "Gestionnaire de rendez-vous - vérifie les disponibilités et réserve des créneaux",
    webhook: {
      url: WEBHOOK_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    },
    schema: {
      type: "object",
      properties: {
        tool: {
          type: "string",
          enum: ["check", "book"],
          description: "Action à effectuer: check pour vérifier les disponibilités, book pour réserver"
        },
        name: {
          type: "string",
          description: "Nom complet du client"
        },
        email: {
          type: "string",
          description: "Email du client"
        },
        startTime: {
          type: "string",
          description: "Date et heure souhaitées (ex: 'demain 14h', '2024-01-15 10:00')"
        }
      },
      required: ["tool", "name"]
    }
  };

  try {
    if (!ELEVENLABS_API_KEY || !TOOL_ID || !WEBHOOK_URL) {
      throw new Error('Variables manquantes: ELEVENLABS_API_KEY, ELEVENLABS_TOOL_ID, N8N_WEBHOOK_URL');
    }
    console.log('🔧 Mise à jour du tool ElevenLabs...');
    console.log(`   Tool ID: ${TOOL_ID}`);
    console.log(`   Webhook URL: ${WEBHOOK_URL}`);
    
    const response = await axios.patch(url, toolConfig, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: Number(process.env.HTTP_TIMEOUT_MS || 15000)
    });

    console.log('\n✅ Tool mis à jour avec succès!');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Erreur lors de la mise à jour du tool:');
    console.error(error.response?.data || error.message);
    
    // Si le tool n'existe pas, essayer de le créer
    if (error.response?.status === 404) {
      console.log('\n🔄 Le tool n\'existe pas, tentative de création...');
      return createNewTool();
    }
  }
}

async function createNewTool() {
  const url = 'https://api.elevenlabs.io/v1/convai/conversation/create_tool';
  
  const toolConfig = {
    name: 'appointment_manager',
    description: "Gestionnaire de rendez-vous - vérifie les disponibilités et réserve des créneaux",
    webhook: {
      url: WEBHOOK_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    },
    schema: {
      type: "object",
      properties: {
        tool: {
          type: "string",
          enum: ["check", "book"],
          description: "Action à effectuer: check pour vérifier les disponibilités, book pour réserver"
        },
        name: {
          type: "string",
          description: "Nom complet du client"
        },
        email: {
          type: "string",
          description: "Email du client"
        },
        startTime: {
          type: "string",
          description: "Date et heure souhaitées (ex: 'demain 14h', '2024-01-15 10:00')"
        }
      },
      required: ["tool", "name"]
    }
  };

  try {
    const response = await axios.post(url, toolConfig, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Nouveau tool créé avec succès!');
    console.log(`   Tool ID: ${response.data.tool_id}`);
    console.log('\n⚠️  IMPORTANT: Mettez à jour l\'agent avec ce nouveau tool ID');
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Erreur lors de la création du tool:');
    console.error(error.response?.data || error.message);
  }
}

// Exécuter la mise à jour
updateTool().catch(console.error);