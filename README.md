# Guestbook Application with Prometheus & Grafana Monitoring

## Overview
This project extends the Pulumi Kubernetes Guestbook example by integrating Prometheus and Grafana for monitoring. The monitoring stack is deployed using Pulumi and Helm charts alongside the Guestbook application.

## Prerequisites
* Docker Desktop with Kubernetes enabled
* Node.js (v18 or later recommended)
* Pulumi CLI
* kubectl
* Helm

Verify your installation:

```bash
node -v
npm -v
pulumi version
kubectl version --client
helm version
```

---

## Deploy the Application

Clone the repository:

```bash
git clone https://github.com/kthota93/guestbook-monitoring.git
cd kubernetes-ts-guestbook/simple
```

Install dependencies:

```bash
npm install
```

Create a Pulumi stack:

```bash
pulumi stack init dev
```

Deploy the application:

```bash
pulumi up
```

Verify that the Guestbook application is running:

```bash
kubectl get pods
kubectl get svc
```

Open the Guestbook application:

```
http://localhost
```

---

## Access Grafana

Start port forwarding:

```bash
kubectl -n monitoring port-forward svc/grafana 3000:80
```

Open:

```
http://localhost:3000
```

Default credentials:

```
Username: admin
Password: admin123
```

---

## Access Prometheus

Start port forwarding:

```bash
kubectl -n monitoring port-forward svc/prometheus-server 9090:80
```

Open:

```
http://localhost:9090
```

---

## Verify Guestbook Monitoring

1. Open Prometheus.
2. Navigate to **Status --> Targets**.
3. Verify that the following scrape jobs are present:

   * Prometheus
   * Kubernetes Pods
   * Guestbook Frontend

You can also execute the following Prometheus queries:

```
up
```

```
kube_pod_info
```

The Guestbook frontend scrape target should appear under the **guestbook-frontend** job.

---

## Notes

The default Pulumi Guestbook application does not expose Prometheus-formatted metrics (`/metrics`). Prometheus successfully discovers the Guestbook frontend endpoints, but scraping application metrics returns HTML instead of Prometheus metrics.

Infrastructure monitoring (Prometheus, Grafana, Kubernetes workloads, and pod discovery) is fully functional. Application metrics can be enabled by instrumenting the Guestbook application with a Prometheus client library.

---

## Technologies Used

* Pulumi (TypeScript)
* Kubernetes
* Helm
* Prometheus
* Grafana
* Docker Desktop
