---
draft: false
title: K3s @ Home with One Helm values.yaml
description: Jellyfin + *arr* stack on k3s, Cloudflare DNS-01 TLS, SMB shares, and fixing Fedora firewalld 502s — all managed with a single Helm values.yaml.
date: 2025-08-20
tags:
  - traefik
  - cloudflare
  - jellyfin
  - homelab
  - Kubernetes
  - Linux
category:
  - Tech
author: William
---

# K3s @ Home with One Helm `values.yaml`

### Jellyfin + *arr* stack • Cloudflare DNS-01 TLS • SMB shares • (and fixing that nasty 502)


---

## Why this stack?

If you’ve ever wanted a **real** Kubernetes experience at home without the resource tax, **k3s** is the sweet spot:
- **Lightweight & fast**: perfect for a single node and optional Pi workers.
- **Batteries included**: Traefik ships as the default ingress controller.
- **Learn by doing**: a real cluster you can break, fix, and grow.

We’ll run **Jellyfin** for media streaming and the *arr* ecosystem (Sonarr, Radarr, Prowlarr, optional Bazarr/qBittorrent) for automation — all behind **HTTPS**, with a **Let’s Encrypt wildcard** via **Cloudflare DNS-01**. Storage comes from an **SMB share** so you can keep data on a NAS or a separate box.

> TL;DR: one `values.yaml` drives your entire app stack. cert-manager + SMB CSI are installed once and left alone.

---

## Prerequisites
Obviously we need to have k3s or whatever flavour of kubernetes you want installed on your systems. If you want to know why i went with K3s check out my writeup here
**Install k3s**

```bash
curl -sfL https://get.k3s.io | sh -
kubectl get nodes -o wide
kubectl -n kube-system get svc traefik -o wide
# Note EXTERNAL-IP (e.g. 192.168.0.100) and NodePorts for 80/443
```

> **Pro tip:** If you prefer a different ingress controller later, you can disable the bundled Traefik but for a home lab, the defaults are perfect.

**Non-Helm Chart Services**
Even though there is a single helm chart that will deploy almost everything there is 

This setup uses **one Helm chart with a single `values.yaml`** for apps, Services, Traefik routes, and SMB share wiring. Two things are **preinstalled** outside Helm:
 - **cert-manager** (via `kubectl apply`)
 - **SMB CSI driver** (installed once cluster-wide)

I’ll link my chart here once it’s public: **[Helm chart](<CHART LINK>)**.


```mermaid
flowchart LR
  subgraph HomeLAN
    A[Client Browser] -->|HTTPS 443| T[Traefik (k3s Service)]
    T -->|HTTP 8096| J[Jellyfin Pod]
    T -->|HTTP 8989| S[Sonarr Pod]
    T -->|HTTP 7878| R[Radarr Pod]
    T -->|HTTP 9696| P[Prowlarr Pod]
    J --- PVC[(PVC: media-smb-pvc)]
    S --- PVC
    R --- PVC
    P --- PVC
    PVC ---|SMB CSI| NAS[(SMB Share //nas/media)]
  end

  CF[Cloudflare DNS] -.->|A/CNAME| T
````


---

## 1) Cloudflare DNS

Create `A`/`CNAME` records like `jellyfin.example.com` → your node IP (e.g. `192.168.0.100`).

> **Start with DNS-only (gray cloud)** so you hit your LAN origin directly while testing. You can experiment with Cloudflare proxying later or use Cloudflare Tunnel. For me however I only care to stream locally 

---

## 2) Preinstall cert-manager (manual)

```bash
kubectl create namespace cert-manager
kubectl apply -n cert-manager \
  -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml
kubectl -n cert-manager get pods
```

**Cloudflare token & ClusterIssuer**

```bash
kubectl -n cert-manager create secret generic cloudflare-api-token-secret \
  --from-literal=api-token='<YOUR_CF_API_TOKEN>'
```

```yaml
# clusterissuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-dns01
spec:
  acme:
    email: you@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: le-dns01-account-key
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              name: cloudflare-api-token-secret
              key: api-token
```

```bash
kubectl apply -f clusterissuer.yaml
kubectl get clusterissuer letsencrypt-dns01 -o yaml | grep -A3 status:
```

**Wildcard certificate (in `default`)**

```yaml
# wildcard-cert.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: home-wildcard
  namespace: default
spec:
  secretName: example-cert
  dnsNames:
    - example.com
    - "*.example.com"
  issuerRef:
    kind: ClusterIssuer
    name: letsencrypt-dns01
```

```bash
kubectl apply -f wildcard-cert.yaml
kubectl -n default get secret bongofett-cert   # expect type: kubernetes.io/tls
```

> **Heads-up:** If you see `invalidContact: ... example.com`, you used a placeholder email. Put a real address in the `ClusterIssuer`.

---

## 3) Preinstall the SMB CSI driver

> Our Helm chart will **use** the driver to mount SMB shares, but it won’t install the driver itself.

```bash
helm repo add csi-driver-smb https://raw.githubusercontent.com/kubernetes-csi/csi-driver-smb/master/charts
helm repo update
helm upgrade --install csi-driver-smb csi-driver-smb/csi-driver-smb -n kube-system
```

If your chart expects a `StorageClass` (e.g. `smb`) or an SMB credentials `Secret`, create them first (or let your chart create them). The key is: **the driver must exist** before pods try to mount.

---

## 4) Install the whole stack with one Helm chart

This chart handles **apps, Services, Traefik IngressRoutes/Middlewares, and SMB share wiring**. Adjust your SMB server/share and domain.

```yaml
# values.yaml (excerpt)
global:
  domain: example.com
  tlsSecret: example-cert
  ingressClass: traefik

smb:
  server: 192.168.0.10
  share: media
  storageClassName: smb
  secret:
    name: smbcreds
    username: "<smb-user>"
    password: "<smb-pass>"

apps:
  jellyfin:
    enabled: true
    image: linuxserver/jellyfin:latest
    port: 8096
    host: jellyfin.{{ .Values.global.domain }}
    mounts: { config: /config, library: /library }
    ingress: { entryPoints: [websecure], scheme: http, middlewares: [default-headers] }

  sonarr:
    enabled: true
    image: linuxserver/sonarr:latest
    port: 8989
    host: sonarr.{{ .Values.global.domain }}
    mounts: { config: /config, downloads: /downloads }
    ingress: { entryPoints: [websecure], scheme: http }

  radarr:
    enabled: true
    image: linuxserver/radarr:latest
    port: 7878
    host: radarr.{{ .Values.global.domain }}
    mounts: { config: /config, downloads: /downloads }
    ingress: { entryPoints: [websecure], scheme: http }

  prowlarr:
    enabled: true
    image: linuxserver/prowlarr:latest
    port: 9696
    host: prowlarr.{{ .Values.global.domain }}
    mounts: { config: /config }
    ingress: { entryPoints: [websecure], scheme: http }
```

Install:

```bash
helm upgrade --install home-stack <PATH-TO-CHART> -n default -f values.yaml
kubectl -n default get pods,svc,ingressroute
```

> **Expectation setting:** At this point Jellyfin should be reachable at `https://jellyfin.example.com`. If you see **502**, jump straight to the next section.

---

## 5) Fixing 502 (Linux firewalld & fast discriminators)

A **502** after deploying usually isn’t your app — it’s either **Cloudflare proxying** or **firewalld** on Fedora dropping traffic to Traefik.

### 5.1 Cloudflare or Traefik? (10-second test)

Bypass Cloudflare and hit Traefik directly:

```bash
curl -sI --resolve jellyfin.example.com:443:192.168.0.100 https://jellyfin.example.com | head -n5
```

- **Works** → Cloudflare proxy was the issue. Keep records **DNS-only (gray)** for LAN testing or use Cloudflare Tunnel.
    
- **Fails** → It’s local (firewall, route, backend).
    

### 5.2 If stopping firewalld “fixes it”, make **permanent rules**

Find your zone:

```bash
sudo firewall-cmd --get-active-zones
# e.g. FedoraWorkstation (default), interfaces: enp7s0
ZONE=FedoraWorkstation
```

Open 80/443 + Traefik NodePorts; trust CNI; allow Flannel VXLAN:

```bash
sudo firewall-cmd --zone=$ZONE --add-service=http  --permanent
sudo firewall-cmd --zone=$ZONE --add-service=https --permanent

HTTP_NP=$(kubectl -n kube-system get svc traefik -o jsonpath='{.spec.ports[?(@.name=="web")].nodePort}')
HTTPS_NP=$(kubectl -n kube-system get svc traefik -o jsonpath='{.spec.ports[?(@.name=="websecure")].nodePort}')
sudo firewall-cmd --zone=$ZONE --add-port=${HTTP_NP}/tcp  --permanent
sudo firewall-cmd --zone=$ZONE --add-port=${HTTPS_NP}/tcp --permanent

sudo firewall-cmd --zone=trusted --add-interface=cni0      --permanent || true
sudo firewall-cmd --zone=trusted --add-interface=flannel.1 --permanent || true
sudo firewall-cmd --add-port=8472/udp --permanent

sudo firewall-cmd --reload
```

Quick re-test:

```bash
nc -vz 192.168.0.100 443
curl -sI --resolve jellyfin.example.com:443:192.168.0.100 https://jellyfin.example.com | head -n5
```

### 5.3 Still 502? Three tiny checks

- **Does Traefik see the TLS secret?**
    
    ```bash
    kubectl -n default get secret bongofett-cert
    kubectl -n kube-system logs deploy/traefik --tail=200 | grep -i 'error configuring tls'
    ```
    
- **Do middlewares actually exist in `default`?**
    
    ```bash
    kubectl -n default get middleware
    # remove missing ones from your IngressRoute or create them
    ```
    
- **Can pods reach Jellyfin’s Service?**
    
    ```bash
    kubectl run netcheck --rm -it --restart=Never --image=busybox:1.36 -- sh -c \
    'wget -S --spider http://jellyfin.default.svc.cluster.local:8096/ 2>&1 | head -n2; exit'
    ```
    

> **Note:** Jellyfin listens on **HTTP** internally. In your Traefik **IngressRoute**, set `scheme: http`.

---

## 6) Verifications (when healthy)

```bash
# TLS secret present where routes live
kubectl -n default get secret bongofett-cert

# Service -> Pod wiring
kubectl get svc jellyfin -o wide
kubectl get endpoints jellyfin -o yaml | grep -A2 ports:

# In-cluster reachability
kubectl run netcheck --rm -it --restart=Never --image=busybox:1.36 -- sh -c \
'wget -S --spider http://jellyfin.default.svc.cluster.local:8096/ 2>&1 | head -n2; exit'
```

---

## 7) Wire Prowlarr → Sonarr/Radarr

Use cluster DNS so it works pod-to-pod:

```
http://sonarr.default.svc.cluster.local:8989
http://radarr.default.svc.cluster.local:7878
```

If “name does not resolve,” ensure the **Service** exists, selectors match pod labels, and pods are **Running** (so Endpoints populate).

---

## 8) Optional hardening

- Keep only **websecure** routes. If you also expose **web (80)**, add a tiny HTTP→HTTPS redirect **on web** (don’t attach `redirect-https` to **websecure**).
- If you later enable the **Cloudflare orange-cloud** proxy, consider restricting firewalld 80/443 to Cloudflare IP ranges (rich rules), or use **Cloudflare Tunnel** for zero-trust access.

---

## Wrap-up

- **Preinstalled once:** cert-manager (Cloudflare DNS-01) & SMB CSI driver
- **One Helm chart + one `values.yaml`:** apps, Services, IngressRoutes, SMB mounts
- **502 solved** with clear Cloudflare vs Traefik testing and **permanent firewalld rules**
- Jellyfin + _arr_ over **HTTPS** with a wildcard certificate 🥳

When I publish the chart, I’ll update this link: **[Helm chart](https://chatgpt.com/c/CHART%20LINK)**.  
If you want a starter `values.yaml` tailored to your domain and SMB paths, I can add a `values.example.yaml` to the repo for copy-paste bliss.

---