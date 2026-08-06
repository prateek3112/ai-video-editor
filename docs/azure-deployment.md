# Azure Deployment Guide

This document describes how to deploy the AI Video Editor on an Azure VM.

## Deployment Architecture

- **Engine Support**: Remotion (React Canvas) & Hyperframes (HTML/CSS Keyframes).
- **BYOB API Key**: User-provided Gemini API key passed via headers (`x-gemini-api-key`).
- **CI/CD Pipeline**: GitHub Actions self-hosted runner executing on Windows Server / Linux VM.
