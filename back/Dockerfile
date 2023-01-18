FROM node:18.13.0-alpine as builder

WORKDIR /app-build

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:18.13.0-alpine

WORKDIR /app

COPY package.json ./

COPY --from=builder /app-build/build ./build

CMD ["npm", "start"]
