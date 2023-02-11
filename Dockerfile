FROM node:18.13.0-alpine as builder

WORKDIR /app

COPY ./back/package*.json ./back/

WORKDIR /app/back

RUN npm ci

WORKDIR /app

COPY ./back/* ./back/

COPY ./dto ./dto

WORKDIR /app/back

RUN npm run build

CMD ["npm", "start"]
