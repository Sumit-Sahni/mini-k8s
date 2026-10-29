# Kubernetes Mini Demo

A very small project that shows the core ideas of Kubernetes and CI/CD:

- an app running as **3 copies (pods)**
- a **Service** that spreads traffic across them
- **self-healing**: crash a pod and Kubernetes brings it back
- a **rolling update** with no downtime
- **GitHub Actions** that builds the Docker image for you

The page shows which pod answered each request, using colours, so you can *see* it working.

## The files (only 6)

| File | What it does |
|---|---|
| `server.js` | The app. A tiny Node.js web server. No libraries needed. |
| `index.html` | The page you see in the browser. |
| `Dockerfile` | Recipe to pack the app into an image. 8 real lines. |
| `k8s.yaml` | Tells Kubernetes: run 3 pods, and give them one address. |
| `.github/workflows/build.yml` | On every push, GitHub builds the image and stores it. |
| `README.md` | This file. |

## Step 1: run it on your laptop (no Docker, no Kubernetes)

```bash
node server.js
```

Open http://localhost:3000. You will see one pod name (your computer's name).

## Step 2: push to GitHub so the image gets built

1. Create a **public** GitHub repo and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Open the **Actions** tab. Wait for the green tick (a few minutes).
3. Make the image public so minikube can download it:
   profile > **Packages** > `mini-app` > **Package settings** > **Change visibility** > **Public**.

## Step 3: run it on Kubernetes (minikube)

```bash
minikube start
kubectl apply -f k8s.yaml
kubectl get pods
minikube service mini-app
```

`kubectl get pods` shows 3 pods. The last command opens the page in your browser (keep that
terminal open). Watch the colours: three different pods are answering.

If you use a different GitHub username, change it in `k8s.yaml` on the `image:` line first.

## Step 4: things to try

**Self-healing.** In a second terminal run `kubectl get pods -w`. In the browser click
**Crash a pod**. One pod's `RESTARTS` becomes 1 and the page keeps working.

**Scaling.**
```bash
kubectl scale deployment mini-app --replicas=5
kubectl get pods
```
A new colour appears on the page.

**Rolling update.** Change `value: "v1"` to `"v2"` in `k8s.yaml`, then:
```bash
kubectl apply -f k8s.yaml
kubectl rollout status deployment/mini-app
```
Pods are replaced one by one and the version on the page changes from v1 to v2 with no downtime.

**Rollback.**
```bash
kubectl rollout undo deployment/mini-app
```

**Change the code.** Edit `index.html` or `server.js`, then `git push`. After the green tick:
```bash
kubectl rollout restart deployment/mini-app
```
Kubernetes downloads the new image and replaces the pods.

## Useful commands

```bash
kubectl get pods                       # list pods
kubectl describe pod <pod-name>        # why is a pod stuck? read the Events at the bottom
kubectl logs <pod-name>                # what the app printed
kubectl delete pod <pod-name>          # kill a pod by hand and watch it come back
```

## Clean up

```bash
kubectl delete -f k8s.yaml
minikube stop
```

## Common problems

| Problem | Fix |
|---|---|
| Pod shows `ImagePullBackOff` | The image is not public yet (Step 2.3), or the username in `k8s.yaml` is wrong |
| Pod error `no match for platform` | The pipeline builds both Intel and arm64, so re-run the Action and check it is green |
| Page shows only one pod | Refresh once. The server already asks for a new connection each time |
| `minikube start` fails | Make sure Docker Desktop is running |

## How to explain it in an interview

"I pack a small app into a Docker image. GitHub Actions builds and publishes it on every push.
Kubernetes runs three copies behind a Service, so traffic is shared. If a pod crashes, Kubernetes
restarts it, and I can roll out or roll back a new version without downtime."

## What a real project would add

Image scanning, image tags per commit instead of `latest`, health checks that restart stuck pods,
resource limits, config files, and monitoring. This mini version leaves them out on purpose so
the basics are easy to see.
