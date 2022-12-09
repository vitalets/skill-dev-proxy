FROM node:16-alpine AS base

WORKDIR /app

ENV PATH="$PATH:/app/node_modules/.bin"

ARG TAG
ENV TAG=$TAG

# install native deps for building websocket
RUN apk add --update --no-cache make gcc g++ python3

COPY package*.json ./

FROM base AS dev
RUN npm ci && npm cache clean --force

FROM base AS production
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
CMD ["node", "dist/server/run.js"]
