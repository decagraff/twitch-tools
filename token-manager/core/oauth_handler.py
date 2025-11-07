import requests
from PyQt6.QtWidgets import QDialog, QVBoxLayout, QLabel, QLineEdit, QPushButton
from PyQt6.QtCore import Qt

class OAuthHandler:
    def __init__(self):
        self.token_data = None
    
    def get_user_token_direct(self, client_id, client_secret, scopes):
        """Obtener token usando Device Flow en la misma app"""
        try:
            # Step 1: Solicitar código de dispositivo
            device_url = 'https://id.twitch.tv/oauth2/device'
            device_data = {
                'client_id': client_id,
                'scopes': ' '.join(scopes)
            }
            
            device_response = requests.post(device_url, data=device_data)
            
            if device_response.status_code != 200:
                return None
            
            device_info = device_response.json()
            device_code = device_info['device_code']
            user_code = device_info['user_code']
            verification_uri = device_info['verification_uri']
            
            # Mostrar código al usuario
            dialog = DeviceCodeDialog(user_code, verification_uri)
            if not dialog.exec():
                return None
            
            # Step 2: Poll para obtener token
            token_url = 'https://id.twitch.tv/oauth2/token'
            interval = device_info.get('interval', 5)
            
            import time
            max_attempts = 60
            attempts = 0
            
            while attempts < max_attempts:
                time.sleep(interval)
                
                token_data = {
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'device_code': device_code,
                    'grant_type': 'urn:ietf:params:oauth:grant-type:device_code'
                }
                
                token_response = requests.post(token_url, data=token_data)
                
                if token_response.status_code == 200:
                    return token_response.json()
                elif token_response.status_code == 400:
                    error = token_response.json().get('message', '')
                    if 'pending' not in error.lower():
                        return None
                
                attempts += 1
            
            return None
            
        except Exception as e:
            print(f"Error en Device Flow: {str(e)}")
            return None
    
    def get_channel_id(self, access_token, client_id):
        """Obtener Channel ID usando el access token"""
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Client-Id': client_id
            }
            
            response = requests.get('https://api.twitch.tv/helix/users', headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data['data']:
                    user = data['data'][0]
                    return {
                        'channel_id': user['id'],
                        'username': user['login'],
                        'display_name': user['display_name']
                    }
            
            return None
            
        except Exception as e:
            print(f"Error obteniendo Channel ID: {str(e)}")
            return None


class DeviceCodeDialog(QDialog):
    def __init__(self, user_code, verification_uri, parent=None):
        super().__init__(parent)
        self.setWindowTitle('Autorización Requerida')
        self.setModal(True)
        self.setGeometry(300, 300, 500, 400)
        
        from ui.styles import MAIN_STYLE
        self.setStyleSheet(MAIN_STYLE)
        
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        layout.setContentsMargins(30, 30, 30, 30)
        
        title = QLabel('Autoriza la aplicación en Twitch')
        title.setStyleSheet('font-size: 20px; font-weight: bold; color: #9146FF;')
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)
        
        instructions = QLabel(f'1. Abre tu navegador en:')
        instructions.setStyleSheet('font-size: 14px; color: white; margin-bottom: 5px;')
        instructions.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(instructions)
        
        # URL Field
        url_input = QLineEdit(verification_uri)
        url_input.setReadOnly(True)
        url_input.setAlignment(Qt.AlignmentFlag.AlignCenter)
        url_input.setStyleSheet('font-size: 12px; padding: 10px;')
        layout.addWidget(url_input)
        
        copy_url_btn = QPushButton('Copiar URL')
        copy_url_btn.clicked.connect(lambda: self.copy_text(verification_uri))
        copy_url_btn.setStyleSheet('background-color: #2c2c2e; margin-bottom: 15px;')
        layout.addWidget(copy_url_btn)
        
        instructions2 = QLabel('2. Ingresa este código:')
        instructions2.setStyleSheet('font-size: 14px; color: white; margin-top: 5px;')
        instructions2.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(instructions2)
        
        code_input = QLineEdit(user_code)
        code_input.setReadOnly(True)
        code_input.setAlignment(Qt.AlignmentFlag.AlignCenter)
        code_input.setStyleSheet('font-size: 24px; font-weight: bold; padding: 15px;')
        layout.addWidget(code_input)
        
        copy_btn = QPushButton('Copiar Código')
        copy_btn.clicked.connect(lambda: self.copy_text(user_code))
        layout.addWidget(copy_btn)
        
        info = QLabel('Esperando autorización...')
        info.setStyleSheet('color: #b9b9b9; font-size: 12px; margin-top: 10px;')
        info.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(info)
        
        ok_btn = QPushButton('Ya Autoricé')
        ok_btn.clicked.connect(self.accept)
        layout.addWidget(ok_btn)
        
        cancel_btn = QPushButton('Cancelar')
        cancel_btn.clicked.connect(self.reject)
        cancel_btn.setStyleSheet('background-color: #2c2c2e;')
        layout.addWidget(cancel_btn)
    
    def copy_text(self, text):
        from PyQt6.QtWidgets import QApplication
        QApplication.clipboard().setText(text)