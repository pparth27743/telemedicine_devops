# Base image
FROM node:14


# Copying angular folder from local directory to Educative directory
WORKDIR /app
COPY ./Ng-frontend/ ./

# Installing Angular cli and node modules in angular directory
RUN     npm install -g @angular/cli@11.0.7 &&\
        npm i

EXPOSE 4200
CMD [ "npm", "start" ]


