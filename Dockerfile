FROM node:18
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install
COPY . .
# CMD ["/bin/sh", "-c", "node main.js 2> /logs/silvanus.err 1> /logs/silvanus.log"]
CMD ["/bin/sh", "-c", "node main.js 2> /logs/error/$(date +%Y-%m-%d_%H-%M-%S).txt 1> /logs/status/$(date +%Y-%m-%d_%H-%M-%S).txt"]
