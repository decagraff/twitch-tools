MAIN_STYLE = """
QMainWindow, QWidget {
    background-color: #0e0e10;
    color: white;
    font-family: 'Segoe UI', Arial;
}

QFrame#card {
    background-color: #18181b;
    border-radius: 10px;
    padding: 20px;
    border: 1px solid #2c2c2e;
}

QFrame#card:hover {
    border: 1px solid #9146FF;
}

QPushButton {
    background-color: #9146FF;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
}

QPushButton:hover {
    background-color: #772ce8;
}

QPushButton:pressed {
    background-color: #5c16c5;
}

QLineEdit {
    background-color: #18181b;
    border: 1px solid #2c2c2e;
    border-radius: 6px;
    padding: 10px;
    color: white;
    font-size: 14px;
}

QLineEdit:focus {
    border: 1px solid #9146FF;
}

QTextEdit {
    background-color: #18181b;
    border: 1px solid #2c2c2e;
    border-radius: 6px;
    padding: 10px;
    color: white;
    font-family: 'Consolas', monospace;
    font-size: 12px;
}

QLabel {
    color: white;
}

QScrollArea {
    border: none;
    background-color: transparent;
}

QCheckBox {
    color: white;
    spacing: 8px;
}

QCheckBox::indicator {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 2px solid #2c2c2e;
    background-color: #18181b;
}

QCheckBox::indicator:checked {
    background-color: #9146FF;
    border: 2px solid #9146FF;
}

QCheckBox::indicator:hover {
    border: 2px solid #9146FF;
}
"""