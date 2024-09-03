# **Kubernetes Demo: Deploying a Simple Greeting App with Minikube**

## **1. Introduction**
In this demo, we'll deploy a simple web server that returns a greeting message along with the Pod's name. We'll use a ConfigMap to manage the greeting message and a Service to expose the application. This will demonstrate how Deployments, Pods, ConfigMaps, and Services interact in Kubernetes.

### **Key Concepts Covered:**
- **Pod:** The basic unit of deployment in Kubernetes, representing a running instance of your application.
- **Deployment:** Manages the lifecycle of Pods, including scaling and updates.
- **ConfigMap:** Allows you to decouple configuration artifacts from image content, making applications more portable.
- **Service:** Provides a stable IP address and DNS name to access your Pods, and can load balance traffic across multiple Pods.

---

## **2. Setting Up the Environment**

### **Step 1: Start Minikube**
First, ensure Minikube is running:

```bash
minikube start
```

Minikube creates a local Kubernetes cluster, perfect for development and testing.

### **Step 2: Switch to Minikube’s Docker Daemon**
We’ll build the Docker image directly in Minikube’s Docker environment:

```bash
eval $(minikube docker-env)
```

This allows us to avoid pushing the image to a remote registry.

---

## **3. Create the Application**

### **Step 1: Write the Simple Server**
Create a simple Node.js server that returns a greeting message:

**`server.js`**
```javascript
const http = require('http');
const os = require('os');

// Get environment variables
const greeting = process.env.GREETING || 'Hello';
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(`${greeting}, World! From pod: ${os.hostname()}\n`);
}).listen(port);

console.log(`Server running at http://0.0.0.0:${port}/`);
```

### **Step 2: Dockerize the Application**
Create a Dockerfile to package the application:

**`Dockerfile`**
```Dockerfile
FROM node:14

WORKDIR /usr/src/app
COPY server.js .

EXPOSE 3000
CMD ["node", "server.js"]
```

### **Step 3: Build the Docker Image**
Build the image using Minikube’s Docker daemon:

```bash
docker build -t my-greeting-app .
```

---

## **4. Deploy the Application**

### **Step 1: Create a ConfigMap**
Create a ConfigMap to store the greeting message:

**`configmap.yaml`**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: greeting-config
data:
  GREETING: "Hello Kubernetes"
```

Apply the ConfigMap:

```bash
kubectl apply -f configmap.yaml
```

### **Step 2: Create a Deployment**
Define the Deployment that uses the ConfigMap:

**`deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: greeting-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: greeting-app
  template:
    metadata:
      labels:
        app: greeting-app
    spec:
      containers:
      - name: greeting-container
        image: my-greeting-app
        ports:
        - containerPort: 3000
        env:
        - name: GREETING
          valueFrom:
            configMapKeyRef:
              name: greeting-config
              key: GREETING
```

Apply the Deployment:

```bash
kubectl apply -f deployment.yaml
```

### **Step 3: Create a Service**
Expose the Deployment via a Service:

**`service.yaml`**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: greeting-service
spec:
  selector:
    app: greeting-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: NodePort
```

Apply the Service:

```bash
kubectl apply -f service.yaml
```

### **Step 4: Access the Service**
Get the Minikube IP and the NodePort assigned to the Service:

```bash
minikube ip
kubectl get service greeting-service
```

Visit `http://<minikube-ip>:<NodePort>` in your browser to see the greeting message from one of the Pods.

---

## **5. Demonstrate Kubernetes Concepts**

### **Viewing the Pods**
Show the list of Pods created by the Deployment:

```bash
kubectl get pods
```

Explain how the Deployment manages the Pods, ensuring that the specified number of replicas is always running.

### **Updating the ConfigMap**
Update the greeting message in the ConfigMap:

```bash
kubectl edit configmap greeting-config
```

Change the `GREETING` value and save. Then, use the following command to restart the Deployment and apply the new ConfigMap:

```bash
kubectl rollout restart deployment greeting-deployment
```

After the Pods restart, refresh the browser to see the updated message.

### **Scaling the Deployment**
Scale the Deployment up or down:

```bash
kubectl scale deployment greeting-deployment --replicas=5
```

Explain how Kubernetes dynamically adjusts the number of Pods based on the desired state defined in the Deployment.

### **Rolling Back (if needed)**
If something goes wrong with the Deployment, you can delete it and reapply:

```bash
kubectl delete deployment greeting-deployment
kubectl apply -f deployment.yaml
```

---

## **6. Clean Up**

Once you're done with the demo, stop Minikube and clean up the resources:

```bash
kubectl delete service greeting-service
kubectl delete deployment greeting-deployment
kubectl delete configmap greeting-config
minikube stop
```
