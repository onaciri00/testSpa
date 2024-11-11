# image python
FROM debian:latest

# RUN apt update -y && apt upgrade -y && \
#     apt install nginx -y

RUN apt update -y && apt upgrade -y && \
    apt install nginx -y && \
    apt install openssl -y

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/private.key \
        -out /etc/nginx/ssl/certificate.pem \
        -subj "/O=1337 School/CN=ayylaaba.42.fr"

COPY conf/nginx.conf /etc/nginx/conf.d

RUN mkdir -p var/www/front

COPY srcs /var/www/front

EXPOSE 443

CMD [ "nginx", "-g", "daemon off;" ]
