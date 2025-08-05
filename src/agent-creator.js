/**
 * Agent Creator
 * Simplifie la création d'agents vocaux avec configurations prédéfinies
 */

const ElevenLabsClient = require('./elevenlabs-client');

class AgentCreator {
  constructor(apiKey) {
    this.client = new ElevenLabsClient(apiKey);
  }

  /**
   * Créer un agent de prise de rendez-vous
   */
  async createAppointmentAgent(config = {}) {
    const defaultConfig = {
      name: config.name || 'Assistant Rendez-vous',
      language: config.language || 'fr',
      voiceId: config.voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID,
      prompt: config.prompt || `Assistant vocal pour prise de rendez-vous.
        Demande poliment le nom, l'email et l'heure souhaitée.
        Utilise le tool checkavailability pour vérifier les disponibilités.
        Confirme toujours les informations avant de finaliser.
        Parle en français de manière professionnelle et amicale.`,
      webhookUrl: config.webhookUrl || process.env.N8N_WEBHOOK_URL + '/appointment'
    };

    // Créer le tool
    const toolResult = await this.client.createTool({
      name: 'checkavailability',
      description: 'Vérifie les disponibilités et réserve un rendez-vous',
      webhookUrl: defaultConfig.webhookUrl,
      schema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'check pour vérifier, book pour réserver'
          },
          name: {
            type: 'string',
            description: 'Nom du client'
          },
          email: {
            type: 'string',
            description: 'Email du client'
          },
          dateTime: {
            type: 'string',
            description: 'Date et heure souhaitées (format ISO)'
          }
        }
      }
    });

    if (!toolResult.success) {
      return toolResult;
    }

    // Créer l'agent
    const agentResult = await this.client.createAgent({
      name: defaultConfig.name,
      language: defaultConfig.language,
      voiceId: defaultConfig.voiceId,
      prompt: defaultConfig.prompt,
      toolIds: [toolResult.toolId]
    });

    return {
      success: agentResult.success,
      agent: agentResult,
      tool: toolResult
    };
  }

  /**
   * Créer un agent de support client
   */
  async createSupportAgent(config = {}) {
    const defaultConfig = {
      name: config.name || 'Support Client',
      language: config.language || 'fr',
      voiceId: config.voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID,
      prompt: config.prompt || `Assistant de support client professionnel.
        Écoute attentivement les problèmes des clients.
        Propose des solutions adaptées.
        Escalade vers un humain si nécessaire.
        Reste toujours courtois et empathique.`,
      webhookUrl: config.webhookUrl || process.env.N8N_WEBHOOK_URL + '/support'
    };

    // Créer les tools
    const tools = [];

    // Tool pour créer un ticket
    const ticketTool = await this.client.createTool({
      name: 'create_ticket',
      description: 'Créer un ticket de support',
      webhookUrl: defaultConfig.webhookUrl + '/ticket',
      schema: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Sujet du problème' },
          description: { type: 'string', description: 'Description détaillée' },
          priority: { type: 'string', description: 'low, medium, high' },
          customerEmail: { type: 'string', description: 'Email du client' }
        }
      }
    });

    if (ticketTool.success) tools.push(ticketTool.toolId);

    // Tool pour chercher dans la FAQ
    const faqTool = await this.client.createTool({
      name: 'search_faq',
      description: 'Rechercher dans la base de connaissances',
      webhookUrl: defaultConfig.webhookUrl + '/faq',
      schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Question ou mots-clés' }
        }
      }
    });

    if (faqTool.success) tools.push(faqTool.toolId);

    // Créer l'agent
    const agentResult = await this.client.createAgent({
      name: defaultConfig.name,
      language: defaultConfig.language,
      voiceId: defaultConfig.voiceId,
      prompt: defaultConfig.prompt,
      toolIds: tools
    });

    return {
      success: agentResult.success,
      agent: agentResult,
      tools: { ticketTool, faqTool }
    };
  }

  /**
   * Créer un agent de vente
   */
  async createSalesAgent(config = {}) {
    const defaultConfig = {
      name: config.name || 'Assistant Commercial',
      language: config.language || 'fr',
      voiceId: config.voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID,
      prompt: config.prompt || `Assistant commercial expert et persuasif.
        Présente les produits de manière attrayante.
        Identifie les besoins du client.
        Propose des solutions adaptées.
        Guide vers l'achat de manière naturelle.`,
      webhookUrl: config.webhookUrl || process.env.N8N_WEBHOOK_URL + '/sales'
    };

    // Créer les tools nécessaires
    const tools = [];

    // Tool pour obtenir info produit
    const productTool = await this.client.createTool({
      name: 'get_product_info',
      description: 'Obtenir les détails d\'un produit',
      webhookUrl: defaultConfig.webhookUrl + '/product',
      schema: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID ou nom du produit' }
        }
      }
    });

    if (productTool.success) tools.push(productTool.toolId);

    // Tool pour calculer un devis
    const quoteTool = await this.client.createTool({
      name: 'calculate_quote',
      description: 'Calculer un devis personnalisé',
      webhookUrl: defaultConfig.webhookUrl + '/quote',
      schema: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            description: 'Liste des produits',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                quantity: { type: 'number' }
              }
            }
          },
          customerEmail: { type: 'string', description: 'Email pour envoyer le devis' }
        }
      }
    });

    if (quoteTool.success) tools.push(quoteTool.toolId);

    // Créer l'agent
    const agentResult = await this.client.createAgent({
      name: defaultConfig.name,
      language: defaultConfig.language,
      voiceId: defaultConfig.voiceId,
      prompt: defaultConfig.prompt,
      toolIds: tools
    });

    return {
      success: agentResult.success,
      agent: agentResult,
      tools: { productTool, quoteTool }
    };
  }

  /**
   * Créer un agent personnalisé
   */
  async createCustomAgent(config) {
    // Créer les tools si fournis
    const toolIds = [];
    if (config.tools && config.tools.length > 0) {
      for (const toolConfig of config.tools) {
        const toolResult = await this.client.createTool(toolConfig);
        if (toolResult.success) {
          toolIds.push(toolResult.toolId);
        }
      }
    }

    // Créer l'agent
    const agentResult = await this.client.createAgent({
      ...config,
      toolIds
    });

    return agentResult;
  }
}

module.exports = AgentCreator;