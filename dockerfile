# Usa Node LTS
FROM node:22

# Diretório do app
WORKDIR /app

# Copia apenas package.json / package-lock.json
COPY package*.json ./

# Instala dependências do projeto (se houver)
RUN npm install || true

# Expo precisa rodar acessível fora do container
EXPOSE 19000 19001 19002

# Comando padrão apenas abre um shell interativo
CMD ["sh"]
