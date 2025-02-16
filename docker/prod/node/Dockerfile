FROM node:20.18.3-alpine AS builder

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

RUN rm -rf dist

RUN npm run build

FROM node:20.18.3-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
