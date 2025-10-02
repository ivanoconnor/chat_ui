FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application files
COPY . .

# Expose port 5173
EXPOSE 5173

# Run the SvelteKit development server
CMD yarn dev --host 0.0.0.0
