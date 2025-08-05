#!/usr/bin/env python3
"""
Script pour importer un workflow n8n via l'API
Nettoie automatiquement le JSON et gère les erreurs
"""

import json
import os
import requests
import sys
from typing import Dict, Any

# Configuration
N8N_API_KEY = os.environ.get('N8N_API_KEY', '[YOUR_N8N_API_KEY]')
N8N_BASE_URL = "https://autoscaleai2001.app.n8n.cloud"
WORKFLOW_FILE = "workflows/appointment-booking-system.json"

def clean_workflow_for_import(workflow: Dict[str, Any]) -> Dict[str, Any]:
    """
    Nettoie le workflow pour l'import en gardant seulement les champs requis
    """
    # Champs autorisés pour la création
    allowed_fields = ['name', 'nodes', 'connections', 'settings']
    
    # Créer un nouveau dict avec seulement les champs autorisés
    cleaned = {}
    for field in allowed_fields:
        if field in workflow:
            cleaned[field] = workflow[field]
    
    # S'assurer que settings existe
    if 'settings' not in cleaned:
        cleaned['settings'] = {"executionOrder": "v1"}
    
    # S'assurer que le nom est unique
    if 'name' in cleaned:
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        cleaned['name'] = f"{cleaned['name']} - {timestamp}"
    
    return cleaned

def import_workflow(workflow_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Importe le workflow via l'API n8n
    """
    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json"
    }
    
    url = f"{N8N_BASE_URL}/api/v1/workflows"
    
    print(f"📤 Envoi du workflow à: {url}")
    print(f"📋 Nom du workflow: {workflow_data.get('name', 'Sans nom')}")
    
    try:
        response = requests.post(url, json=workflow_data, headers=headers)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            result = response.json()
            print(f"✅ Workflow créé avec succès!")
            print(f"🆔 ID: {result.get('id', 'ID non trouvé')}")
            return result
        else:
            print(f"❌ Erreur: {response.status_code}")
            print(f"📝 Réponse: {response.text}")
            
            # Analyser l'erreur et proposer des solutions
            if "additional properties" in response.text:
                print("\n💡 Solution: Le workflow contient des propriétés non autorisées.")
                print("   Je vais réessayer avec un nettoyage plus strict...")
                
                # Nettoyage plus strict
                minimal_workflow = {
                    "name": workflow_data.get("name", "Appointment Booking System"),
                    "nodes": workflow_data.get("nodes", []),
                    "connections": workflow_data.get("connections", {}),
                    "settings": {"executionOrder": "v1"}
                }
                
                print("\n🔄 Nouvelle tentative avec workflow minimal...")
                response2 = requests.post(url, json=minimal_workflow, headers=headers)
                
                if response2.status_code in [200, 201]:
                    result = response2.json()
                    print(f"✅ Workflow créé avec succès après nettoyage!")
                    print(f"🆔 ID: {result.get('id', 'ID non trouvé')}")
                    return result
                else:
                    print(f"❌ Échec même après nettoyage: {response2.text}")
                    
            return None
            
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {str(e)}")
        return None

def activate_workflow(workflow_id: str) -> bool:
    """
    Active le workflow après création
    """
    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json"
    }
    
    # Essayer d'abord avec PATCH sur le workflow
    url = f"{N8N_BASE_URL}/api/v1/workflows/{workflow_id}"
    
    print(f"\n🔄 Activation du workflow {workflow_id}...")
    
    try:
        # Méthode 1: PATCH avec active: true
        response = requests.patch(url, json={"active": True}, headers=headers)
        
        if response.status_code == 200:
            print("✅ Workflow activé avec succès!")
            return True
        else:
            print(f"⚠️  Méthode 1 échouée: {response.status_code}")
            
            # Méthode 2: Endpoint spécifique /activate si disponible
            activate_url = f"{url}/activate"
            response2 = requests.post(activate_url, headers=headers)
            
            if response2.status_code == 200:
                print("✅ Workflow activé avec succès (méthode 2)!")
                return True
            else:
                print(f"❌ Impossible d'activer le workflow: {response2.text}")
                return False
                
    except Exception as e:
        print(f"❌ Erreur lors de l'activation: {str(e)}")
        return False

def main():
    """
    Fonction principale
    """
    print("🐙 IMPORT DE WORKFLOW N8N")
    print("=" * 50)
    
    # Charger le workflow
    try:
        with open(WORKFLOW_FILE, 'r') as f:
            workflow = json.load(f)
        print(f"✅ Workflow chargé depuis {WORKFLOW_FILE}")
    except FileNotFoundError:
        print(f"❌ Fichier non trouvé: {WORKFLOW_FILE}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"❌ Erreur de parsing JSON dans {WORKFLOW_FILE}")
        sys.exit(1)
    
    # Nettoyer le workflow
    cleaned_workflow = clean_workflow_for_import(workflow)
    print(f"🧹 Workflow nettoyé - {len(cleaned_workflow)} champs conservés")
    
    # Importer le workflow
    result = import_workflow(cleaned_workflow)
    
    if result and 'id' in result:
        workflow_id = result['id']
        print(f"\n📊 Détails du workflow créé:")
        print(f"   - ID: {workflow_id}")
        print(f"   - Nom: {result.get('name', 'N/A')}")
        print(f"   - Actif: {result.get('active', False)}")
        
        # Activer le workflow
        if not result.get('active', False):
            activate_workflow(workflow_id)
        
        # URL du webhook
        webhook_path = None
        for node in result.get('nodes', []):
            if node.get('type') == 'n8n-nodes-base.webhook':
                webhook_path = node.get('parameters', {}).get('path', '')
                break
        
        if webhook_path:
            webhook_url = f"{N8N_BASE_URL}/webhook/{webhook_path}"
            print(f"\n🔗 URL du Webhook: {webhook_url}")
        
        print(f"\n✅ SUCCÈS! Le workflow est prêt à utiliser.")
        print(f"📝 Pour voir le workflow: {N8N_BASE_URL}/workflow/{workflow_id}")
        
    else:
        print("\n❌ ÉCHEC de l'import du workflow")
        print("💡 Vérifiez que:")
        print("   1. L'API key est valide")
        print("   2. Le fichier workflow est correct")
        print("   3. L'instance n8n est accessible")

if __name__ == "__main__":
    main()