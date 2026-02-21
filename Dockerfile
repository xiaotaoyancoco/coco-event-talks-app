# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies securely using the lockfile
RUN npm ci --only=production

# Copy the rest of the application's source code
COPY . .

# The service in the container will listen on the port provided by Cloud Run.
# The default PORT is 8080.
ENV PORT=8080

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "server.js" ]
