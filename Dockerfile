# Usa la versión oficial ligera de Node.js
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción y desarrollo
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto del backend
EXPOSE 8080

# Comando para iniciar la aplicación en modo desarrollo/vigilancia
CMD ["npm", "run", "dev"]