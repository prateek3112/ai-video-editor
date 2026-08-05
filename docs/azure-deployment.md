# Deploying AI Video Editor to Azure VM

This guide explains how to deploy the **AI Video Editor** with **Remotion**, **Hyperframes**, and **BYOB Gemini API Key support** to an Azure Ubuntu Linux Virtual Machine.

---

## 1. Prerequisites

- An active **Azure Account** (Free or Pay-As-You-Go).
- Azure CLI or Azure Portal access.
- A SSH Key pair.

---

## 2. Step 1: Create an Azure Virtual Machine

1. In the [Azure Portal](https://portal.azure.com), click **Create a resource** → **Virtual machine**.
2. **Basics**:
   - **Subscription / Resource Group**: Select or create a new group (e.g., `ai-editor-rg`).
   - **Virtual Machine Name**: `ai-video-editor-vm`
   - **Region**: Choose your nearest region (e.g. `Central India`, `East US`, `West Europe`).
   - **Image**: `Ubuntu Server 22.04 LTS - x64 Gen2`.
   - **Size**: Recommended `Standard_D4s_v5` (4 vCPUs, 16 GB RAM) for smooth Remotion & Hyperframes headless video rendering.
3. **Administrator Account**:
   - Authentication type: **SSH public key**.
   - Username: `azureuser`.
4. **Inbound Port Rules**:
   - Select `SSH (22)`, `HTTP (80)`, `HTTPS (443)`.
5. Click **Review + create** → **Create**.

---

## 3. Step 2: Configure Network & Security Group (NSG)

1. Navigate to your VM in Azure Portal → **Networking** → **Add inbound port rule**.
2. Add rule for Port `3000`:
   - **Source**: `Any`
   - **Service**: `Custom`
   - **Port ranges**: `3000`
   - **Protocol**: `TCP`
   - **Action**: `Allow`
   - **Name**: `Allow-NextJS-3000`

---

## 4. Step 3: Deploy using Automated Script

Connect to your Azure VM via SSH:

```bash
ssh -i ~/.ssh/id_rsa azureuser@<YOUR_AZURE_VM_PUBLIC_IP>
```

Clone your repository and run the setup script:

```bash
git clone https://github.com/prateek3112/ai-video-editor.git
cd ai-video-editor

# Make setup script executable and run
chmod +x deploy/azure-setup.sh
./deploy/azure-setup.sh
```

---

## 5. Step 4: Configure Production Environment Variables

Edit `.env.production`:

```bash
nano .env.production
```

Set your configuration:

```env
GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
NEXTAUTH_URL=http://<YOUR_AZURE_VM_PUBLIC_IP>:3000
```

Restart the containers:

```bash
sudo docker-compose --env-file .env.production restart
```

---

## 6. Verification

Open your browser and visit:

```
http://<YOUR_AZURE_VM_PUBLIC_IP>:3000
```

1. Click **BYOB API Key** in the top navigation to add your custom Gemini key.
2. Click **AI Create Mode** to generate a new video composition.
3. Use **Remotion Engine** or **Hyperframes HTML** to preview and render your videos!
