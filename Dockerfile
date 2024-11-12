# Use the Node.js 18 base image (or another version compatible with your app)
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application files
COPY . .

# Expose ports 5173 and 3000
EXPOSE 5173
EXPOSE 3000

# Run the SvelteKit development server
CMD yarn dev --host 0.0.0.0
