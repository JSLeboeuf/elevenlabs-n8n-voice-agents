#!/usr/bin/env node

require('dotenv').config();
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const AgentCreator = require('../src/agent-creator');

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('name', { type: 'string', describe: "Nom de l'agent", default: process.env.AGENT_NAME || 'Assistant Rendez-vous' })
    .option('language', { type: 'string', describe: 'Langue', default: process.env.DEFAULT_LANGUAGE || 'fr' })
    .option('voiceId', { type: 'string', describe: 'Voice ID ElevenLabs', default: process.env.ELEVENLABS_DEFAULT_VOICE_ID })
    .option('webhookUrl', { type: 'string', describe: 'URL du webhook n8n', default: process.env.N8N_WEBHOOK_URL ? `${process.env.N8N_WEBHOOK_URL}/appointment` : undefined })
    .option('prompt', { type: 'string', describe: 'Prompt de l’agent' })
    .help()
    .argv;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY manquante dans .env');
    process.exit(1);
  }

  const creator = new AgentCreator(apiKey);

  console.log('🎙️ Création de l\'agent...');
  const result = await creator.createAppointmentAgent({
    name: argv.name,
    language: argv.language,
    voiceId: argv.voiceId,
    webhookUrl: argv.webhookUrl,
    prompt: argv.prompt
  });

  if (result.success) {
    console.log('✅ Agent créé avec succès!');
    console.log(`   Agent ID: ${result.agent.agentId}`);
    console.log(`   Tool ID: ${result.tool.toolId}`);
  } else {
    console.error('❌ Erreur:', result.error || 'Échec de la création');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Exception:', err?.message || err);
  process.exit(1);
});