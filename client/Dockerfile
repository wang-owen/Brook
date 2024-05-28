FROM node:22

WORKDIR /client

EXPOSE 3000

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]