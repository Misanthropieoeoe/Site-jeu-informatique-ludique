# 📡 Installer l'atelier en salle (plusieurs postes)

Objectif : les résultats des jeunes, sur tous les postes, arrivent **automatiquement**
sur le poste animateur.

```
  Poste 2 ─┐
  Poste 3 ─┼──── même wifi / même box ────▶  Poste 1 (animateur)
  Poste 4 ─┘                                  serveur.py + espace animateur
```

## Ce qu'il faut

- Tous les postes sur **le même réseau** (même wifi ou même box).
- **Python 3** sur le poste animateur uniquement.
  Sur Windows, s'il n'est pas installé : <https://www.python.org/downloads/>
  (pendant l'installation, cocher **« Add Python to PATH »**).
- Le dossier du site copié sur le poste animateur. Les autres postes n'ont besoin de rien,
  juste d'un navigateur.

## Au début de l'atelier

### 1. Sur le poste 1 (animateur)

1. Double-cliquer sur **`lancer-serveur.bat`** (Windows) ou `lancer-serveur.sh` (Mac / Linux).
2. Si Windows demande l'autorisation du pare-feu : cocher **« Réseaux privés »** puis **Autoriser**.
3. Une fenêtre noire affiche l'adresse à utiliser, par exemple :
   ```
   Sur les AUTRES postes, ouvre dans le navigateur :
      http://192.168.1.10:8000/?poste=2
   ```
4. **Laisser cette fenêtre ouverte** pendant tout l'atelier.
5. Ouvrir l'espace animateur : <http://localhost:8000/admin.html>
   (mot de passe : `animateur2026`). Le bandeau vert « 📡 Mode salle » confirme que tout va bien.

### 2. Sur les postes 2, 3, 4

Ouvrir le navigateur et taper l'adresse affichée, **en changeant le numéro du poste** :

- poste 2 → `http://192.168.1.10:8000/?poste=2`
- poste 3 → `http://192.168.1.10:8000/?poste=3`
- poste 4 → `http://192.168.1.10:8000/?poste=4`

Le numéro est retenu : les fois suivantes, `http://192.168.1.10:8000` suffit.
Astuce : ajouter la page aux favoris de chaque poste.

## Pendant l'atelier

- Chaque partie terminée apparaît dans l'espace animateur en quelques secondes,
  avec le numéro du poste.
- La fenêtre du serveur affiche aussi chaque résultat reçu.
- Si le wifi coupe, le résultat est gardé sur le poste et **renvoyé automatiquement**
  dès que le réseau revient (essai toutes les 30 secondes).

## À la fin

- **⬇ Exporter en Excel** dans l'espace animateur (colonne « Poste » incluse).
- Fermer la fenêtre du serveur. Les résultats restent enregistrés dans le dossier
  `donnees/` et seront là au prochain lancement.
- **🗑 Tout effacer** remet les résultats à zéro pour un nouveau groupe.

## Changer le mot de passe

Lancer le serveur avec : `python serveur.py --mot-de-passe MonNouveauMotDePasse`
(ou modifier la ligne `MOT_DE_PASSE = "animateur2026"` dans `serveur.py`).

## En cas de problème

| Problème | Solution |
|---|---|
| Les postes n'arrivent pas à ouvrir l'adresse | Vérifier qu'ils sont sur le même wifi que le poste 1, et que le pare-feu Windows autorise Python (Panneau de configuration › Pare-feu › Autoriser une application). |
| « Le port 8000 est déjà utilisé » | Le serveur tourne déjà dans une autre fenêtre, ou lancer `python serveur.py --port 8001`. |
| Bandeau « 💻 Mode local » dans l'espace animateur | L'espace a été ouvert en double-cliquant sur le fichier : ouvrir plutôt <http://localhost:8000/admin.html>. |
| Réseau de la structure verrouillé (postes isolés) | Demander au service informatique d'autoriser le port 8000 entre les postes, ou utiliser l'export Excel sur chaque poste. |
