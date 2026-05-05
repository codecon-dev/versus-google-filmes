FROM node:20-alpine AS fe
WORKDIR /fe
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache openssl \
    && mkdir -p /etc/nginx/ssl \
    && openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/nginx-selfsigned.key \
        -out /etc/nginx/ssl/nginx-selfsigned.crt \
        -subj "/CN=localhost/O=Filmes Dev/C=BR" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=fe /fe/dist /usr/share/nginx/html

EXPOSE 80 443
