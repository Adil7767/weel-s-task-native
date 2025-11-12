FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--web", "--non-interactive", "--port", "8081", "--clear"]

