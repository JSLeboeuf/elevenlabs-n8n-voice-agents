/**
 * Test du flux complet de réservation
 * Simule les appels webhook que ferait l'agent ElevenLabs
 */

const axios = require('axios');

// Configuration
const WEBHOOK_URL = 'https://autoscaleai2001.app.n8n.cloud/webhook/appointment-webhook';

async function testWebhook(data) {
  try {
    console.log('\n📤 Envoi:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Réponse:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Test du système de réservation de rendez-vous\n');
  console.log('Webhook URL:', WEBHOOK_URL);
  console.log('='.repeat(60));

  // Test 1: Vérifier les disponibilités
  console.log('\n📅 TEST 1: Vérification des disponibilités');
  await testWebhook({
    tool: 'check',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    startTime: 'demain 14h'
  });

  // Attendre un peu entre les tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Réserver un créneau
  console.log('\n📝 TEST 2: Réservation d\'un créneau');
  await testWebhook({
    tool: 'book',
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    startTime: 'demain 10h'
  });

  // Test 3: Cas avec données manquantes
  console.log('\n⚠️ TEST 3: Test avec email manquant');
  await testWebhook({
    tool: 'book',
    name: 'Paul Sans Email',
    startTime: 'lundi prochain 15h'
  });

  // Test 4: Format de date différent
  console.log('\n🕐 TEST 4: Test avec format de date ISO');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(16, 0, 0, 0);
  
  await testWebhook({
    tool: 'check',
    name: 'Sophie Tech',
    email: 'sophie@tech.com',
    startTime: tomorrow.toISOString()
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests terminés!');
  console.log('\nPour tester avec l\'agent vocal:');
  console.log('1. Ouvre ElevenLabs Dashboard');
  console.log('2. Va sur l\'agent "Assistant Rendez-vous AutoScale"');
  console.log('3. Clique sur "Test Agent" ou utilise le widget');
  console.log('4. Dis "Je voudrais prendre rendez-vous"');
  console.log('5. L\'agent te guidera pour le reste!');
}

// Lancer les tests
runTests().catch(console.error);