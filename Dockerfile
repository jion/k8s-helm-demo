FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy application files
COPY server.js .

# Install dependencies (if any)
# RUN npm install

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
