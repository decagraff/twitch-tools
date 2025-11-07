from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QLabel, QLineEdit, QTextEdit, 
                             QScrollArea, QCheckBox, QGridLayout, QGroupBox)
from PyQt6.QtCore import Qt
from datetime import datetime
from ui.styles import MAIN_STYLE
from core.oauth_handler import OAuthHandler

class UserTokenWindow(QMainWindow):
    def __init__(self, config):
        super().__init__()
        self.setWindowTitle('User Access Token Generator')
        self.setGeometry(150, 150, 900, 700)
        self.setStyleSheet(MAIN_STYLE)
        
        self.config = config
        self.oauth_handler = OAuthHandler()
        self.scopes = []
        
        self.init_ui()
    
    def init_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setSpacing(20)
        layout.setContentsMargins(30, 30, 30, 30)
        
        # Title
        title = QLabel('User Access Token')
        title.setStyleSheet('font-size: 24px; font-weight: bold; color: #9146FF;')
        layout.addWidget(title)
        
        # Config Info
        info_group = QGroupBox('Configuración Actual')
        info_layout = QVBoxLayout()
        
        info_text = f"""Client ID: {self.config['client_id']}
Redirect URI: {self.config['redirect_uri']}
Puerto: {self.config['port']}"""
        
        info_label = QLabel(info_text)
        info_label.setStyleSheet('color: #b9b9b9; font-size: 12px;')
        info_layout.addWidget(info_label)
        
        info_group.setLayout(info_layout)
        layout.addWidget(info_group)
        
        # Scopes Section
        scopes_group = QGroupBox('Scopes')
        scopes_layout = QVBoxLayout()
        
        # Botones para seleccionar/deseleccionar
        btn_layout = QHBoxLayout()
        select_all_btn = QPushButton('Seleccionar Todos')
        select_all_btn.clicked.connect(self.select_all_scopes)
        select_all_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        
        deselect_all_btn = QPushButton('Deseleccionar Todos')
        deselect_all_btn.clicked.connect(self.deselect_all_scopes)
        deselect_all_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        deselect_all_btn.setStyleSheet('background-color: #2c2c2e;')
        
        btn_layout.addWidget(select_all_btn)
        btn_layout.addWidget(deselect_all_btn)
        scopes_layout.addLayout(btn_layout)
        
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setMaximumHeight(200)
        
        scopes_widget = QWidget()
        scopes_grid = QGridLayout(scopes_widget)
        
        self.scope_checkboxes = []
        all_scopes = self.get_all_scopes()
        
        for i, scope in enumerate(all_scopes):
            cb = QCheckBox(scope)
            cb.stateChanged.connect(self.update_scopes)
            self.scope_checkboxes.append(cb)
            scopes_grid.addWidget(cb, i // 3, i % 3)
        
        scroll.setWidget(scopes_widget)
        scopes_layout.addWidget(scroll)
        
        scopes_group.setLayout(scopes_layout)
        layout.addWidget(scopes_group)
        
        # Generate Button
        gen_btn = QPushButton('Generar User Token')
        gen_btn.clicked.connect(self.generate_token)
        gen_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        layout.addWidget(gen_btn)
        
        # Token Display
        self.token_display = QTextEdit()
        self.token_display.setReadOnly(True)
        self.token_display.setPlaceholderText('El token generado aparecerá aquí...')
        self.token_display.setMaximumHeight(150)
        layout.addWidget(self.token_display)
        
        # Copy Button
        copy_btn = QPushButton('Copiar Token')
        copy_btn.clicked.connect(self.copy_token)
        layout.addWidget(copy_btn)
    
    def create_input(self, label, placeholder=''):
        layout = QHBoxLayout()
        lbl = QLabel(label)
        lbl.setMinimumWidth(120)
        inp = QLineEdit()
        inp.setPlaceholderText(placeholder)
        layout.addWidget(lbl)
        layout.addWidget(inp)
        return (layout, inp)
    
    def get_all_scopes(self):
        return [
            'analytics:read:extensions', 'analytics:read:games', 'bits:read',
            'channel:bot', 'channel:manage:ads', 'channel:read:ads',
            'channel:manage:broadcast', 'channel:read:charity', 'channel:edit:commercial',
            'channel:read:editors', 'channel:manage:extensions', 'channel:read:goals',
            'channel:read:guest_star', 'channel:manage:guest_star', 'channel:read:hype_train',
            'channel:manage:moderators', 'channel:moderate', 'channel:read:polls',
            'channel:manage:polls', 'channel:read:predictions', 'channel:manage:predictions',
            'channel:manage:raids', 'channel:read:redemptions', 'channel:manage:redemptions',
            'channel:manage:schedule', 'channel:read:stream_key', 'channel:read:subscriptions',
            'channel:manage:videos', 'channel:read:vips', 'channel:manage:vips',
            'clips:edit', 'moderation:read', 'moderator:manage:announcements',
            'moderator:manage:automod', 'moderator:read:automod_settings',
            'moderator:manage:automod_settings', 'moderator:read:banned_users',
            'moderator:manage:banned_users', 'moderator:read:blocked_terms',
            'moderator:manage:blocked_terms', 'moderator:read:chat_messages',
            'moderator:manage:chat_messages', 'moderator:read:chat_settings',
            'moderator:manage:chat_settings', 'moderator:read:chatters',
            'moderator:read:followers', 'moderator:read:guest_star',
            'moderator:manage:guest_star', 'moderator:read:moderators',
            'moderator:read:shield_mode', 'moderator:manage:shield_mode',
            'moderator:read:shoutouts', 'moderator:manage:shoutouts',
            'moderator:read:suspicious_users', 'moderator:read:unban_requests',
            'moderator:manage:unban_requests', 'moderator:read:vips',
            'moderator:read:warnings', 'moderator:manage:warnings',
            'user:bot', 'user:edit', 'user:edit:broadcast',
            'user:read:blocked_users', 'user:manage:blocked_users', 'user:read:broadcast',
            'user:read:chat', 'user:manage:chat_color', 'user:read:email',
            'user:read:emotes', 'user:read:follows', 'user:read:moderated_channels',
            'user:read:subscriptions', 'user:read:whispers', 'user:manage:whispers',
            'user:write:chat', 'chat:read', 'chat:edit', 'whispers:read'
        ]

    
    def update_scopes(self):
        self.scopes = [cb.text() for cb in self.scope_checkboxes if cb.isChecked()]
    
    def select_all_scopes(self):
        for cb in self.scope_checkboxes:
            cb.setChecked(True)
    
    def deselect_all_scopes(self):
        for cb in self.scope_checkboxes:
            cb.setChecked(False)
    
    def generate_token(self):
        try:
            client_id = self.config['client_id']
            redirect_uri = self.config['redirect_uri']
            port = int(self.config['port'])
            
            if not self.scopes:
                self.token_display.setText('Error: Selecciona al menos un scope')
                return
            
            self.token_display.setText('Generando token...')
            
            token_data = self.oauth_handler.get_user_token_direct(
                client_id, self.config['client_secret'], self.scopes
            )
            
            if token_data:
                # Obtener Channel ID
                channel_info = self.oauth_handler.get_channel_id(
                    token_data['access_token'], 
                    client_id
                )
                if channel_info:
                    token_data.update(channel_info)
                
                self.display_token(token_data)
            else:
                self.token_display.setText('Error al generar el token')
        except Exception as e:
            self.token_display.setText(f'❌ Error inesperado: {str(e)}')
    
    def display_token(self, data):
        try:
            now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            channel_info = ''
            if 'channel_id' in data:
                channel_info = f"""
CHANNEL ID: {data.get('channel_id', 'N/A')}
USERNAME: {data.get('username', 'N/A')}
DISPLAY NAME: {data.get('display_name', 'N/A')}
"""
            
            scopes_str = ' '.join(data.get('scope', []))
            
            text = f"""ACCESS TOKEN:
{data.get('access_token', 'N/A')}

TOKEN TYPE: {data.get('token_type', 'N/A')}
EXPIRES IN: {data.get('expires_in', 'N/A')} segundos
SCOPES: {scopes_str}
{channel_info}
GENERADO: {now}
"""
            self.token_display.setText(text)
        except Exception as e:
            self.token_display.setText(f'❌ Error mostrando token: {str(e)}')
    
    def copy_token(self):
        try:
            from PyQt6.QtWidgets import QApplication
            text = self.token_display.toPlainText()
            if 'ACCESS TOKEN:' in text:
                lines = text.split('\n')
                token = lines[1] if len(lines) > 1 else ''
                if token.strip():
                    QApplication.clipboard().setText(token.strip())
                    self.token_display.append('\n✓ Token copiado al portapapeles')
                else:
                    self.token_display.append('\n❌ No hay token para copiar')
            else:
                self.token_display.append('\n❌ No hay token para copiar')
        except Exception as e:
            self.token_display.append(f'\n❌ Error al copiar: {str(e)}')