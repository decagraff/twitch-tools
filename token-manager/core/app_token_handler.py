import requests

class AppTokenHandler:
    def __init__(self):
        self.token_url = 'https://id.twitch.tv/oauth2/token'
    
    def get_app_token(self, client_id, client_secret):
        try:
            data = {
                'client_id': client_id,
                'client_secret': client_secret,
                'grant_type': 'client_credentials'
            }
            
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            response = requests.post(self.token_url, data=data, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Exception: {str(e)}")
            return None