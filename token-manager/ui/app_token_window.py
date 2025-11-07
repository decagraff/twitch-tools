from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                             QPushButton, QLabel, QLineEdit, QTextEdit, QGroupBox)
from PyQt6.QtCore import Qt
from datetime import datetime
from ui.styles import MAIN_STYLE
from core.app_token_handler import AppTokenHandler

class AppTokenWindow(QMainWindow):
    def __init__(self, config):
        super().__init__()
        self.setWindowTitle('App Access Token Generator')
        self.setGeometry(200, 200, 700, 500)
        self.setStyleSheet(MAIN_STYLE)
        
        self.config = config
        self.token_handler = AppTokenHandler()
        
        self.init_ui()
    
    def init_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setSpacing(20)
        layout.setContentsMargins(30, 30, 30, 30)
        
        # Title
        title = QLabel('App Access Token')
        title.setStyleSheet('font-size: 24px; font-weight: bold; color: #9146FF;')
        layout.addWidget(title)
        
        # Config Info
        info_group = QGroupBox('Configuración Actual')
        info_layout = QVBoxLayout()
        
        info_text = f"""Client ID: {self.config['client_id']}
Client Secret: {self.config['client_secret'][:10]}...
Grant Type: client_credentials"""
        
        info_label = QLabel(info_text)
        info_label.setStyleSheet('color: #b9b9b9; font-size: 12px;')
        info_layout.addWidget(info_label)
        
        info_group.setLayout(info_layout)
        layout.addWidget(info_group)
        
        # Generate Button
        gen_btn = QPushButton('Generar App Token')
        gen_btn.clicked.connect(self.generate_token)
        gen_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        layout.addWidget(gen_btn)
        
        # Token Display
        self.token_display = QTextEdit()
        self.token_display.setReadOnly(True)
        self.token_display.setPlaceholderText('El token generado aparecerá aquí...')
        self.token_display.setMaximumHeight(200)
        layout.addWidget(self.token_display)
        
        # Copy Button
        copy_btn = QPushButton('Copiar Token')
        copy_btn.clicked.connect(self.copy_token)
        layout.addWidget(copy_btn)
        
        layout.addStretch()
    
    def create_input(self, label, placeholder=''):
        layout = QHBoxLayout()
        lbl = QLabel(label)
        lbl.setMinimumWidth(120)
        inp = QLineEdit()
        inp.setPlaceholderText(placeholder)
        layout.addWidget(lbl)
        layout.addWidget(inp)
        return (layout, inp)
    
    def generate_token(self):
        try:
            client_id = self.config['client_id']
            client_secret = self.config['client_secret']
            
            self.token_display.setText('Generando token...')
            
            token_data = self.token_handler.get_app_token(client_id, client_secret)
            
            if token_data:
                self.display_token(token_data)
            else:
                self.token_display.setText('Error al generar el token')
        except Exception as e:
            self.token_display.setText(f'❌ Error inesperado: {str(e)}')
    
    def display_token(self, data):
        try:
            now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            text = f"""ACCESS TOKEN:
{data.get('access_token', 'N/A')}

TOKEN TYPE: {data.get('token_type', 'N/A')}
EXPIRES IN: {data.get('expires_in', 'N/A')} segundos

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