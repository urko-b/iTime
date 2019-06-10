FROM node:10-jessie

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN ls -al
RUN npm cache clean --force

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
