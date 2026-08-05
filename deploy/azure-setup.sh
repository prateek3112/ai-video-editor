#!/bin/bash
# Azure VM Deployment Setup Script for AI Video Editor
set -e

echo "🚀 Starting Azure VM setup for AI Video Editor..."

# 1. Update package manager
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 3. Create env file if missing
if [ ! -f .env.production ]; then
    echo "⚙️ Creating .env.production from template..."
    cp .env.production.example .env.production
    echo "⚠️ Please update .env.production with your GEMINI_API_KEY and domain!"
fi

# 4. Build and start containers
echo "🛠️ Building and launching Docker containers..."
sudo docker-compose --env-file .env.production up -d --build

echo "✅ Deployment completed! AI Video Editor is running on port 3000."
