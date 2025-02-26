# Verwende das Node.js-Image
FROM node:20.11.1-alpine AS base

# Setze das Arbeitsverzeichnis
WORKDIR /app/

# Kopiere nur die package.json und package-lock.json für effizientere Caching-Stufen
COPY ./package*.json .

### Für Development ###
FROM base as dev

# Installiere Abhängigkeiten und Cache es
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm install

# Indicate expected port
EXPOSE 4200

# Starte Angular
CMD [ "npm", "start" ]

### Für Produktion ###
FROM base as production

# Setze NODE_ENV
ENV NODE_ENV production

# installiere nur Produktion Dependencies
# Speichere die Dependencies im Cache
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci --only=production

# Nutze non-root user
# Nutze --chown on COPY commands to set file permissions
USER node

# Copy the healthcheck script
COPY --chown=node:node ./healthcheck/ .

# Copy remaining source code AFTER installing dependencies. 
# Again, copy only the necessary files
COPY --chown=node:node ./src/ .

# Indicate expected port
#EXPOSE ????

CMD [ "node", "index.js" ]