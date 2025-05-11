#!/bin/bash

# Wykrywanie systemu operacyjnego
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Wykryto Unix/macOS"
    chmod +x ./init.sh
    ./init.sh
else
    echo "Wykryto Windows"
    powershell.exe -ExecutionPolicy Bypass -File .\init.ps1
fi
