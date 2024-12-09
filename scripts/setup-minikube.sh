#!/bin/bash

# Start Minikube
minikube start --driver=docker --memory=4096 --cpus=2

# Enable necessary addons
minikube addons enable ingress
minikube addons enable metrics-server

# Build the products service image in Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t products-service:latest .

# Apply Kubernetes configurations
kubectl apply -f k8s/local/products.yaml
kubectl apply -f k8s/local/mongodb.yaml
kubectl apply -f k8s/local/monitoring/prometheus.yaml
kubectl apply -f k8s/local/monitoring/grafana.yaml

# Wait for pods to be ready
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=products-service --timeout=120s
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s
kubectl wait --for=condition=ready pod -l app=prometheus --timeout=120s
kubectl wait --for=condition=ready pod -l app=grafana --timeout=120s

# Get URLs for services
echo "\nAccess your services at:"
echo "Products Service: $(minikube service products-service --url)"
echo "Prometheus: $(minikube service prometheus --url)"
echo "Grafana: $(minikube service grafana --url)"
