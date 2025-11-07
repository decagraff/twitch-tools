import requests

def delete_webhook(webhook_id, bearer_token):
    url = f"https://api.twitch.tv/helix/eventsub/subscriptions?id={webhook_id}"
    headers = {
        'Client-ID': 'pbkcyhuat521eff96jbagfi9fbel1s',  # Reemplaza con tu Client-ID
        'Authorization': f'Bearer {bearer_token}',
        'Content-Type': 'application/json'
    }
    response = requests.delete(url, headers=headers)
    if response.status_code == 204:
        print(f"Elemento con ID {webhook_id} ha sido eliminado.")
    else:
        print(f"Error al eliminar el webhook con ID {webhook_id}: {response.status_code} - {response.text}")

def main():
    # Token de acceso (debe ser válido y tener permisos para gestionar webhooks)
    bearer_token = 's96c8mdouqjop9oug57mbw4igsorx2'  # Reemplaza con tu token de acceso

    # IDs de los webhooks a eliminar
    webhook_ids = [
    "a3791d67-2ebd-48f6-af35-eac1e34f762a",
]




    for webhook_id in webhook_ids:
        delete_webhook(webhook_id, bearer_token)

if __name__ == "__main__":
    main()
