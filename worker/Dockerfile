FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY prisma ./prisma/
RUN npx prisma generate

COPY lib ./lib/
COPY worker ./worker/

RUN npx tsc -p worker/tsconfig.json || true

CMD ["npx", "tsx", "worker/index.ts"]
