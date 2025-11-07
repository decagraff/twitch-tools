from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QPushButton, 
                             QLabel, QLineEdit, QGroupBox, QCheckBox)
from PyQt6.QtCore import Qt
from ui.styles import MAIN_STYLE
import secrets
import string

class ConfigDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle('Configuración Inicial')
        self.setModal(True)
        self.setGeometry(200, 200, 650, 600)
        self.setStyleSheet(MAIN_STYLE)
        
        self.config = {}
        self.init_ui()
    
    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        layout.setContentsMargins(30, 30, 30, 30)
        
        # Title
        title = QLabel('Configuración de Credenciales')
        title.setStyleSheet('font-size: 24px; font-weight: bold; color: #9146FF;')
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)
        
        # Twitch Credentials
        cred_group = QGroupBox('Credenciales de Twitch')
        cred_layout = QVBoxLayout()
        
        self.client_id = self.create_input('Client ID:', '')
        self.client_secret = self.create_input('Client Secret:', '')
        
        cred_layout.addLayout(self.client_id[0])
        cred_layout.addLayout(self.client_secret[0])
        
        cred_group.setLayout(cred_layout)
        layout.addWidget(cred_group)
        
        # Base URL
        url_group = QGroupBox('URL Base')
        url_layout = QVBoxLayout()
        
        self.base_url = self.create_input('Base URL:', 'https://localhost:7282')
        url_layout.addLayout(self.base_url[0])
        
        info = QLabel('Se agregará automáticamente:\n• /api/auth/callback\n• /api/eventsub/webhook\n• https://localhost:7282 es la URL por defecto de Decatron')
        info.setStyleSheet('color: #b9b9b9; font-size: 11px; margin-left: 130px;')
        url_layout.addWidget(info)
        
        url_group.setLayout(url_layout)
        layout.addWidget(url_group)
        
        # Secrets
        secret_group = QGroupBox('Secretos')
        secret_layout = QVBoxLayout()
        
        self.webhook_secret = self.create_input('Webhook Secret:')
        self.auto_webhook = QCheckBox('Generar automáticamente')
        self.auto_webhook.setChecked(True)
        self.auto_webhook.stateChanged.connect(lambda: self.toggle_secret(self.webhook_secret[1], self.auto_webhook))
        
        self.jwt_secret = self.create_input('JWT Secret Key:')
        self.auto_jwt = QCheckBox('Generar automáticamente')
        self.auto_jwt.setChecked(True)
        self.auto_jwt.stateChanged.connect(lambda: self.toggle_secret(self.jwt_secret[1], self.auto_jwt))
        
        secret_layout.addLayout(self.webhook_secret[0])
        secret_layout.addWidget(self.auto_webhook)
        secret_layout.addLayout(self.jwt_secret[0])
        secret_layout.addWidget(self.auto_jwt)
        
        secret_group.setLayout(secret_layout)
        layout.addWidget(secret_group)
        
        # Generate secrets initially
        self.webhook_secret[1].setEnabled(False)
        self.jwt_secret[1].setEnabled(False)
        self.webhook_secret[1].setText(self.generate_secret())
        self.jwt_secret[1].setText(self.generate_secret())
        
        # Info
        info = QLabel('Los secretos se generarán con 32 caracteres seguros')
        info.setStyleSheet('color: #b9b9b9; font-size: 12px; margin-top: 10px;')
        info.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(info)
        
        # Buttons
        btn_layout = QHBoxLayout()
        
        save_btn = QPushButton('Guardar y Continuar')
        save_btn.clicked.connect(self.save_config)
        save_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        
        cancel_btn = QPushButton('Cancelar')
        cancel_btn.clicked.connect(self.reject)
        cancel_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        cancel_btn.setStyleSheet('background-color: #2c2c2e;')
        
        btn_layout.addWidget(cancel_btn)
        btn_layout.addWidget(save_btn)
        
        layout.addLayout(btn_layout)
    
    def create_input(self, label, placeholder=''):
        layout = QHBoxLayout()
        lbl = QLabel(label)
        lbl.setMinimumWidth(130)
        inp = QLineEdit()
        inp.setPlaceholderText(placeholder)
        if placeholder:
            inp.setText(placeholder)
        layout.addWidget(lbl)
        layout.addWidget(inp)
        return (layout, inp)
    
    def generate_secret(self):
        chars = string.ascii_letters + string.digits
        return 'whsec_' + ''.join(secrets.choice(chars) for _ in range(32))
    
    def toggle_secret(self, input_field, checkbox):
        if checkbox.isChecked():
            input_field.setEnabled(False)
            input_field.setText(self.generate_secret())
        else:
            input_field.setEnabled(True)
    
    def save_config(self):
        try:
            client_id = self.client_id[1].text().strip()
            client_secret = self.client_secret[1].text().strip()
            base_url = self.base_url[1].text().strip()
            webhook_secret = self.webhook_secret[1].text().strip()
            jwt_secret = self.jwt_secret[1].text().strip()
            
            # Validaciones
            errors = []
            
            if not client_id:
                errors.append('• Client ID es requerido')
            elif len(client_id) < 10:
                errors.append('• Client ID inválido (muy corto)')
            
            if not client_secret:
                errors.append('• Client Secret es requerido')
            elif len(client_secret) < 10:
                errors.append('• Client Secret inválido (muy corto)')
            
            if not base_url:
                errors.append('• Base URL es requerida')
            elif not (base_url.startswith('http://') or base_url.startswith('https://')):
                errors.append('• Base URL debe comenzar con http:// o https://')
            
            if not webhook_secret or len(webhook_secret) < 25:
                errors.append('• Webhook Secret debe tener al menos 25 caracteres')
            
            if not jwt_secret or len(jwt_secret) < 25:
                errors.append('• JWT Secret debe tener al menos 25 caracteres')
            
            if errors:
                from PyQt6.QtWidgets import QMessageBox
                msg = QMessageBox(self)
                msg.setIcon(QMessageBox.Icon.Warning)
                msg.setWindowTitle('Errores de Validación')
                msg.setText('Por favor corrige los siguientes errores:')
                msg.setInformativeText('\n'.join(errors))
                msg.setStyleSheet(MAIN_STYLE)
                msg.exec()
                return
            
            # Construir URLs completas
            redirect_uri = base_url.rstrip('/') + '/api/auth/callback'
            eventsub_url = base_url.rstrip('/') + '/api/eventsub/webhook'
            
            self.config = {
                'client_id': client_id,
                'client_secret': client_secret,
                'base_url': base_url,
                'redirect_uri': redirect_uri,
                'eventsub_url': eventsub_url,
                'webhook_secret': webhook_secret,
                'jwt_secret': jwt_secret,
                'port': '7282'  # Default desde la URL
            }
            
            self.accept()
            
        except Exception as e:
            from PyQt6.QtWidgets import QMessageBox
            QMessageBox.critical(self, 'Error', f'Error inesperado: {str(e)}')
    
    def get_config(self):
        return self.config