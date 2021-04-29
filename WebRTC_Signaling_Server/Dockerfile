# Base image
FROM node:14-alpine

# Copying angular folder from local directory to Educative directory
WORKDIR /webrtc-server
COPY ./WebRTC_Signaling_Server/ ./


# Installing Angular cli and node modules in angular directory
RUN     npm i
CMD [ "npm", "start" ]

