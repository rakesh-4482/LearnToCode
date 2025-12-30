# 🐍 Conda Environment Setup for AlgoProject

This guide will help you set up and manage the conda environment for the AlgoProject.

## ✅ What's Already Done

Your conda environment `compilerAlgo` has been created with:
- **Python 3.11**
- **Node.js 20.19.4** (updated from 18.20.5 to meet frontend requirements)
- **npm 10.8.2**

All project dependencies have been installed for:
- ✅ Root dependencies
- ✅ Frontend dependencies (React + Vite)
- ✅ Backend dependencies (Node.js + Express)
- ✅ Compiler dependencies

## 🚀 Quick Start

### Using the Setup Script

We've created a convenient script to manage your environment:

```bash
# Activate the conda environment
./setup_env.sh activate

# Install all dependencies (if needed)
./setup_env.sh install

# Start all services
./setup_env.sh start

# Stop all services
./setup_env.sh stop

# Deactivate the environment
./setup_env.sh deactivate
```

### Manual Commands

If you prefer manual commands:

```bash
# Activate environment
conda activate compilerAlgo

# Verify Node.js version
node --version  # Should show v20.19.4

# Start services (in separate terminals)
cd backend && npm run dev      # Terminal 1
cd compiler && node index.js   # Terminal 2  
cd frontend && npm run dev     # Terminal 3
```

## 📁 Environment Details

**Environment Name:** `compilerAlgo`  
**Location:** `/opt/homebrew/Caskroom/miniforge/base/envs/compilerAlgo`

### Installed Packages
- **Python 3.11.13** - For any Python scripts or tools
- **Node.js 20.19.4** - For running the JavaScript/TypeScript application
- **npm 10.8.2** - Package manager for Node.js

## 🔧 Environment Management

### List Environments
```bash
conda env list
```

### Remove Environment (if needed)
```bash
conda env remove -n compilerAlgo
```

### Update Environment
```bash
conda update -n compilerAlgo --all
```

### Export Environment
```bash
conda env export > environment.yml
```

### Recreate Environment from Export
```bash
conda env create -f environment.yml
```

## 🌐 Accessing the Application

Once all services are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Compiler Service:** Running on its configured port

## 🐛 Troubleshooting

### Node.js Version Issues
If you see version warnings:
```bash
conda install nodejs=20 -y
```

### Port Conflicts
Make sure ports 3000 and 5173 are available:
```bash
lsof -i :3000
lsof -i :5173
```

### Environment Not Found
If the environment isn't found:
```bash
conda env list
conda activate compilerAlgo
```

### Permission Issues
If the setup script isn't executable:
```bash
chmod +x setup_env.sh
```

## 📝 Notes

- The environment uses **conda-forge** channel for better package availability
- Node.js was updated from v18 to v20 to meet frontend requirements
- All npm packages are installed within the conda environment
- The setup script provides convenient management commands

## 🎯 Next Steps

1. Activate the environment: `./setup_env.sh activate`
2. Start the application: `./setup_env.sh start`
3. Open http://localhost:5173 in your browser
4. Enjoy coding with the AlgoProject platform! 