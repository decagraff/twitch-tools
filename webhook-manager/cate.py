import tkinter as tk
from tkinter import messagebox, simpledialog
import requests

class TwitchWebhookApp:
    def __init__(self, master):
        self.master = master
        self.master.title("Twitch Webhook Manager")
        self.master.geometry("400x300")

        self.url = 'https://api.twitch.tv/helix/eventsub/subscriptions'
        self.token_url = 'https://id.twitch.tv/oauth2/token'
        self.validate_url = 'https://api.twitch.tv/helix/users'

        self.client_id = ""
        self.bearer_token = ""

        self.create_widgets()

    def create_widgets(self):
        # Texto principal
        main_text = tk.Label(self.master, text="Twitch Webhook Manager", font=("Helvetica", 16))
        main_text.pack(pady=20)

        # Botones
        self.webhook_button = tk.Button(self.master, text="Operaciones de Webhooks", command=self.perform_webhook_operation)
        self.webhook_button.pack(pady=10)

        self.exit_button = tk.Button(self.master, text="Salir", command=self.master.quit)
        self.exit_button.pack(pady=10)

    def get_bearer_token(self, client_id, client_secret):
        if not client_id or not client_secret:
            messagebox.showerror("Error", "❌ Client-ID y Client Secret no pueden estar vacíos.")
            return None

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
            return token_info.get('access_token', None)
        except requests.RequestException as e:
            messagebox.showerror("Error", f"Error al obtener el token: {e}")
            return None

    def validate_credentials(self, client_id, bearer_token):
        if not client_id or not bearer_token:
            messagebox.showerror("Error", "❌ Client-ID y Bearer Token no pueden estar vacíos.")
            return False

        try:
            response = requests.get(self.validate_url, headers={
                'Client-ID': client_id,
                'Authorization': f'Bearer {bearer_token}'
            })
            response.raise_for_status()
            data = response.json()
            if 'data' in data and data['data']:
                messagebox.showinfo("Éxito", "✅ Credenciales válidas.")
                return True
            else:
                messagebox.showerror("Error", "❌ Credenciales inválidas.")
                return False
        except requests.RequestException as e:
            messagebox.showerror("Error", f"Error al validar las credenciales: {e}")
            return False

    def delete_webhook(self, webhook_id):
        if not webhook_id or not self.client_id or not self.bearer_token:
            messagebox.showerror("Error", "❌ webhook_id, Client-ID y Bearer Token no pueden estar vacíos.")
            return

        delete_url = f"{self.url}?id={webhook_id}"
        headers = {
            'Client-ID': self.client_id,
            'Authorization': f'Bearer {self.bearer_token}',
            'Content-Type': 'application/json'
        }
        try:
            response = requests.delete(delete_url, headers=headers)
            response.raise_for_status()
            if response.status_code == 204:
                messagebox.showinfo("Éxito", f"✅ Webhook con ID {webhook_id} ha sido eliminado correctamente.")
            else:
                messagebox.showerror("Error", f"❌ Error al eliminar el webhook con ID {webhook_id}: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            messagebox.showerror("Error", f"Error al eliminar el webhook: {e}")

    def perform_webhook_operation(self):
        self.client_id = simpledialog.askstring("Input", "Ingresa tu Client-ID:")
        if not self.client_id:
            messagebox.showerror("Error", "❌ Client-ID no puede estar vacío.")
            return

        self.bearer_token = simpledialog.askstring("Input", "Ingresa tu Bearer Token (deja vacío si no tienes uno):")

        if not self.bearer_token:
            client_secret = simpledialog.askstring("Input", "Ingresa tu Client Secret:")
            if not client_secret:
                messagebox.showerror("Error", "❌ Client Secret no puede estar vacío.")
                return

            self.bearer_token = self.get_bearer_token(self.client_id, client_secret)
            if not self.bearer_token:
                messagebox.showerror("Error", "❌ No se pudo obtener un token de Bearer. La operación no se puede completar.")
                return

        if not self.validate_credentials(self.client_id, self.bearer_token):
            return

        try:
            response = requests.get(self.url, headers={
                'Client-ID': self.client_id,
                'Authorization': f'Bearer {self.bearer_token}'
            })
            response.raise_for_status()
            data = response.json()
            
            if 'data' not in data:
                messagebox.showerror("Error", "❌ Respuesta inesperada de la API: 'data' no encontrada en la respuesta.")
                return

            webhook_ids = [subscription.get('id') for subscription in data['data'] if 'id' in subscription]
            
            if webhook_ids:
                webhook_ids_str = "\n".join(f'    "{webhook_id}"' for webhook_id in webhook_ids)
                choice = messagebox.askyesno("Webhooks registrados", f"🔗 IDs de los webhooks registrados:\n{webhook_ids_str}\n\n¿Deseas eliminar estos webhooks?")
                if choice:
                    for webhook_id in webhook_ids:
                        self.delete_webhook(webhook_id)
                    messagebox.showinfo("Éxito", "✅ Todos los webhooks han sido eliminados.")
                else:
                    messagebox.showinfo("Cancelado", "❌ No se eliminaron los webhooks.")
            else:
                messagebox.showinfo("Sin Webhooks", "📭 No hay webhooks registrados.")
        except requests.RequestException as e:
            messagebox.showerror("Error", f"Error al obtener los webhooks: {e}")

def main():
    root = tk.Tk()
    app = TwitchWebhookApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()