# Use a base Node.js image with the desired version
FROM node:12

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Start the Node.js application
CMD ["npm", "start"]