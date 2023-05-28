FROM node:16

WORKDIR /app/emailService

COPY package*.json ./

RUN npm install

COPY . . 

CMD ["npm", "start"]