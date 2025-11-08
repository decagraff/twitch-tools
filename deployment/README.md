# Guía de Deployment - Twitch Developer Hub

Esta guía te ayudará a desplegar el proyecto en tu VPS usando nginx, PostgreSQL, y PM2.

## Requisitos Previos

### Software necesario en el VPS:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Node.js (v18 o superior)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# nginx
sudo apt install -y nginx

# PM2 (Process Manager)
sudo npm install -g pm2

# Git
sudo apt install -y git
```

## Pasos de Instalación

### 1. Configurar PostgreSQL

```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Dentro de psql, ejecutar:
CREATE DATABASE twitch_dev_hub;
CREATE USER tu_usuario WITH ENCRYPTED PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE twitch_dev_hub TO tu_usuario;
\q
```

### 2. Clonar el Repositorio

```bash
# Crear directorio si no existe
sudo mkdir -p /var/www/html

# Clonar repositorio
sudo git clone https://github.com/decagraff/twitch-developer-hub.git /var/www/html/twitch-developer-hub

# Dar permisos
sudo chown -R $USER:$USER /var/www/html/twitch-developer-hub
```

### 3. Configurar Variables de Entorno

```bash
# Copiar plantilla
cd /var/www/html/twitch-developer-hub/server
cp ../deployment/.env.production .env

# Editar archivo .env
nano .env
```

**Configuración mínima necesaria en `.env`:**

```bash
# Database
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/twitch_dev_hub?schema=public"

# JWT Secret (generar uno aleatorio de 64 caracteres)
JWT_SECRET="tu_jwt_secret_super_seguro_aqui"

# Encryption Key (32 caracteres exactamente)
ENCRYPTION_KEY="clave_de_32_caracteres_exactos!"

# Server
PORT=3000
NODE_ENV=production

# Frontend URL
FRONTEND_URL="http://tu_dominio_o_ip"
```

**Generar claves seguras:**

```bash
# JWT Secret (64 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 bytes = 64 caracteres hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Ejecutar Script de Deployment Automático

El script automatiza todos los pasos siguientes:

```bash
cd /var/www/html/twitch-developer-hub/deployment
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

### 5. Configurar nginx (Manual si prefieres)

Si prefieres configurar nginx manualmente:

```bash
# Editar archivo de configuración de nginx
sudo nano /etc/nginx/sites-available/twitch-dev-hub

# Copiar contenido de deployment/nginx.conf
# IMPORTANTE: Cambiar "server_name" por tu dominio o IP

# Crear symlink
sudo ln -s /etc/nginx/sites-available/twitch-dev-hub /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

### 6. Iniciar Aplicación con PM2 (Manual)

Si no usaste el script automático:

```bash
cd /var/www/html/twitch-developer-hub

# Instalar dependencias backend
cd server
npm install --production
npm run build

# Ejecutar migraciones
npx prisma migrate deploy
npx prisma generate

# Instalar dependencias frontend
cd ../client
npm install
npm run build

# Iniciar con PM2
cd ..
pm2 start deployment/ecosystem.config.js

# Guardar configuración PM2
pm2 save
pm2 startup
```

## Verificación

### Verificar que todo funciona:

```bash
# Estado de PM2
pm2 status

# Logs de la aplicación
pm2 logs twitch-dev-hub-api

# Estado de nginx
sudo systemctl status nginx

# Estado de PostgreSQL
sudo systemctl status postgresql

# Probar backend directamente
curl http://localhost:3000/api/health

# Probar a través de nginx
curl http://tu_dominio_o_ip
```

## Comandos Útiles

### PM2:
```bash
pm2 status              # Ver estado de procesos
pm2 logs                # Ver logs en tiempo real
pm2 logs --lines 100    # Ver últimas 100 líneas
pm2 restart all         # Reiniciar aplicación
pm2 stop all            # Detener aplicación
pm2 delete all          # Eliminar proceso
pm2 monit               # Monitor en tiempo real
```

### nginx:
```bash
sudo nginx -t                    # Probar configuración
sudo systemctl reload nginx      # Recargar configuración
sudo systemctl restart nginx     # Reiniciar nginx
sudo systemctl status nginx      # Ver estado
sudo tail -f /var/log/nginx/twitch-dev-hub-error.log  # Ver logs de error
```

### PostgreSQL:
```bash
sudo -u postgres psql            # Acceder a PostgreSQL
sudo systemctl status postgresql # Ver estado
```

### Git (Actualizar código):
```bash
cd /var/www/html/twitch-developer-hub
git pull origin main
npm install --production  # Si hay nuevas dependencias
npm run build
pm2 restart all
```

## Actualización del Proyecto

Para actualizar a la última versión:

```bash
cd /var/www/html/twitch-developer-hub

# Hacer backup de .env
cp server/.env server/.env.backup

# Actualizar código
git pull origin main

# Reinstalar dependencias
cd server && npm install --production && npm run build
cd ../client && npm install && npm run build

# Ejecutar migraciones si las hay
cd ../server && npx prisma migrate deploy

# Reiniciar aplicación
pm2 restart all
```

## Troubleshooting

### Error: Cannot connect to database
- Verificar que PostgreSQL está corriendo: `sudo systemctl status postgresql`
- Verificar credenciales en `server/.env`
- Verificar que el usuario tiene permisos en la base de datos

### Error: PM2 process crashed
- Ver logs: `pm2 logs twitch-dev-hub-api --lines 100`
- Verificar que todas las variables de entorno están configuradas
- Verificar que la base de datos existe y tiene las migraciones aplicadas

### Error: nginx 502 Bad Gateway
- Verificar que el backend está corriendo: `pm2 status`
- Verificar que el puerto 3000 está libre: `sudo netstat -tlnp | grep 3000`
- Ver logs de nginx: `sudo tail -f /var/log/nginx/twitch-dev-hub-error.log`

### Error: Cannot access frontend
- Verificar que nginx está corriendo: `sudo systemctl status nginx`
- Verificar que el build del frontend existe: `ls -la /var/www/html/twitch-developer-hub/client/dist`
- Verificar configuración de nginx: `sudo nginx -t`

## Seguridad (Siguiente Paso: HTTPS)

Para agregar HTTPS con Let's Encrypt:

```bash
# Instalar certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado (reemplazar con tu dominio)
sudo certbot --nginx -d tu-dominio.com

# Renovación automática (certbot ya lo configura)
sudo certbot renew --dry-run
```

## Firewall

Configurar firewall para permitir tráfico HTTP/HTTPS:

```bash
# UFW
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Monitoreo

Configurar monitoreo con PM2:

```bash
# PM2 Plus (opcional - servicio de monitoreo)
pm2 link <secret_key> <public_key>

# Monitoreo básico local
pm2 monit
```

## Backup

Script de backup simple:

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/var/backups/twitch-dev-hub"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup base de datos
sudo -u postgres pg_dump twitch_dev_hub > "$BACKUP_DIR/db_$DATE.sql"

# Backup archivos .env
cp /var/www/html/twitch-developer-hub/server/.env "$BACKUP_DIR/env_$DATE.backup"

echo "Backup completado: $BACKUP_DIR"
```

## Soporte

Si encuentras problemas:
1. Revisa los logs: `pm2 logs`
2. Verifica la configuración: archivo `.env` y nginx
3. Consulta la documentación del proyecto
