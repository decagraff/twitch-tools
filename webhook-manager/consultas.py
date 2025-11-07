import requests

# Reemplaza estos valores con tus credenciales y URL correctos
client_id = 'pbkcyhuat521eff96jbagfi9fbel1s'
bearer_token = 'c9nvdzvphsbuyer9cgr0a76omo1ayn'
url = 'https://api.twitch.tv/helix/eventsub/subscriptions'

# Realiza la solicitud a la API de Twitch
response = requests.get(url, headers={
    'Client-ID': client_id,
    'Authorization': f'Bearer {bearer_token}'
})

# Verifica el estado de la respuesta
if response.status_code == 200:
    data = response.json()
    webhook_ids = [subscription['id'] for subscription in data['data']]
    
    # Imprime los IDs en el formato deseado
    print("webhook_ids = [")
    for webhook_id in webhook_ids:
        print(f'    "{webhook_id}",')
    print("]")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
