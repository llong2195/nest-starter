FROM node:20.12.2-slim AS builder

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

RUN rm -rf dist

RUN npm run build

FROM node:20.12.2-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
