---
draft: true
title: 
date: 
author: William
category: 
tags: 
description: 
bskyid: 
cover:
  image: test
  alt: test
---


I want to deploy argo cd to manage mt k3s cluster.
The git ops is what all the cool kids are doing these days?





For this  we need to deploy 

**Step 1 — Create the namespace and install ArgoCD:**

bash

```bash
kubectl create namespace argocd

sudo kubectl apply -n argocd \
  --server-side \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

The `--server-side` flag moves the annotation size management to the server, bypassing the 262144 byte limit.

**Step 2 — Wait for ArgoCD to be ready:**

bash

```bash
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=120s
```

**Step 3 — Get the initial admin password:**

bash

```bash
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

Save this password — you will need it to log in.

**Step 4 — Access the ArgoCD UI:**

Since you are on K3s, port-forward to access the UI:

bash

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then open `https://localhost:8080` in your browser. Login with `admin` and the password from Step 3. 

> This will only be accessible from localhost. If you want this accessible on your network add `--address 0.0.0.0`


**Step 7 — Install kubeseal on your Ubuntu VM**

bash

```bash
# Get the latest version number
KUBESEAL_VERSION=$(curl -s https://api.github.com/repos/bitnami-labs/sealed-secrets/releases/latest \
  | grep tag_name | cut -d '"' -f 4 | sed 's/v//')

# Download the binary
curl -OL "https://github.com/bitnami-labs/sealed-secrets/releases/download/v${KUBESEAL_VERSION}/kubeseal-${KUBESEAL_VERSION}-linux-amd64.tar.gz"

# Extract and install
tar -xvzf kubeseal-${KUBESEAL_VERSION}-linux-amd64.tar.gz kubeseal
sudo install -m 755 kubeseal /usr/local/bin/kubeseal

# Verify
kubeseal --version
```

---

**Step 8 — Seal your secrets** Same as before — run this on your Ubuntu VM:

bash

```bash
kubectl create secret generic smb-creds \ 
	--from-literal=username=youruser \ 
	--from-literal=password=yournewpassword \ 
	--dry-run=client -o yaml | kubeseal \ 
	--controller-name=sealed-secrets \ 
	--controller-namespace=sealed-secrets \ 
	--format yaml > /tmp/sealed-smb-creds.yaml
```

Commit and push the sealed file.

---

**Step 9 — Apply the root App of Apps**

bash

```bash
kubectl apply -f apps/root.yaml
```

---

**Step 10 — Access the ArgoCD UI from your Windows machine**

Port-forward binding to all interfaces so it's reachable across your network:

bash

````bash
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address 0.0.0.0
```

Then on your **Windows browser** navigate to:
```
https://<vm-ip>:8080
````

You'll get a self-signed cert warning — accept it and log in with `admin` and the password from Step 5.

> 💡 **Tip:** Run the port-forward in a `tmux` or `screen` session so it stays alive after you close your SSH connection:
> 
> bash
> 
> ```bash
> sudo apt install tmux -y
> tmux new -s argocd
> kubectl port-forward svc/argocd-server -n argocd 8080:443 --address 0.0.0.0
> # Detach with Ctrl+B then D
> ```

---


Apply directly from GitHub — no temp file needed:

bash

```bash
kubectl apply -f https://raw.githubusercontent.com/M4NU5/UltimateHomeServer/main/apps/root.yaml
```

That single command is all you need. ArgoCD will then read the rest of the `apps/` folder directly from GitHub and take it from there.