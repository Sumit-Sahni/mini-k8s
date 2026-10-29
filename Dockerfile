# Start from a small Linux image that already has Node.js
FROM node:26-alpine3.23

# Work inside the /app folder
WORKDIR /app

# Copy our two files into the image (nothing to install)
COPY server.js index.html ./

# Don't run as root
USER node

# The app listens on port 3000
EXPOSE 3000

# Command that starts the app
CMD ["node", "server.js"]
