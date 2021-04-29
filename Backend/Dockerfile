# # Base image
# FROM node:14-alpine

# # Copying angular folder from local directory to Educative directory
# WORKDIR /backend-server
# COPY ./Backend/ ./

# # Installing Angular cli and node modules in angular directory
# RUN     npm i
# CMD [ "npm", "start" ]

# Base image
FROM node:14-alpine


# Create a directory where our app will be placed
RUN mkdir -p /usr/src/app

# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package.json /usr/src/app

# Install dependecies
RUN npm install

# Get all the code needed to run the app
COPY . /usr/src/app

# Expose the port the app runs in
EXPOSE 3000

# Serve the app
CMD ["npm", "start"]
