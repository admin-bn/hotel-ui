FROM node:15.7.0-alpine3.10 as build

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json

RUN npm install
RUN npm install -g @angular/cli@7.3.9

COPY . /usr/src/app

RUN ng lint
RUN ng build --output-path=dist --configuration=production

# Stage 2: Run stage
FROM nginx:1.18.0-alpine

RUN chgrp -R root /var/cache/nginx /var/run /var/log/nginx && \
chmod -R 770 /var/cache/nginx /var/run /var/log/nginx

RUN apk update && apk add jq

#RUN apt-get update

# Copy the nginx configuration
COPY ./ops/nginx.conf /etc/nginx/conf.d/default.conf

#RUN chgrp -R root /var/cache/nginx /var/run /var/log/nginx && \
#chmod -R 770 /var/cache/nginx /var/run /var/log/nginx

#RUN chown -R $(whoami) /var

# Copy build from the 'build environment'
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy build from the 'build environment'
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 4201

# generate dynamic json from env
#COPY ./ops/docker-entrypoint.sh /
#ENTRYPOINT ["/docker-entrypoint.sh"]

#CMD ["nginx", "-g", "daemon off;"]
ENTRYPOINT ["nginx", "-g", "daemon off;"]
