# Base image
FROM node:14.15-alpine

WORKDIR /webrtc_server
COPY . .

RUN     npm i
CMD [ "npm", "start" ]

