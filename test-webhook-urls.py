#!/usr/bin/env python3

import os
import requests

# Test différentes variations du webhook
urls = [
    'https://autoscaleai2001.app.n8n.cloud/webhook/appointment-webhook',
    'https://autoscaleai2001.app.n8n.cloud/webhook-test/appointment-webhook',
    'https://autoscaleai2001.app.n8n.cloud/webhook/PPiFahvC1cVOxlIk/appointment-webhook',
    'https://autoscaleai2001.app.n8n.cloud/webhook/appointment-webhook/PPiFahvC1cVOxlIk'
]

print('🔍 Test de différentes URLs de webhook:\n')

for url in urls:
    print(f'Test: {url}')
    try:
        # Test GET
        response = requests.get(url, timeout=5)
        print(f'  GET: {response.status_code}')
        
        # Test POST
        response = requests.post(url, json={'test': 'data'}, timeout=5)
        print(f'  POST: {response.status_code}')
        
        if response.status_code != 404:
            print(f'  ✅ Webhook trouvé!')
            print(f'  Réponse: {response.text[:200]}...')
    except Exception as e:
        print(f'  ❌ Erreur: {str(e)}')
    print()

# Test avec l'API n8n pour voir les webhooks actifs
print('\n📋 Vérification via API n8n...')
N8N_API_KEY = os.environ.get('N8N_API_KEY', '[YOUR_N8N_API_KEY]')
N8N_BASE_URL = 'https://autoscaleai2001.app.n8n.cloud'

headers = {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
}

# Essayer de trigger le workflow directement
workflow_id = 'PPiFahvC1cVOxlIk'
print(f'\n🚀 Tentative de trigger manuel du workflow {workflow_id}...')

try:
    # Essayer de trigger le workflow
    trigger_url = f'{N8N_BASE_URL}/api/v1/workflows/{workflow_id}/execute'
    test_data = {
        'data': {
            'tool': 'check',
            'name': 'Test API Trigger',
            'email': 'test@example.com',
            'startTime': 'demain 16h'
        }
    }
    
    response = requests.post(trigger_url, json=test_data, headers=headers)
    print(f'  Status: {response.status_code}')
    if response.status_code == 200:
        print('  ✅ Workflow exécuté avec succès!')
        print(f'  Réponse: {response.json()}')
    else:
        print(f'  ❌ Erreur: {response.text}')
        
except Exception as e:
    print(f'  ❌ Exception: {str(e)}')