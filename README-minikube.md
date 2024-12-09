# Local Kubernetes Development with Minikube

This guide helps you run the products microservice locally using Minikube, complete with monitoring, security, and best practices.

## Prerequisites

1. Install required tools:
   ```bash
   # Install Minikube
   winget install Kubernetes.minikube

   # Install kubectl
   winget install Kubernetes.kubectl

   # Install Docker Desktop
   winget install Docker.DockerDesktop
   ```

## Setup and Run

1. **Start the local cluster**:
   ```bash
   ./scripts/setup-minikube.sh
   ```

2. **Access Services**:
   - Products API: Run `minikube service products-service --url`
   - Prometheus: Run `minikube service prometheus --url`
   - Grafana: Run `minikube service grafana --url`
     - Default credentials: admin/admin

## Kubernetes Features You Can Learn/Test

1. **Deployment Strategies**:
   ```bash
   # Test rolling updates
   kubectl set image deployment/products-service products-service=products-service:v2
   
   # Rollback
   kubectl rollout undo deployment/products-service
   ```

2. **Scaling**:
   ```bash
   # Scale manually
   kubectl scale deployment products-service --replicas=3
   
   # Watch pods
   kubectl get pods -w
   ```

3. **Health Checks**:
   ```bash
   # View probe status
   kubectl describe pod <pod-name>
   ```

4. **Resource Management**:
   ```bash
   # View resource usage
   kubectl top pods
   kubectl top nodes
   ```

5. **Logging**:
   ```bash
   # View logs
   kubectl logs -f deployment/products-service
   ```

6. **Security Features**:
   - Non-root container execution
   - Resource limits
   - Network policies
   - Security contexts

7. **Monitoring**:
   - Prometheus metrics
   - Grafana dashboards
   - Resource usage tracking

## Common Operations

1. **View all resources**:
   ```bash
   kubectl get all
   ```

2. **Debug a pod**:
   ```bash
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

3. **Access MongoDB**:
   ```bash
   kubectl exec -it <mongodb-pod-name> -- mongo
   ```

4. **Stop/Start Cluster**:
   ```bash
   # Stop cluster
   minikube stop
   
   # Start cluster
   minikube start
   ```

## Cost: $0
- Everything runs locally
- No cloud resources needed
- Perfect for learning and development

## Production Differences
When moving to production, you'll need to modify:
1. Image pull policy (use ECR/Docker Hub)
2. Storage class (use AWS EBS)
3. Service types (use proper LoadBalancer)
4. Security (add proper secrets management)
5. Resource limits (adjust based on real needs)
