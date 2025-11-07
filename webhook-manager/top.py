import requests

# 1. Configuración de tus credenciales de Twitch
client_id = 'pbkcyhuat521eff96jbagfi9fbel1s'
client_secret = '7xxgfec4p0xkndijmay41ucy9gqhps'

# 2. Función para obtener el token de acceso
def get_access_token(client_id, client_secret):
    url = 'https://id.twitch.tv/oauth2/token'
    params = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'client_credentials'
    }
    response = requests.post(url, params=params)
    return response.json()['access_token']

# 3. Función para obtener las categorías más populares
def get_top_categories(access_token, client_id):
    url = 'https://api.twitch.tv/helix/games/top'
    headers = {
        'Client-ID': client_id,
        'Authorization': f'Bearer {access_token}'
    }
    params = {
        'first': 20  # Número de categorías que quieres obtener
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()['data']

# 4. Obtener token de acceso
access_token = get_access_token(client_id, client_secret)

# 5. Obtener las categorías más populares
top_categories = get_top_categories(access_token, client_id)

# 6. Mostrar las categorías
for category in top_categories:
    print(f"Nombre: {category['name']} - ID: {category['id']}")

