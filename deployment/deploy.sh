#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Twitch Developer Hub - Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Verificar si se ejecuta como root o con sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Por favor ejecuta este script como root o con sudo${NC}"
    exit 1
fi

# Variables
PROJECT_DIR="/var/www/html/twitch-developer-hub"
REPO_URL="https://github.com/decagraff/twitch-developer-hub.git"
NGINX_CONFIG="/etc/nginx/sites-available/twitch-dev-hub"
NGINX_ENABLED="/etc/nginx/sites-enabled/twitch-dev-hub"

# Paso 1: Verificar dependencias
echo -e "${YELLOW}[1/10] Verificando dependencias...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js no está instalado. Instálalo primero.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm no está instalado.${NC}"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo -e "${RED}PostgreSQL no está instalado.${NC}"; exit 1; }
command -v nginx >/dev/null 2>&1 || { echo -e "${RED}nginx no está instalado.${NC}"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo -e "${YELLOW}PM2 no está instalado. Instalando...${NC}"; npm install -g pm2; }
echo -e "${GREEN}✓ Todas las dependencias están instaladas${NC}\n"

# Paso 2: Clonar o actualizar repositorio
echo -e "${YELLOW}[2/10] Clonando/actualizando repositorio...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}El directorio ya existe. Actualizando...${NC}"
    cd "$PROJECT_DIR" || exit
    git pull origin main
else
    echo -e "${YELLOW}Clonando repositorio...${NC}"
    mkdir -p /var/www/html
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR" || exit
fi
echo -e "${GREEN}✓ Repositorio listo${NC}\n"

# Paso 3: Instalar dependencias del backend
echo -e "${YELLOW}[3/10] Instalando dependencias del backend...${NC}"
cd "$PROJECT_DIR/server" || exit
npm install --production
echo -e "${GREEN}✓ Dependencias del backend instaladas${NC}\n"

# Paso 4: Instalar dependencias del frontend
echo -e "${YELLOW}[4/10] Instalando dependencias del frontend...${NC}"
cd "$PROJECT_DIR/client" || exit
npm install
echo -e "${GREEN}✓ Dependencias del frontend instaladas${NC}\n"

# Paso 5: Configurar variables de entorno
echo -e "${YELLOW}[5/10] Configurando variables de entorno...${NC}"
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    echo -e "${RED}ADVERTENCIA: No se encontró archivo .env en server/${NC}"
    echo -e "${YELLOW}Por favor crea el archivo server/.env con las variables necesarias${NC}"
    echo -e "${YELLOW}Puedes usar deployment/.env.production como plantilla${NC}"
    read -p "Presiona Enter cuando hayas creado el archivo .env..."
fi
echo -e "${GREEN}✓ Variables de entorno configuradas${NC}\n"

# Paso 6: Compilar TypeScript del backend
echo -e "${YELLOW}[6/10] Compilando backend (TypeScript)...${NC}"
cd "$PROJECT_DIR/server" || exit
npm run build
echo -e "${GREEN}✓ Backend compilado${NC}\n"

# Paso 7: Ejecutar migraciones de Prisma
echo -e "${YELLOW}[7/10] Ejecutando migraciones de base de datos...${NC}"
cd "$PROJECT_DIR/server" || exit
npx prisma migrate deploy
npx prisma generate
echo -e "${GREEN}✓ Migraciones ejecutadas${NC}\n"

# Paso 8: Compilar frontend (React)
echo -e "${YELLOW}[8/10] Compilando frontend (React + Vite)...${NC}"
cd "$PROJECT_DIR/client" || exit
npm run build
echo -e "${GREEN}✓ Frontend compilado en client/dist${NC}\n"

# Paso 9: Configurar nginx
echo -e "${YELLOW}[9/10] Configurando nginx...${NC}"
if [ -f "$PROJECT_DIR/deployment/nginx.conf" ]; then
    cp "$PROJECT_DIR/deployment/nginx.conf" "$NGINX_CONFIG"

    # Crear symlink si no existe
    if [ ! -L "$NGINX_ENABLED" ]; then
        ln -s "$NGINX_CONFIG" "$NGINX_ENABLED"
    fi

    # Probar configuración de nginx
    nginx -t
    if [ $? -eq 0 ]; then
        systemctl reload nginx
        echo -e "${GREEN}✓ nginx configurado y recargado${NC}\n"
    else
        echo -e "${RED}Error en la configuración de nginx${NC}"
        exit 1
    fi
else
    echo -e "${RED}No se encontró el archivo de configuración de nginx${NC}"
    exit 1
fi

# Paso 10: Iniciar/reiniciar aplicación con PM2
echo -e "${YELLOW}[10/10] Iniciando aplicación con PM2...${NC}"
cd "$PROJECT_DIR" || exit

# Detener si ya está corriendo
pm2 delete twitch-dev-hub-api 2>/dev/null || true

# Iniciar con PM2
if [ -f "$PROJECT_DIR/deployment/ecosystem.config.js" ]; then
    pm2 start "$PROJECT_DIR/deployment/ecosystem.config.js"
else
    pm2 start "$PROJECT_DIR/server/dist/index.js" --name twitch-dev-hub-api
fi

# Guardar configuración de PM2
pm2 save
pm2 startup

echo -e "${GREEN}✓ Aplicación iniciada con PM2${NC}\n"

# Resumen
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment completado exitosamente!${NC}"
echo -e "${GREEN}========================================${NC}\n"
echo -e "Backend: ${GREEN}http://localhost:3000${NC}"
echo -e "Frontend: ${GREEN}Servido por nginx${NC}"
echo -e "\nComandos útiles:"
echo -e "  ${YELLOW}pm2 status${NC}         - Ver estado de la aplicación"
echo -e "  ${YELLOW}pm2 logs${NC}           - Ver logs en tiempo real"
echo -e "  ${YELLOW}pm2 restart all${NC}    - Reiniciar aplicación"
echo -e "  ${YELLOW}nginx -t${NC}           - Probar configuración de nginx"
echo -e "  ${YELLOW}systemctl status nginx${NC} - Ver estado de nginx\n"

echo -e "${YELLOW}IMPORTANTE:${NC}"
echo -e "1. Asegúrate de configurar el archivo ${YELLOW}server/.env${NC} con tus credenciales"
echo -e "2. Cambia ${YELLOW}server_name${NC} en la configuración de nginx (${NGINX_CONFIG})"
echo -e "3. Configura la base de datos PostgreSQL antes de usar la aplicación\n"
