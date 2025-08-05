#!/usr/bin/env python3
"""
Debug le workflow n8n et trouve la bonne configuration
"""

import os
import requests
import json

N8N_API_KEY = os.environ.get('N8N_API_KEY', '[YOUR_N8N_API_KEY]')
N8N_BASE_URL = 'https://autoscaleai2001.app.n8n.cloud'

headers = {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
}

print("🔍 DEBUG DU WORKFLOW N8N")
print("=" * 60)

# 1. Lister tous les workflows
print("\n1. Liste des workflows actifs:")
response = requests.get(f'{N8N_BASE_URL}/api/v1/workflows', headers=headers)
if response.status_code == 200:
    workflows = response.json()['data']
    for wf in workflows:
        if wf.get('active', False):
            print(f"   - {wf['name']} (ID: {wf['id']})")
            
            # Obtenir les détails pour les workflows avec "appointment" dans le nom
            if 'appointment' in wf['name'].lower():
                detail_response = requests.get(f'{N8N_BASE_URL}/api/v1/workflows/{wf["id"]}', headers=headers)
                if detail_response.status_code == 200:
                    workflow_data = detail_response.json()
                    
                    # Chercher les webhooks
                    webhook_nodes = [n for n in workflow_data.get('nodes', []) if n.get('type') == 'n8n-nodes-base.webhook']
                    if webhook_nodes:
                        print(f"     📌 Webhooks trouvés:")
                        for node in webhook_nodes:
                            path = node.get('parameters', {}).get('path', '')
                            print(f"        - Path: {path}")
                            print(f"        - Test URL: {N8N_BASE_URL}/webhook-test/{path}")
                            print(f"        - Prod URL: {N8N_BASE_URL}/webhook/{path}")

# 2. Essayer de désactiver et réactiver le workflow
print("\n2. Tentative de réactivation du workflow PPiFahvC1cVOxlIk:")
workflow_id = 'PPiFahvC1cVOxlIk'

# Désactiver
print("   - Désactivation...")
response = requests.patch(
    f'{N8N_BASE_URL}/api/v1/workflows/{workflow_id}',
    json={'active': False},
    headers=headers
)
print(f"     Status: {response.status_code}")

# Réactiver
print("   - Réactivation...")
response = requests.patch(
    f'{N8N_BASE_URL}/api/v1/workflows/{workflow_id}',
    json={'active': True},
    headers=headers
)
print(f"     Status: {response.status_code}")

if response.status_code == 200:
    print("   ✅ Workflow réactivé!")
    
    # Tester le webhook après réactivation
    print("\n3. Test du webhook après réactivation:")
    webhook_url = f'{N8N_BASE_URL}/webhook/appointment-webhook'
    test_data = {
        'tool': 'check',
        'name': 'Test Réactivation',
        'email': 'test@example.com',
        'startTime': 'demain 14h'
    }
    
    response = requests.post(webhook_url, json=test_data, timeout=10)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Webhook fonctionne!")
        print(f"   Réponse: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"   ❌ Erreur: {response.text}")

# 4. Alternative: utiliser le webhook de test
print("\n4. Test avec webhook de test (mode développement):")
test_webhook_url = f'{N8N_BASE_URL}/webhook-test/appointment-webhook'
print(f"   URL: {test_webhook_url}")
print("   ⚠️  Note: En mode test, vous devez d'abord cliquer sur 'Execute Workflow' dans l'interface n8n")

# 5. Suggestion finale
print("\n" + "=" * 60)
print("💡 SOLUTIONS POSSIBLES:")
print("1. Ouvrez n8n dans votre navigateur: " + N8N_BASE_URL)
print("2. Allez dans le workflow 'Appointment Booking System - 20250805_010732'")
print("3. Cliquez sur 'Execute Workflow' pour activer le webhook en mode test")
print("4. OU utilisez le webhook de test avec l'URL: " + test_webhook_url)
print("5. OU créez un nouveau workflow manuellement dans l'interface n8n")