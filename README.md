# Les Petits Codeurs — site de l'atelier

Site vitrine d'un atelier ludique d'initiation à l'informatique pour les 8–14 ans.

## Contenu

- **Accueil** et présentation de l'atelier
- **Programme** en 4 séances (binaire, algorithmes, pixels, sécurité sur Internet)
- **Mini-jeux** jouables dans le navigateur :
  - 🔢 *Cartes binaires* : composer un nombre avec des cartes 16/8/4/2/1
  - 🤖 *Guide le robot* : programmer un robot avec des flèches (3 niveaux)
  - 🎨 *Pixels* : dessiner sur une grille et voir le code en 0 et 1
- **Infos pratiques** et formulaire de pré-inscription (démo, envoi à brancher)

## Lancer le site

Aucune installation : ouvrir `index.html` dans un navigateur.
Ou, pour un petit serveur local :

```bash
python3 -m http.server 8000
```

## Structure

```
index.html     page unique
css/style.css  styles
js/main.js     menu, onglets et mini-jeux
```

## À compléter

- Lieu, dates et tarif dans la section « Infos pratiques »
- Brancher le formulaire sur un vrai service d'envoi (ex. Formspree, Netlify Forms)
