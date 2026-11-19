#!/usr/bin/env python3
"""
Serveur de salle — Clic & Avenir
================================

À lancer sur le POSTE ANIMATEUR. Il :
  * sert le site aux autres postes de la salle (même wifi / même box) ;
  * reçoit automatiquement les résultats de chaque partie terminée ;
  * les donne à l'espace animateur, protégé par mot de passe.

Lancement :  double-clic sur « lancer-serveur.bat » (Windows)
             ou :  python3 serveur.py  [--port 8000] [--mot-de-passe MonMotDePasse]

Les résultats sont enregistrés dans le dossier « donnees/resultats.json ».
Aucune installation nécessaire : uniquement la bibliothèque standard de Python 3.
"""

import argparse
import hmac
import json
import os
import socket
import sys
import threading
from datetime import datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

DOSSIER_SITE = os.path.dirname(os.path.abspath(__file__))
DOSSIER_DONNEES = os.path.join(DOSSIER_SITE, "donnees")
FICHIER_RESULTATS = os.path.join(DOSSIER_DONNEES, "resultats.json")

TAILLE_MAX = 200_000            # taille max d'un résultat envoyé (octets)
NB_MAX_RESULTATS = 20_000
EXTENSIONS_SERVIES = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".webp", ".gif", ".woff", ".woff2"}
JEUX = {"cv", "mail", "lettre", "reseaux", "culture"}

verrou = threading.Lock()
MOT_DE_PASSE = "animateur2026"


# ---------- Stockage ----------
def lire_resultats():
    try:
        with open(FICHIER_RESULTATS, encoding="utf-8") as f:
            donnees = json.load(f)
            return donnees if isinstance(donnees, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def ecrire_resultats(liste):
    os.makedirs(DOSSIER_DONNEES, exist_ok=True)
    temporaire = FICHIER_RESULTATS + ".tmp"
    with open(temporaire, "w", encoding="utf-8") as f:
        json.dump(liste[-NB_MAX_RESULTATS:], f, ensure_ascii=False, indent=1)
    os.replace(temporaire, FICHIER_RESULTATS)   # écriture atomique : pas de fichier abîmé


def resultat_valide(r):
    return (
        isinstance(r, dict)
        and isinstance(r.get("id"), str) and 0 < len(r["id"]) <= 64
        and r.get("jeu") in JEUX
        and isinstance(r.get("nom"), str) and 0 < len(r["nom"].strip()) <= 40
        and isinstance(r.get("date"), str) and len(r["date"]) <= 40
    )


# ---------- Serveur HTTP ----------
class Gestionnaire(SimpleHTTPRequestHandler):
    server_version = "ClicAvenir/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DOSSIER_SITE, **kwargs)

    # Journal plus lisible
    def log_message(self, format, *args):
        if self.path.startswith("/api/resultats") and self.command == "POST":
            return  # déjà affiché de façon plus claire
        sys.stderr.write(f"[{datetime.now():%H:%M:%S}] {self.client_address[0]} {format % args}\n")

    def repondre_json(self, statut, donnees=None):
        corps = json.dumps(donnees if donnees is not None else {}, ensure_ascii=False).encode("utf-8")
        self.send_response(statut)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)

    def lire_corps(self):
        taille = int(self.headers.get("Content-Length") or 0)
        if taille <= 0 or taille > TAILLE_MAX:
            return None
        try:
            return json.loads(self.rfile.read(taille).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return None

    def est_animateur(self):
        donne = self.headers.get("X-Mot-De-Passe", "")
        return hmac.compare_digest(donne.encode("utf-8"), MOT_DE_PASSE.encode("utf-8"))

    def chemin(self):
        return unquote(urlsplit(self.path).path)

    # --- Lecture ---
    def do_GET(self):
        chemin = self.chemin()
        if chemin == "/api/etat":
            return self.repondre_json(HTTPStatus.OK, {"salle": True})
        if chemin == "/api/resultats":
            if not self.est_animateur():
                return self.repondre_json(HTTPStatus.UNAUTHORIZED, {"erreur": "mot de passe incorrect"})
            with verrou:
                return self.repondre_json(HTTPStatus.OK, lire_resultats())
        # Fichiers du site : on ne sert que les pages, styles, scripts et images
        if chemin.endswith("/"):
            chemin += "index.html"
        morceaux = chemin.strip("/").split("/")
        if any(m.startswith(".") for m in morceaux) or morceaux[0] == "donnees" \
                or os.path.splitext(chemin)[1].lower() not in EXTENSIONS_SERVIES:
            return self.send_error(HTTPStatus.NOT_FOUND, "Page introuvable")
        return super().do_GET()

    def do_HEAD(self):
        return self.send_error(HTTPStatus.METHOD_NOT_ALLOWED)

    # --- Envoi d'un résultat par un poste ---
    def do_POST(self):
        chemin = self.chemin()
        if chemin == "/api/connexion":
            if self.est_animateur():
                return self.repondre_json(HTTPStatus.OK, {"ok": True})
            return self.repondre_json(HTTPStatus.UNAUTHORIZED, {"erreur": "mot de passe incorrect"})
        if chemin != "/api/resultats":
            return self.send_error(HTTPStatus.NOT_FOUND)
        resultat = self.lire_corps()
        if not resultat_valide(resultat):
            return self.repondre_json(HTTPStatus.BAD_REQUEST, {"erreur": "résultat invalide"})
        resultat["adresse"] = self.client_address[0]
        resultat["recu"] = datetime.now().isoformat(timespec="seconds")
        with verrou:
            liste = lire_resultats()
            if not any(r.get("id") == resultat["id"] for r in liste):   # pas de doublon si renvoi
                liste.append(resultat)
                ecrire_resultats(liste)
                poste = resultat.get("poste") or self.client_address[0]
                print(f"[{datetime.now():%H:%M:%S}] ✔ Résultat reçu — {resultat['nom'][:40]} ({resultat['jeu']}) depuis {"le poste " + poste if resultat.get("poste") else poste}")
        return self.repondre_json(HTTPStatus.OK, {"ok": True})

    # --- Suppression (animateur) ---
    def do_DELETE(self):
        chemin = self.chemin()
        if not chemin.startswith("/api/resultats"):
            return self.send_error(HTTPStatus.NOT_FOUND)
        if not self.est_animateur():
            return self.repondre_json(HTTPStatus.UNAUTHORIZED, {"erreur": "mot de passe incorrect"})
        identifiant = chemin[len("/api/resultats"):].strip("/")
        with verrou:
            liste = lire_resultats()
            if identifiant:
                liste = [r for r in liste if r.get("id") != identifiant]
            else:
                liste = []
            ecrire_resultats(liste)
        return self.repondre_json(HTTPStatus.OK, {"ok": True})


def adresses_locales():
    """Adresses IP de ce poste sur le réseau local."""
    adresses = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))          # aucun paquet n'est réellement envoyé
        adresses.add(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            adresses.add(info[4][0])
    except OSError:
        pass
    return sorted(a for a in adresses if not a.startswith("127."))


def main():
    global MOT_DE_PASSE
    parseur = argparse.ArgumentParser(description="Serveur de salle Clic & Avenir")
    parseur.add_argument("--port", type=int, default=8000)
    parseur.add_argument("--mot-de-passe", default=os.environ.get("CLIC_AVENIR_MDP", MOT_DE_PASSE))
    options = parseur.parse_args()
    MOT_DE_PASSE = options.mot_de_passe

    try:
        serveur = ThreadingHTTPServer(("0.0.0.0", options.port), Gestionnaire)
    except OSError:
        print(f"\n❌ Le port {options.port} est déjà utilisé. Le serveur est peut-être déjà lancé,")
        print(f"   ou essaie un autre port :  python serveur.py --port {options.port + 1}\n")
        sys.exit(1)

    nb = len(lire_resultats())
    print("\n" + "=" * 62)
    print("  🚀 Clic & Avenir — serveur de salle démarré")
    print("=" * 62)
    print("\n  Sur CE poste (animateur), ouvre :")
    print(f"     http://localhost:{options.port}/admin.html")
    adresses = adresses_locales()
    if adresses:
        print("\n  Sur les AUTRES postes, ouvre dans le navigateur :")
        for a in adresses:
            print(f"     http://{a}:{options.port}/?poste=2   (mets le bon numéro de poste)")
    else:
        print("\n  ⚠️  Adresse réseau introuvable : ce poste est-il connecté au wifi / à la box ?")
    print(f"\n  Résultats déjà enregistrés : {nb}  (dossier « donnees »)")
    if MOT_DE_PASSE == "animateur2026":
        print("  Mot de passe animateur : animateur2026 (par défaut)")
    print("\n  Laisse cette fenêtre ouverte pendant l'atelier.")
    print("  Pour arrêter le serveur : Ctrl + C (ou ferme la fenêtre).\n")

    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        print("\nServeur arrêté. Les résultats sont gardés dans le dossier « donnees ».")


if __name__ == "__main__":
    main()
