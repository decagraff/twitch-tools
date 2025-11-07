from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QLabel, QFrame)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont, QIcon
from ui.user_token_window import UserTokenWindow
from ui.app_token_window import AppTokenWindow
from ui.both_tokens_window import BothTokensWindow
from ui.config_dialog import ConfigDialog
from ui.styles import MAIN_STYLE
import os
import sys

def resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('Twitch Token Manager')
        self.setGeometry(100, 100, 650, 550)
        self.setStyleSheet(MAIN_STYLE)
        
        # Establecer el icono de la ventana
        icon_path = resource_path('decatron.ico')
        if os.path.exists(icon_path):
            self.setWindowIcon(QIcon(icon_path))
        
        self.user_window = None
        self.app_window = None
        self.both_window = None
        self.config = {}
        
        self.show_config_dialog()
    
    def show_config_dialog(self):
        dialog = ConfigDialog(self)
        if dialog.exec():
            self.config = dialog.get_config()
            self.init_ui()
        else:
            # Si el usuario cancela, cerrar toda la aplicación
            import sys
            sys.exit(0)
    
    def init_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setSpacing(30)
        layout.setContentsMargins(40, 40, 40, 40)
        
        # Title
        title = QLabel('Twitch Token Manager')
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet('font-size: 32px; font-weight: bold; color: #9146FF;')
        layout.addWidget(title)
        
        # User Token Card
        user_card = self.create_card(
            'User Access Token',
            'OAuth token con scopes personalizados',
            self.open_user_token
        )
        layout.addWidget(user_card)
        
        # App Token Card
        app_card = self.create_card(
            'App Access Token',
            'Client credentials para aplicaciones',
            self.open_app_token
        )
        layout.addWidget(app_card)
        
        # Both Tokens Card
        both_card = self.create_card(
            'Generar Ambos Tokens',
            'User + App Token + Channel ID',
            self.open_both_tokens
        )
        layout.addWidget(both_card)
        
        layout.addStretch()
    
    def create_card(self, title, desc, callback):
        card = QFrame()
        card.setObjectName('card')
        card_layout = QVBoxLayout(card)
        card_layout.setSpacing(10)
        
        title_label = QLabel(title)
        title_label.setStyleSheet('font-size: 20px; font-weight: bold; color: white;')
        
        desc_label = QLabel(desc)
        desc_label.setStyleSheet('font-size: 14px; color: #b9b9b9;')
        
        btn = QPushButton('Generar Token')
        btn.clicked.connect(callback)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        
        card_layout.addWidget(title_label)
        card_layout.addWidget(desc_label)
        card_layout.addWidget(btn)
        
        return card
    
    def open_user_token(self):
        if not self.user_window:
            self.user_window = UserTokenWindow(self.config)
            # Añadir icono a la ventana secundaria
            icon_path = resource_path('decatron.ico')
            if os.path.exists(icon_path):
                self.user_window.setWindowIcon(QIcon(icon_path))
        self.user_window.show()
    
    def open_app_token(self):
        if not self.app_window:
            self.app_window = AppTokenWindow(self.config)
            # Añadir icono a la ventana secundaria
            icon_path = resource_path('decatron.ico')
            if os.path.exists(icon_path):
                self.app_window.setWindowIcon(QIcon(icon_path))
        self.app_window.show()
    
    def open_both_tokens(self):
        if not self.both_window:
            self.both_window = BothTokensWindow(self.config)
            # Añadir icono a la ventana secundaria
            icon_path = resource_path('decatron.ico')
            if os.path.exists(icon_path):
                self.both_window.setWindowIcon(QIcon(icon_path))
        self.both_window.show()