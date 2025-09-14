FROM node:18-alpine

WORKDIR /app

COPY ./app .

RUN npm install -g http-server

EXPOSE 8080

CMD ["npx", "http-server", ".", "-p", "8080"]