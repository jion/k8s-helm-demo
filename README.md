```
helm secrets upgrade my-release ./greeting-app -f ./greeting-app/my-ovewrite-values/secrets.yaml -f ./greeting-app/my-ovewrite-values/values.yaml
```

# **Helm 3 Demo: Packaging and Deploying Your Kubernetes Application**

## **1. Introduction to Helm**
Start by explaining what Helm is and why it's useful:

### **Key Concepts:**
- **Helm:** A package manager for Kubernetes, similar to apt for Ubuntu or npm for Node.js.
- **Chart:** A Helm package that contains all the resource definitions necessary to run an application in Kubernetes.
- **Release:** An instance of a Helm chart running in a Kubernetes cluster. Multiple releases of the same chart can exist in different namespaces or environments.

### **Why Use Helm?**
- **Simplifies deployments:** Helm helps bundle Kubernetes resources, manage configurations, and deploy applications easily across environments.
- **Parametrization:** Helm charts can be customized with values, making it easy to deploy the same application with different configurations.

---

## **2. Create the Helm Chart**

### **Step 1: Initialize a New Helm Chart**
Navigate to your project directory and create a new Helm chart:

```bash
helm create greeting-app
```

This creates a directory structure with templates and configuration files.

### **Step 2: Understand the Directory Structure**
Explain the key components of the chart:
- **`Chart.yaml`:** Contains metadata about the chart (name, version, etc.).
- **`values.yaml`:** The default values for the chart’s templates. These can be overridden by users.
- **`templates/`:** Contains Kubernetes manifests that use Helm's templating language to inject values from `values.yaml`.

### **Step 3: Modify the Chart**
Start by replacing the default templates with your application's configuration files.

#### **Update `values.yaml`:**
Add the following values:

**`values.yaml`**
```yaml
replicaCount: 3

image:
  repository: my-greeting-app
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: NodePort
  port: 80

config:
  greetingMessage: "Hello Helm"

resources: {}
```

#### **Modify the Deployment Template:**
Replace the default deployment template with the one you’ve been using.

**`templates/deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-greeting-app
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-greeting-app
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-greeting-app
    spec:
      containers:
      - name: {{ .Release.Name }}-greeting-app
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - containerPort: 3000
        env:
        - name: GREETING
          value: {{ .Values.config.greetingMessage }}
```

#### **Modify the Service Template:**
Update the service template:

**`templates/service.yaml`**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-greeting-service
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ .Release.Name }}-greeting-app
  ports:
  - protocol: TCP
    port: {{ .Values.service.port }}
    targetPort: 3000
```

### **Step 4: Test the Helm Chart Locally**
To see how Helm renders the templates, use:

```bash
helm template my-release ./greeting-app
```

This will output the Kubernetes manifests with all the values filled in, allowing you to review them before applying them to your cluster.

---

## **3. Deploy the Helm Chart**

### **Step 1: Install the Chart**
Deploy the application using Helm:

```bash
helm install my-release ./greeting-app
```

Explain that this command installs the chart as a release named `my-release`. Helm creates all the necessary Kubernetes resources.

### **Step 2: Access the Application**
Just like before, get the Minikube IP and the NodePort:

```bash
minikube ip
kubectl get service my-release-greeting-service
```

Access the service at `http://<minikube-ip>:<NodePort>`.

### **Step 3: Update the Helm Release**
Show how easy it is to update the release by changing a value in `values.yaml` (e.g., change the `greetingMessage`), and then upgrade the release:

```yaml
config:
  greetingMessage: "Hello from Helm!"
```

Upgrade the release:

```bash
helm upgrade my-release ./greeting-app
```

Helm will update the existing release with the new configuration. Refresh the browser to see the changes.

### **Step 4: Rollback the Helm Release**
Demonstrate how to rollback to a previous version if needed:

```bash
helm rollback my-release 1
```

Explain that Helm keeps track of every revision, making it easy to revert to an earlier state.

---

## **4. Parametrizing Values**

### **Step 1: Override Values at Install Time**
Show how to override values at the time of installation without modifying `values.yaml`:

```bash
helm install my-release ./greeting-app --set replicaCount=5 --set config.greetingMessage="Hello Custom Helm"
```

This command deploys the chart with 5 replicas and a custom greeting message, overriding the defaults in `values.yaml`.

### **Step 2: Use Environment-Specific Values**
You can create additional YAML files for different environments (e.g., `values-prod.yaml`, `values-dev.yaml`) and apply them during installation:

```bash
helm install my-release ./greeting-app -f values-prod.yaml
```

This demonstrates how Helm allows you to maintain different configurations for various environments with ease.

---

## **5. Clean Up**

After the demo, you can clean up the Helm release and stop Minikube:

```bash
helm uninstall my-release
minikube stop
```

---

### **Conclusion**
This Helm demo illustrates the power of Helm in managing Kubernetes applications, from simplifying deployments to managing configurations across environments. By using Helm, your team can standardize and streamline the deployment process, making it easier to manage complex applications in Kubernetes.
