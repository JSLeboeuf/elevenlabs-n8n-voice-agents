/**
 * ElevenLabs API Client
 * Gestion complète des agents vocaux ElevenLabs
 */

const axios = require('axios');

class ElevenLabsClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.elevenlabs.io/v1';
    this.headers = {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Créer un nouvel agent vocal
   */
  async createAgent(config) {
    try {
      // Créer l'agent de base
      const createResponse = await axios.post(
        `${this.baseURL}/convai/agents/create`,
        {
          conversation_config: {
            name: config.name || 'Assistant'
          }
        },
        { headers: this.headers }
      );

      const agentId = createResponse.data.agent_id;

      // Configurer l'agent complet
      const updateResponse = await axios.patch(
        `${this.baseURL}/convai/agents/${agentId}`,
        {
          name: config.name,
          conversation_config: {
            agent: {
              prompt: {
                prompt: config.prompt,
                tool_ids: config.toolIds || []
              },
              language: config.language || 'fr'
            },
            tts: {
              model_id: config.model || 'eleven_turbo_v2_5',
              voice_id: config.voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID
            }
          }
        },
        { headers: this.headers }
      );

      return {
        success: true,
        agentId,
        data: updateResponse.data
      };
    } catch (error) {
      console.error('Erreur création agent:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Créer un tool/webhook
   */
  async createTool(config) {
    try {
      const response = await axios.post(
        `${this.baseURL}/convai/tools`,
        {
          name: config.name,
          tool_config: {
            type: 'webhook',
            name: config.name,
            description: config.description,
            webhook: {
              url: config.webhookUrl,
              method: 'POST'
            },
            api_schema: {
              url: config.webhookUrl,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              request_body_schema: config.schema || {
                type: 'object',
                properties: {}
              }
            }
          }
        },
        { headers: this.headers }
      );

      return {
        success: true,
        toolId: response.data.id,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur création tool:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Lier un tool à un agent
   */
  async addToolToAgent(agentId, toolId) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/convai/agents/${agentId}`,
        {
          conversation_config: {
            agent: {
              prompt: {
                tool_ids: [toolId]
              }
            }
          }
        },
        { headers: this.headers }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur ajout tool:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Récupérer un agent
   */
  async getAgent(agentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/convai/agents/${agentId}`,
        { headers: this.headers }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Lister tous les agents
   */
  async listAgents() {
    try {
      const response = await axios.get(
        `${this.baseURL}/convai/agents`,
        { headers: this.headers }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Supprimer un agent
   */
  async deleteAgent(agentId) {
    try {
      await axios.delete(
        `${this.baseURL}/convai/agents/${agentId}`,
        { headers: this.headers }
      );

      return {
        success: true,
        message: 'Agent supprimé'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Récupérer les voix disponibles
   */
  async getVoices() {
    try {
      const response = await axios.get(
        `${this.baseURL}/voices`,
        { headers: this.headers }
      );

      return {
        success: true,
        voices: response.data.voices
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = ElevenLabsClient;