FROM node:18-alpine AS builder
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /frontend
COPY --from=builder /frontend/.output ./.output
EXPOSE 8050
CMD ["node", ".output/server/index.mjs"]
