FROM node:16

WORKDIR /app/emailService


COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 3030

CMD ["npm", "start"]