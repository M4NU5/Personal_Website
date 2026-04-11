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




If my previous post I detailed my deployment journey of my arr stack on k3s. 




# GitOps My Home Lab: ArgoCD, Sealed Secrets, and Everything That Broke

_March 2026_

---
I want to deploy argo cd to manage my k3s cluster. After all gitops is what all the cool kids are doing these days. Who wouldnt want your kubernetes just to manage itself... most of the time.

My [previous post](https://williamsmale.com/blog/tech/deploy-jellyfin-on-kubernetes/) covered deploying the arr stack on K3s - cert-manager, SMB CSI, Traefik, the works mostly through helm. That post assumed a native Linux host. Since writing it I've migrated back to Windows as my daily driver. I know im a hethen but the dual booting for games was starting to get to me along with solving the windows micro lag that pushed me to do the migration in the first place, if youre interestied find my write up here. I decided to approach this redeployment from a newer angle... A Git ops angle.

Now admittadly I should have done this from the start: proper GitOps with ArgoCD. Everything declarative, everything in Git, cluster rebuild reduced to a single `kubectl apply` and then managed for ever. Reason i didnt is i wanted to get a deeper understanding of how Kubernetes worked be for is start abstracting away from it. Anyhow this post covers that new layer of abstraction. The GitOps architecture, the secrets strategy for a public repo, and the seedbox wiring that took far longer than it should have was achived, now all neatly wrapped in a k3s cluster running on a VM.

If you haven't read the previous post, start there for the K3s and cert-manager setup. This one picks up from a fresh cluster.

---

## The New Host Setup

Lets just outline how my environment has shifted. 

**The physical change**: Windows 11 Pro host running Hyper-V, single Ubuntu 24.04 LTS VM for K3s. The practical implication is that your `kubectl` and `kubeseal` commands run on the VM over SSH, not on your local machine. Two things that catch you early:

**Paste doesn't work in the Hyper-V console.** As part of initial setup configure SSHing into the VM just makes life easier. Would also recommend enfocing Cert auth only TK (Like to Blog Post or update here)

```bash
# On the VM
sudo apt install openssh-server -y
sudo systemctl enable ssh --now
ip a  # note the VM's LAN IP
```

Then connect from Windows Terminal: `ssh user@<vm-ip>`. Never touch the Hyper-V console again.

**Port-forwarding needs `--address 0.0.0.0`.** Binding to localhost inside the VM means the port is only accessible from within the VM. To reach the ArgoCD UI from your Windows browser:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address 0.0.0.0
```

Run it in `tmux` so it survives SSH disconnection. Access at `https://<vm-ip>:8080`.
This is a temparary solution until we configure the correct domain name for argo TK (Review this and determine if this is truthful or would be done another way)

---

## Why ArgoCD

The previous setup was `helm upgrade --install` run manually. It worked great at the start but every edit or change needs to be reapplied manually *barff* . Cluster dies, youre sliing youir way through that bad boy and you always reupgrade to make sure your `values.yaml` is up to date. ArgoCD solves this by making Git the single source of truth. The cluster converges to whatever is in the repo. Drift gets detected and corrected. Rebuild is one command. 

TK serenity gif Danial craige

The tradeoff is upfront complexity. ArgoCD itself has to be bootstrapped manually, it can't manage its own installation that would be true madness. And you need to think carefully about secrets, because GitOps means everything in Git, and Git is often public.

Both of those problems are solvable. The rest of this post is how.

---

## Architecture

### App of Apps

The `/apps` folder in the repo is the control plane. Each file is an ArgoCD `Application` resource pointing at either a Helm chart or a path in the repo. One parent `root.yaml` points at the folder itself and ArgoCD manages its own children. Add a new app by dropping a manifest in `/apps` and pushing. Or point ArgoCD to another gitrepo that follows the same app of apps structure and you're golden 

Sync waves control deployment order. Get this wrong and you'll spend time debugging failures that are just ordering problems:

| Wave | App                                               | Reason                               |
| ---- | ------------------------------------------------- | ------------------------------------ |
| 0    | Sealed Secrets controller                         | Must exist before secrets can unseal |
| 1    | Sealed secrets store + cert-manager secrets       | Secrets before anything needs them   |
| 2    | SMB CSI driver + cert-manager Helm                | Infrastructure layer                 |
| 3    | cert-manager config (ClusterIssuer + Certificate) | CRDs must exist first                |
| 4    | Arr stack                                         | Everything else must be healthy      |
TK( What about Persistant volumes like NAS and Seedbox)

### The Bootstrap

ArgoCD is the one thing you install manually:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=120s
```

Then everything else is triggered by a single apply:

```bash
kubectl apply -f https://raw.githubusercontent.com/M4NU5/UltimateHomeServer/main/apps/root.yaml
```

ArgoCD reads the repo, finds the Application manifests, and deploys the stack in wave order. That's the entire cluster rebuild story. If you ever want to add a new repository just execute this step and ArgoCD takes care of the rest.

---

## Secrets in a Public Repo

Secrets in code?! I hear you scream, but your a security engineer and this is a public repo how could you be so reckless! 

I live by the belief that security needs to be an enabler not a blocker. That means whatever solution needs to be simple to setup and secure to execute on. We can achive both of these with Sealed Secrets.

**Sealed Secrets** encrypts your secret with the cluster's public key and lets you commit the ciphertext safely. Only the in-cluster controller can decrypt it. The workflow:

```bash
# kubeseal needs the controller running — bootstrap ArgoCD first, wait for wave 0
kubectl create secret generic smb-creds \
  --from-literal=username=youruser \
  --from-literal=password=yourpassword \
  --dry-run=client -o yaml --namespace=home-server | \
  kubeseal \
  --controller-name=sealed-secrets \
  --controller-namespace=sealed-secrets \
  --format yaml > sealed-smb-creds.yaml
```

Note the controller name flag. The Helm chart installs it as `sealed-secrets`, not the default `sealed-secrets-controller` that kubeseal looks for. You will hit this. 

**Back up your master key.** If the cluster is wiped and you lose this, your sealed secrets are permanently unreadable:

```bash
kubectl get secret -n sealed-secrets \
  -l sealedsecrets.bitnami.com/sealed-secrets-key \
  -o yaml > master-key-backup.yaml
```

Store it somewhere offline. Not in the repo.

**Some values cannot be sealed.** `PersistentVolume.spec.volumeAttributes.source` requires a literal string. cert-manager's ClusterIssuer email is the same. For a private LAN IP and a domain that's already on your public blog, this isn't a real security concern. Pick your battles.

For values that genuinely must stay out of Git, ArgoCD supports a private values overlay — a cluster secret in the `argocd` namespace injected at sync time, never touching Git. Useful to know about, not needed for most home lab setups.

---

## The Seedbox

This is where it gets interesting. The arr stack needs two storage backends: a NAS over SMB (covered in the previous post), and a remote seedbox VPS where qBittorrent downloads before files get imported by Sonarr and Radarr.

The VPS is GigaDrive. The connection is SFTP via SFTPGo — not vsftpd or Pure-FTPd, both of which have a known rclone TLS incompatibility. Use SFTPGo or spend an afternoon debugging TLS handshake failures.

The architecture I landed on after several wrong turns:

```
GigaDrive VPS (SFTPGo, port 14391)
    │  SFTP outbound
rclone pod
    │  FUSE mount with mountPropagation: Bidirectional
/mnt/seedbox on k3s host
    │  hostPath volume
qbittorrent / sonarr / radarr pods
```

rclone mounts the SFTP remote directly onto the host filesystem. The `Bidirectional` propagation flag makes that mount visible to pods via a plain `hostPath`. No NFS, no additional CSI driver, no protocol translation.

**The wrong turns, for completeness:**

`rclone serve smb` doesn't exist in 1.68. Neither does `serve nfs` work usefully here — NFS PersistentVolumes are mounted by kubelet at the host OS level, and `rclone-seedbox.home-server.svc.cluster.local` is a cluster DNS name the host OS cannot resolve. CoreDNS only exists inside the cluster. You can work around this with a NodePort and `127.0.0.1`, but mount timing issues make it unreliable on a single node.

The FUSE approach avoids the problem entirely.

**rclone gotchas worth calling out:**

Passwords passed via the inline `:sftp,...` backend syntax must be pre-obscured with `rclone obscure`. Plain text fails with `input too short when revealing password`. Obscure the password first, then seal the obscured value.

Add `--allow-non-empty` to the mount command. Kubernetes bind-mounts the hostPath directory into the container before rclone starts, making the target appear already mounted. Without this flag rclone refuses to start.

Also install `fuse3` on the host VM before any of this:

```bash
sudo apt install fuse3 -y
echo "user_allow_other" | sudo tee -a /etc/fuse.conf
```

---

## cert-manager: One Non-Obvious Split

Covered in the previous post, but one thing changed in the ArgoCD context.

ArgoCD's multi-source Application feature — combining a Helm chart source with a raw manifest source in a single Application — triggered an `argocd-vault-plugin` lookup that broke manifest generation entirely. The fix is to keep them as separate Applications:

- `cert-manager` — Helm chart only, wave 2
- `cert-manager-config` — ClusterIssuer + Certificate, wave 3

The wave split matters. cert-manager CRDs must exist before you can apply a `ClusterIssuer`. Get this wrong and ArgoCD fails the sync with a CRD not found error.

The Cloudflare API token also needs `Zone:Zone:Read` AND `Zone:DNS:Edit`. Missing `Zone:Read` produces API calls to `/zones//dns_records/...` with an empty zone ID. The double slash in the error path is the tell.

The challenge runs in the namespace where your `Certificate` resource lives — `home-server` here — so the Cloudflare token sealed secret needs to be deployed to both `cert-manager` and `home-server`. Seal it twice, once per namespace.

---

## Rough Edges

**PersistentVolume immutability.** PV specs cannot be changed after creation. Changing storage backend means delete and recreate. With `Retain` policy the PV moves to `Released` not `Available` and holds a stale `claimRef`. You will run this more than once:

```bash
kubectl patch pv pv-seedbox -p '{"spec":{"claimRef":null}}'
```

**Config directory permissions.** linuxserver.io images run as PUID/PGID 1000. `DirectoryOrCreate` hostPaths are created by root. Jellyfin starts fine, renders the UI, then fails with `SQLite Error 8: attempt to write a readonly database` when you try to log in. Fix it permanently with an initContainer on every arr stack deployment:

```yaml
initContainers:
  - name: fix-permissions
    image: busybox
    command: ["sh", "-c", "chown -R 1000:1000 /config && chmod -R 755 /config"]
    volumeMounts:
      - name: jellyfin-config
        mountPath: /config
```

**nodeName in templates.** The original chart had `nodeName` hardcoded per-service pointing at Pi cluster nodes. Remove it entirely — it causes scheduling failures if the node name doesn't match and is unnecessary on a single node cluster.

**kubeseal ordering.** You cannot seal secrets before the Sealed Secrets controller is deployed. Bootstrap ArgoCD, apply the root app, wait for wave 0 to complete, then seal. Trying earlier fails with `services "sealed-secrets-controller" not found` — a confusing error that has nothing to do with your secret content.

---

## What I'd Do Differently

**Make the repo private from day one.** Several values can't be injected from secrets due to Kubernetes API constraints. A private repo sidesteps the whole conversation. If public is a hard requirement, the ArgoCD private values overlay works but adds complexity you don't want mid-setup.

**Validate rclone connectivity before touching Kubernetes.** The SFTPGo port, the obscured password format, the remote path — test all of it with `rclone ls` on the VM before writing a single pod spec. Half the seedbox debugging time was rclone configuration that had nothing to do with Kubernetes.

**Namespace strategy upfront.** cert-manager secrets ended up needing to exist in two namespaces. Thinking about this before deploying saves a resealing round trip.

---

## The Takeaway

The previous post got the stack running. This one made it reproducible. The difference matters when the host dies — and home lab hosts always eventually die.

ArgoCD plus Sealed Secrets holds up for a public repo GitOps setup in a way that surprised me. The bootstrap is manual once. Everything after is `git push`. Rough edges are mostly one-time friction during initial setup rather than ongoing operational pain.

The chart is [here](https://github.com/M4NU5/UltimateHomeServer). Read the [previous post](https://williamsmale.com/blog/tech/deploy-jellyfin-on-kubernetes/) for the K3s and cert-manager prerequisites. Don't skip the master key backup. Use SFTPGo.

---

_Tags: Kubernetes, K3s, ArgoCD, GitOps, Home-Lab, DevOps, Windows, Hyper-V_