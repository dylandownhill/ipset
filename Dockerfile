FROM node:current
RUN mkdir /app
WORKDIR /app
COPY package.json package.json
RUN npm install && mv node_modules /node_modules
COPY . .
CMD node app.js