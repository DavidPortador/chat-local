# Use official Node.js LTS as base image
FROM node:22.12.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (with --verbose output for debugging)
RUN npm install --verbose

# Copy application code
COPY . .

# Expose port
EXPOSE 4321

# Execute entrypoint commands (clear astro cache)
ENTRYPOINT ["sh", "/app/entrypoint.sh"]

# Run the development server
CMD ["npm", "run", "dev", "--", "--host", "--port", "4321"]