FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc --noEmit
USER node
EXPOSE 5173
CMD ["npx", "run", "dev"]q