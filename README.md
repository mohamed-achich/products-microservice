# Products Microservice

A NestJS-based products microservice with local Kubernetes deployment using Minikube.

## Tech Stack
- NestJS (TypeScript)
- MongoDB
- Kubernetes (Minikube)
- Prometheus & Grafana for monitoring

## Prerequisites
1. Install required tools:
```bash
winget install Kubernetes.minikube
winget install Kubernetes.kubectl
winget install Docker.DockerDesktop
```

2. Start Minikube:
```bash
minikube start
```

## Project Structure
```
products-microservice/
├── src/                   # NestJS application code
├── k8s/                   # Kubernetes configurations
│   ├── deployment.yaml    # Main application deployment
│   ├── mongodb.yaml       # MongoDB database
│   └── monitoring.yaml    # Prometheus & Grafana
├── Dockerfile            # Application container
└── docker-compose.dev.yml # Local development without K8s
```

## Development

### Local Development (without Kubernetes)
```bash
# Start the development environment
docker-compose -f docker-compose.dev.yml up
```

### Local Kubernetes Development
```bash
# Start Minikube
minikube start

# Build the application image in Minikube's Docker
eval $(minikube docker-env)
docker build -t products-service:latest .

# Deploy to Kubernetes
kubectl apply -f k8s/

# Get service URLs
minikube service products-service --url
minikube service prometheus --url
minikube service grafana --url
```

### Accessing Services
- Products API: `http://<minikube-url>:port`
- Prometheus: `http://<minikube-url>:port`
- Grafana: `http://<minikube-url>:port` (admin/admin)

## Kubernetes Features

### Scaling
```bash
# Scale the application
kubectl scale deployment products-service --replicas=3

# View pods
kubectl get pods -w
```

### Monitoring
1. Access Grafana dashboard
2. Import MongoDB dashboard (ID: 2583)
3. Import Node.js dashboard (ID: 11159)

### Logs
```bash
# View application logs
kubectl logs -f deployment/products-service

# View MongoDB logs
kubectl logs -f statefulset/mongodb
```

### Debugging
```bash
# Get pod details
kubectl describe pod <pod-name>

# Shell into a pod
kubectl exec -it <pod-name> -- /bin/bash

# View resource usage
kubectl top pods
```

## API Endpoints
- `GET /products`: List all products
- `POST /products`: Create a product
- `GET /products/:id`: Get a product
- `PUT /products/:id`: Update a product
- `DELETE /products/:id`: Delete a product
- `GET /health`: Health check endpoint

## Health Checks
The application includes:
- Readiness probe
- Liveness probe
- MongoDB connection health check

## Monitoring
- Prometheus metrics at `/metrics`
- Grafana dashboards for:
  - Node.js metrics
  - MongoDB metrics
  - Kubernetes cluster metrics

## Development Tips
1. Use `kubectl get all` to view all resources
2. Monitor logs with `kubectl logs`
3. Use `minikube dashboard` for GUI
4. Check health with `kubectl describe`
