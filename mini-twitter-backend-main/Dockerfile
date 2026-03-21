# Use the official Bun image
FROM oven/bun:1.2

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Create an empty database file if it doesn't exist
RUN touch db.sqlite

# Expose the port Elysia is running on
EXPOSE 3000

# Run bootstrap (seeds DB only when empty, then starts API)
CMD ["bun", "run", "src/bootstrap.ts"]
