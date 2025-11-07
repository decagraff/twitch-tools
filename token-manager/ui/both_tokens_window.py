from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                             QPushButton, QLabel, QTextEdit, QGroupBox,
                             QScrollArea, QCheckBox, QGridLayout)
from PyQt6.QtCore import Qt
from datetime import datetime
from ui.styles import MAIN_STYLE
from core.oauth_handler import OAuthHandler
from core.app_token_handler import AppTokenHandler

class BothTokensWindow(QMainWindow):
    def __init__(self, config):
        super().__init__()
        self.setWindowTitle('Generar Ambos Tokens')
        self.setGeometry(150, 150, 1000, 800)
        self.setStyleSheet(MAIN_STYLE)
        
        self.config = config
        self.oauth_handler = OAuthHandler()
        self.app_handler = AppTokenHandler()
        self.scopes = []
        
        self.init_ui()
    
    def init_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setSpacing(20)
        layout.setContentsMargins(30, 30, 30, 30)
        
        # Title
        title = QLabel('Generar User Token + App Token + Channel ID')
        title.setStyleSheet('font-size: 24px; font-weight: bold; color: #9146FF;')
        layout.addWidget(title)
        
        # Config Info
        info_group = QGroupBox('Configuración Actual')
        info_layout = QVBoxLayout()
        
        info_text = f"""Client ID: {self.config['client_id']}
Client Secret: {self.config['client_secret'][:10]}..."""
        
        info_label = QLabel(info_text)
        info_label.setStyleSheet('color: #b9b9b9; font-size: 12px;')
        info_layout.addWidget(info_label)
        
        info_group.setLayout(info_layout)
        layout.addWidget(info_group)
        
        # Scopes Section
        scopes_group = QGroupBox('Scopes (solo para User Token)')
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
        scroll.setMaximumHeight(150)
        
        scopes_widget = QWidget()
        scopes_grid = QGridLayout(scopes_widget)
        
        self.scope_checkboxes = []
        all_scopes = self.get_all_scopes()
        
        for i, scope in enumerate(all_scopes):
            cb = QCheckBox(scope)
            cb.stateChanged.connect(self.update_scopes)
            self.scope_checkboxes.append(cb)
            scopes_grid.addWidget(cb, i // 4, i % 4)
        
        scroll.setWidget(scopes_widget)
        scopes_layout.addWidget(scroll)
        
        scopes_group.setLayout(scopes_layout)
        layout.addWidget(scopes_group)
        
        # Generate Button
        gen_btn = QPushButton('Generar AMBOS Tokens')
        gen_btn.clicked.connect(self.generate_both_tokens)
        gen_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        layout.addWidget(gen_btn)
        
        # Token Display
        self.token_display = QTextEdit()
        self.token_display.setReadOnly(True)
        self.token_display.setPlaceholderText('Los tokens generados aparecerán aquí...')
        layout.addWidget(self.token_display)
        
        # Copy Button
        copy_btn = QPushButton('Copiar Todo')
        copy_btn.clicked.connect(self.copy_all)
        layout.addWidget(copy_btn)
    
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
    
    def generate_both_tokens(self):
        try:
            if not self.scopes:
                self.token_display.setText('Error: Selecciona al menos un scope para el User Token')
                return
            
            self.token_display.setText('Generando tokens...\n\n')
            
            # 1. Generar User Token
            self.token_display.append('1. Generando User Access Token...')
            user_token = self.oauth_handler.get_user_token_direct(
                self.config['client_id'],
                self.config['client_secret'],
                self.scopes
            )
            
            if not user_token:
                self.token_display.append('❌ Error al generar User Token\n')
                return
            
            self.token_display.append('✓ User Token generado\n')
            
            # 2. Obtener Channel ID
            self.token_display.append('2. Obteniendo Channel ID...')
            channel_info = self.oauth_handler.get_channel_id(
                user_token['access_token'],
                self.config['client_id']
            )
            
            if not channel_info:
                self.token_display.append('❌ Error al obtener Channel ID\n')
                return
            
            self.token_display.append('✓ Channel ID obtenido\n')
            
            # 3. Generar App Token
            self.token_display.append('3. Generando App Access Token...')
            app_token = self.app_handler.get_app_token(
                self.config['client_id'],
                self.config['client_secret']
            )
            
            if not app_token:
                self.token_display.append('❌ Error al generar App Token\n')
                return
            
            self.token_display.append('✓ App Token generado\n\n')
            
            # Mostrar todo
            self.display_all_tokens(user_token, app_token, channel_info)
            
        except Exception as e:
            self.token_display.setText(f'❌ Error inesperado: {str(e)}')
    
    def display_all_tokens(self, user_token, app_token, channel_info):
        try:
            now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            scopes_str = ' '.join(user_token.get('scope', []))
            
            text = f"""
═══════════════════════════════════════════════════════
                    DATOS COMPLETOS
═══════════════════════════════════════════════════════

📺 INFORMACIÓN DE CANAL:
   Channel ID: {channel_info['channel_id']}
   Username: {channel_info['username']}
   Display Name: {channel_info['display_name']}

🔑 USER ACCESS TOKEN:
   {user_token['access_token']}
   
   Token Type: {user_token.get('token_type', 'N/A')}
   Expires In: {user_token.get('expires_in', 'N/A')} segundos

   
🔐 APP ACCESS TOKEN:
   {app_token['access_token']}
   
   Token Type: {app_token.get('token_type', 'N/A')}
   Expires In: {app_token.get('expires_in', 'N/A')} segundos

⏰ GENERADO: {now}

═══════════════════════════════════════════════════════════════════════
              CONFIGURACIÓN JSON PARA - "appsettings.Secrets.json"
═══════════════════════════════════════════════════════════════════════

"TwitchSettings": {{
    "ClientId": "{self.config['client_id']}",
    "ClientSecret": "{self.config['client_secret']}",
    "BotUsername": "{channel_info['username']}",
    "ChannelId": "{channel_info['channel_id']}",
    "WebhookSecret": "{self.config.get('webhook_secret', 'N/A')}",
    "EventSubWebhookSecret": "{self.config.get('webhook_secret', 'N/A')}"
}},
"JwtSettings": {{
    "SecretKey": "{self.config.get('jwt_secret', 'N/A')}",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
}}

═══════════════════════════════════════════════════════════════════════
              CONFIGURACIÓN JSON PARA "appsettings.json"
═══════════════════════════════════════════════════════════════════════

"RedirectUri": "{self.config['redirect_uri']}",
"EventSubWebhookUrl": "{self.config['eventsub_url']}",


═══════════════════════════════════════════════════════
"""
            self.token_display.setText(text)
        except Exception as e:
            self.token_display.setText(f'❌ Error mostrando tokens: {str(e)}')
    
    def copy_all(self):
        try:
            from PyQt6.QtWidgets import QApplication
            text = self.token_display.toPlainText()
            if text.strip() and 'DATOS COMPLETOS' in text:
                QApplication.clipboard().setText(text)
                self.token_display.append('\n✓ Todo copiado al portapapeles')
            else:
                self.token_display.append('\n❌ No hay contenido para copiar')
        except Exception as e:
            self.token_display.append(f'\n❌ Error al copiar: {str(e)}')