#!/bin/sh
# Clic & Avenir — lance le serveur de salle (Mac / Linux)
cd "$(dirname "$0")" && exec python3 serveur.py "$@"
