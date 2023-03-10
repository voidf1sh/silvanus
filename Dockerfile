FROM node:18
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install
COPY . .
CMD ["/bin/sh", "-c", "node main.js 2> /logs/error.log 1> /logs/silvanus.log"]