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
    const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 15000);
    this.http = axios.create({ baseURL: this.baseURL, headers: this.headers, timeout: timeoutMs });
  }

  async _request(config, retries = 2) {
    try {
      return await this.http.request(config);
    } catch (error) {
      const status = error.response?.status;
      if (retries > 0 && (status === 429 || (status >= 500 && status <= 599))) {
        const backoffMs = (3 - retries) * 500;
        await new Promise(r => setTimeout(r, backoffMs));
        return this._request(config, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Créer un nouvel agent vocal
   */
  async createAgent(config) {
    try {
      // Créer l'agent de base
      const createResponse = await this._request({
        method: 'POST',
        url: '/convai/agents/create',
        data: {
          conversation_config: {
            name: config.name || 'Assistant'
          }
        }
      });

      const agentId = createResponse.data.agent_id;

      // Configurer l'agent complet
      const updateResponse = await this._request({
        method: 'PATCH',
        url: `/convai/agents/${agentId}`,
        data: {
          name: config.name,
          conversation_config: {
            agent: {
              prompt: {
                prompt: config.prompt,
                tool_ids: config.toolIds || []
              },
              language: config.language || process.env.DEFAULT_LANGUAGE || 'fr'
            },
            tts: {
              model_id: config.model || process.env.DEFAULT_MODEL || 'eleven_turbo_v2_5',
              voice_id: config.voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID
            }
          }
        }
      });

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
      const response = await this._request({
        method: 'POST',
        url: '/convai/tools',
        data: {
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
        }
      });

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
   * Lier un tool à un agent (en fusionnant avec les tools existants)
   */
  async addToolToAgent(agentId, toolId) {
    try {
      // Récupérer la config actuelle pour merger les tool_ids
      const current = await this._request({ method: 'GET', url: `/convai/agents/${agentId}` });
      const existingToolIds = current.data?.conversation_config?.agent?.prompt?.tool_ids || [];
      const mergedToolIds = Array.from(new Set([...existingToolIds, toolId]));

      const response = await this._request({
        method: 'PATCH',
        url: `/convai/agents/${agentId}`,
        data: {
          conversation_config: {
            agent: {
              prompt: {
                tool_ids: mergedToolIds
              }
            }
          }
        }
      });

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
      const response = await this._request({ method: 'GET', url: `/convai/agents/${agentId}` });
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
      const response = await this._request({ method: 'GET', url: '/convai/agents' });
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
      await this._request({ method: 'DELETE', url: `/convai/agents/${agentId}` });
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
      const response = await this._request({ method: 'GET', url: '/voices' });
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