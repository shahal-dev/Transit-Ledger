#!/bin/bash

# Stop and remove existing containers
echo "Stopping and removing existing containers..."
docker-compose down

# Build and start the containers
echo "Building and starting containers..."
docker-compose up -d

echo "Container is starting..."
echo "Waiting for application to be ready..."
sleep 5

# Run database migrations
echo "Running database migrations against NeonDB..."
docker-compose exec app yarn db:migrate:deploy

# Seed the database if needed
echo "Do you want to seed the database? This will add sample data to your NeonDB. (y/n)"
read -r seed_db
if [ "$seed_db" = "y" ]; then
  echo "Seeding the database..."
  docker-compose exec app yarn db:seed
fi

echo "Deployment completed successfully!"
echo "The application is available at: http://localhost:3001" 