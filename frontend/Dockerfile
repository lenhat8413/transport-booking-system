FROM node:20-alpine

WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Setup Next.js environment variables for build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Build Next.js application
RUN npm run build

# Expose the standard custom port
EXPOSE 5173
ENV PORT=5173
ENV NODE_ENV=production

# Start Next.js
CMD ["npm", "start"]
