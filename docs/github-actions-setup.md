# Automated Deployment via GitHub Actions

This repository includes a GitHub Actions CI/CD workflow ([`.github/workflows/deploy.yml`](file:///Users/prateekguglani/Desktop/portfolio/ai-video-editor/.github/workflows/deploy.yml)) that automatically deploys changes to your Azure VM every time you `git push` to `master`.

---

## Setting Up GitHub Repository Secrets

To activate automatic deployments, add 3 secrets to your GitHub repository:

1. Open your GitHub Repository: `https://github.com/prateek3112/ai-video-editor`
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret** and add the following:

| Secret Name | Value | Example |
|---|---|---|
| `AZURE_VM_HOST` | The Public IP address of your Azure VM | `20.198.110.45` |
| `AZURE_VM_USERNAME` | The SSH admin username for your VM | `azureuser` or `ubuntu` |
| `AZURE_VM_SSH_KEY` | Your private SSH key (contents of `~/.ssh/id_rsa`) | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |

---

## How It Works

1. Whenever you run `git push origin master`, GitHub Actions triggers the deployment pipeline.
2. It connects securely to your Azure VM via SSH.
3. It runs `git pull`, rebuilds the Docker container with `docker-compose`, and updates your running web editor with zero manual effort!
