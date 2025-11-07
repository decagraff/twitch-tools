import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import requests
import threading

class TwitchWebhookApp:
    def __init__(self, master):
        self.master = master
        self.master.title("Twitch Webhook Manager")
        self.master.geometry("600x500")
        self.master.configure(bg='#f0f0f0')

        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure('TFrame', background='#f0f0f0')
        self.style.configure('TButton', background='#4a4a4a', foreground='white')
        self.style.map('TButton', background=[('active', '#5a5a5a')])
        self.style.configure('TNotebook', background='#f0f0f0')
        self.style.configure('TNotebook.Tab', background='#e0e0e0', padding=[10, 5])
        self.style.map('TNotebook.Tab', background=[('selected', '#f0f0f0')])

        self.url = 'https://api.twitch.tv/helix/eventsub/subscriptions'
        self.token_url = 'https://id.twitch.tv/oauth2/token'

        self.create_widgets()

    def create_widgets(self):
        self.notebook = ttk.Notebook(self.master)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Pestaña de Configuración
        self.config_frame = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(self.config_frame, text="Configuración")

        ttk.Label(self.config_frame, text="Client ID:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.client_id_entry = ttk.Entry(self.config_frame, width=40)
        self.client_id_entry.grid(row=0, column=1, pady=5)

        ttk.Label(self.config_frame, text="Client Secret:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.client_secret_entry = ttk.Entry(self.config_frame, width=40, show="*")
        self.client_secret_entry.grid(row=1, column=1, pady=5)

        self.get_token_button = ttk.Button(self.config_frame, text="Obtener Token", command=self.get_bearer_token)
        self.get_token_button.grid(row=2, column=0, columnspan=2, pady=10)

        ttk.Label(self.config_frame, text="Bearer Token:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.bearer_token_entry = ttk.Entry(self.config_frame, width=40)
        self.bearer_token_entry.grid(row=3, column=1, pady=5)

        # Pestaña de Webhooks
        self.webhooks_frame = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(self.webhooks_frame, text="Webhooks")

        self.list_webhooks_button = ttk.Button(self.webhooks_frame, text="Listar Webhooks", command=self.list_webhooks)
        self.list_webhooks_button.pack(pady=10)

        self.delete_webhooks_button = ttk.Button(self.webhooks_frame, text="Eliminar Webhooks", command=self.delete_webhooks)
        self.delete_webhooks_button.pack(pady=10)

        # Área de salida común
        self.output_frame = ttk.Frame(self.master, padding="10")
        self.output_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.output_text = scrolledtext.ScrolledText(self.output_frame, wrap=tk.WORD, width=70, height=15)
        self.output_text.pack(fill=tk.BOTH, expand=True)

    def get_bearer_token(self):
        client_id = self.client_id_entry.get().strip()
        client_secret = self.client_secret_entry.get().strip()

        if not client_id or not client_secret:
            self.show_message("❌ Client-ID y Client Secret no pueden estar vacíos.")
            return

        data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'client_credentials',
            'scope': 'channel:manage:broadcast channel:manage:redemptions channel:read:editors channel:read:redemptions channel:read:subscriptions channel:read:vips chat:read chat:edit clips:edit moderator:read:followers user:read:email user:edit:broadcast channel_editor'
        }
        try:
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            token_info = response.json()
            bearer_token = token_info.get('access_token')
            if bearer_token:
                self.bearer_token_entry.delete(0, tk.END)
                self.bearer_token_entry.insert(0, bearer_token)
                self.show_message("✅ Bearer Token obtenido con éxito.")
            else:
                self.show_message("❌ No se pudo obtener el Bearer Token.")
        except requests.RequestException as e:
            self.show_message(f"❌ Error al obtener el token: {str(e)}")

    def list_webhooks(self):
        client_id = self.client_id_entry.get().strip()
        bearer_token = self.bearer_token_entry.get().strip()

        if not client_id or not bearer_token:
            self.show_message("❌ Client-ID y Bearer Token no pueden estar vacíos.")
            return

        try:
            response = requests.get(self.url, headers={
                'Client-ID': client_id,
                'Authorization': f'Bearer {bearer_token}'
            })
            response.raise_for_status()
            data = response.json()
            
            if 'data' not in data:
                self.show_message("❌ Respuesta inesperada de la API: 'data' no encontrada en la respuesta.")
                return

            webhook_ids = [subscription.get('id') for subscription in data['data'] if 'id' in subscription]
            
            if webhook_ids:
                self.show_message("🔗 IDs de los webhooks registrados:")
                for webhook_id in webhook_ids:
                    self.show_message(f'    "{webhook_id}"')
            else:
                self.show_message("📭 No hay webhooks registrados.")
        except requests.RequestException as e:
            self.show_message(f"❌ Error al obtener los webhooks: {str(e)}")

    def delete_webhooks(self):
        client_id = self.client_id_entry.get().strip()
        bearer_token = self.bearer_token_entry.get().strip()

        if not client_id or not bearer_token:
            self.show_message("❌ Client-ID y Bearer Token no pueden estar vacíos.")
            return

        try:
            response = requests.get(self.url, headers={
                'Client-ID': client_id,
                'Authorization': f'Bearer {bearer_token}'
            })
            response.raise_for_status()
            data = response.json()
            
            webhook_ids = [subscription.get('id') for subscription in data['data'] if 'id' in subscription]
            
            if webhook_ids:
                if messagebox.askyesno("Confirmar", "¿Estás seguro de que quieres eliminar todos los webhooks?"):
                    for webhook_id in webhook_ids:
                        self.delete_webhook(webhook_id, client_id, bearer_token)
                    self.show_message("✅ Todos los webhooks han sido eliminados.")
                else:
                    self.show_message("❌ No se eliminaron los webhooks.")
            else:
                self.show_message("📭 No hay webhooks registrados.")
        except requests.RequestException as e:
            self.show_message(f"❌ Error al obtener los webhooks: {str(e)}")

    def delete_webhook(self, webhook_id, client_id, bearer_token):
        delete_url = f"{self.url}?id={webhook_id}"
        headers = {
            'Client-ID': client_id,
            'Authorization': f'Bearer {bearer_token}',
            'Content-Type': 'application/json'
        }
        try:
            response = requests.delete(delete_url, headers=headers)
            response.raise_for_status()
            if response.status_code == 204:
                self.show_message(f"✅ Webhook con ID {webhook_id} ha sido eliminado correctamente.")
            else:
                self.show_message(f"❌ Error al eliminar el webhook con ID {webhook_id}: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            self.show_message(f"❌ Error al eliminar el webhook: {str(e)}")

    def show_message(self, message):
        self.output_text.insert(tk.END, message + "\n")
        self.output_text.see(tk.END)

def main():
    root = tk.Tk()
    app = TwitchWebhookApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()