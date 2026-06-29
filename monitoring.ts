import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const monitoringNamespace = new k8s.core.v1.Namespace("monitoring", {
    metadata: {
        name: "monitoring",
    },
});

const grafanaAdminUser = "admin";
const grafanaAdminPassword = "admin123";

const prometheus = new k8s.helm.v3.Chart("prometheus", {
    chart: "prometheus",
    version: "25.27.0",
    fetchOpts: {
        repo: "https://prometheus-community.github.io/helm-charts",
    },
    namespace: monitoringNamespace.metadata.name,
    values: {
        alertmanager: {
            enabled: false,
        },
        "prometheus-pushgateway": {
            enabled: false,
        },
        "prometheus-node-exporter": {
            enabled: false,
        },
        server: {
            service: {
                type: "NodePort",
            },
        },
        serverFiles: {
            "prometheus.yml": {
                scrape_configs: [
                    {
                        job_name: "prometheus",
                        static_configs: [
                            {
                                targets: ["localhost:9090"],
                            },
                        ],
                    },
                    {
                        job_name: "kubernetes-pods",
                        kubernetes_sd_configs: [
                            {
                                role: "pod",
                            },
                        ],
                    },
                    {
                        job_name: "guestbook-frontend",
                        metrics_path: "/metrics",
                        kubernetes_sd_configs: [
                            {
                                role: "endpoints",
                            },
                        ],
                        relabel_configs: [
                            {
                                source_labels: ["__meta_kubernetes_service_name"],
                                action: "keep",
                                regex: "frontend",
                            },
                            {
                                source_labels: ["__meta_kubernetes_namespace"],
                                action: "keep",
                                regex: "default",
                            },
                        ],
                    },
                ],
            },
        },
    },
}, { dependsOn: monitoringNamespace });

const grafana = new k8s.helm.v3.Chart("grafana", {
    chart: "grafana",
    version: "8.5.1",
    fetchOpts: {
        repo: "https://grafana.github.io/helm-charts",
    },
    namespace: monitoringNamespace.metadata.name,
    values: {
        adminUser: grafanaAdminUser,
        adminPassword: grafanaAdminPassword,
        service: {
            type: "NodePort",
        },
        datasources: {
            "datasources.yaml": {
                apiVersion: 1,
                datasources: [
                    {
                        name: "Prometheus",
                        type: "prometheus",
                        access: "proxy",
                        url: "http://prometheus-server.monitoring.svc.cluster.local",
                        isDefault: true,
                    },
                ],
            },
        },
    },
}, { dependsOn: prometheus });

export const grafanaUsername = grafanaAdminUser;
export const grafanaPassword = pulumi.secret(grafanaAdminPassword);
export const grafanaUrl = "http://localhost:3000";
export const grafanaAccessCommand =
    "kubectl -n monitoring port-forward svc/grafana 3000:80";

export const prometheusUrl = "http://localhost:9090";
export const prometheusAccessCommand =
    "kubectl -n monitoring port-forward svc/prometheus-server 9090:80";