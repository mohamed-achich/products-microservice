#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "Starting Minikube..."
    minikube start
fi

# Switch to minikube's Docker daemon
echo "🔄 Switching to Minikube's Docker daemon..."
eval $(minikube docker-env)

# Build the application image
echo "🏗️ Building application image..."
docker build -t products-service:latest .

# Apply Kubernetes configurations
echo "📦 Deploying to Kubernetes..."
kubectl apply -f k8s/

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/products-service --timeout=120s
kubectl wait --for=condition=available deployment/prometheus --timeout=120s
kubectl wait --for=condition=available deployment/grafana --timeout=120s

# Get service URLs
echo -e "\n🎉 Deployment complete! Access your services at:"
echo "Products API: $(minikube service products-service --url)"
echo "Prometheus: $(minikube service prometheus --url)"
echo "Grafana: $(minikube service grafana --url)"
echo "Grafana credentials: admin/admin"

echo -e "\n📝 Useful commands:"
echo "- View all resources: kubectl get all"
echo "- View logs: kubectl logs -f deployment/products-service"
echo "- Scale app: kubectl scale deployment products-service --replicas=3"
echo "- Dashboard: minikube dashboard"
