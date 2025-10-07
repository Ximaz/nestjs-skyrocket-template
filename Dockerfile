FROM node:22-alpine3.22 AS build

LABEL org.opencontainers.image.authors="durand.malo.60590@gmail.com"

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lock

COPY src/ ./src/

COPY tsconfig.build.json tsconfig.json ./

RUN pnpm build

FROM node:22-alpine3.22 AS server

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY prisma/ ./prisma/

RUN pnpm prisma:generate

RUN rm -rf ./prisma/

COPY --from=build /app/dist /app/dist

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT [ "node", "dist/main.js" ]