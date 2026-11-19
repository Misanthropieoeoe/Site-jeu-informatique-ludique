# Clic & Avenir — site de l'atelier

Site de présentation d'un atelier numérique ludique pour les jeunes (le nom « Clic & Avenir » est provisoire).

## Les 5 thèmes de l'atelier

1. 📄 **Créer son CV**
2. 📧 **Créer son adresse mail pro** (codes professionnels, erreurs à éviter)
3. ✍️ **Faire sa lettre de motivation sur Word**
4. 📱 **Prévention médias et réseaux sociaux**
5. 🎨 **Éveil culturel et beaux-arts**

## Mini-jeux du site

| Thème    | Jeu |
|----------|-----|
| CV       | Quiz de 6 questions avec explications |
| Mail     | Vérificateur d'adresse mail, générateur d'adresse pro à partir du prénom et du nom, et quiz |
| Lettre   | Remettre les paragraphes d'une lettre dans l'ordre, et astuces Word |
| Réseaux  | Vrai ou faux en 7 questions |
| Culture  | Quiz sur des œuvres et des artistes célèbres |

## Créateur de CV (`cv.html`)

1. On choisit un **modèle** (Classique, Moderne, Épuré) et une **couleur**.
2. On remplit ses informations ; l'**aperçu se met à jour en direct**.
3. On **importe sa photo** : elle est recadrée en carré automatiquement.
4. On ajoute ses expériences et formations, qu'on peut réordonner.
5. **Télécharger en PDF** ouvre la fenêtre d'impression : choisir « Enregistrer au format PDF ».

Une alerte prévient si le CV dépasse une page. Les données restent dans le navigateur
de l'utilisateur (rien n'est envoyé sur Internet) et sont retrouvées à la visite suivante.

Avant chaque jeu, le joueur entre son **prénom ou pseudo**. Chaque partie terminée est
enregistrée avec le détail des réponses, consultable dans l'espace animateur.

## Espace animateur (`admin.html`)

Accessible par le lien « 🔒 Espace animateur » en bas de la page d'accueil.

- **Mot de passe par défaut : `animateur2026`** — à changer dans `js/admin.js`
  (remplacer `EMPREINTE_MDP` par l'empreinte SHA-256 du nouveau mot de passe).
- Chiffres clés, recherche par prénom, filtre par jeu.
- Une fiche par joueur : chaque partie avec sa date, son résultat et **le détail du test**
  (réponse donnée, bonne réponse ; pour la lettre, le résultat de chaque essai).
- Les questions les plus ratées, pour savoir quoi réexpliquer.
- Export **CSV** (s'ouvre dans Excel), suppression d'une partie ou de tout.

⚠️ Limites de cette version sans serveur : les résultats restent dans le navigateur de
**l'ordinateur où l'on a joué**, et le mot de passe n'est qu'une protection légère
(quelqu'un qui s'y connaît pourrait lire les données). Pour rassembler les résultats de
plusieurs postes avec une vraie sécurité, il faudra un hébergement avec une base de données.

Les questions se modifient facilement dans `js/main.js` (objet `QUIZ`).

## Lancer le site

Aucune installation : ouvrir `index.html` dans un navigateur.

## Structure

```
index.html     page d'accueil, programme, mini-jeux
cv.html        créateur de CV
admin.html     espace animateur (résultats des joueurs)
css/style.css  styles communs
css/cv.css     styles du créateur de CV et des 3 modèles
css/admin.css  styles de l'espace animateur
js/resultats.js enregistrement des résultats (partagé site / admin)
js/main.js     menu, onglets, quiz et mini-jeux
js/admin.js    espace animateur
js/cv.js       créateur de CV
```

## À compléter

- Nom définitif de l'atelier
- Public, durée, lieu, dates et tarif (section « Infos pratiques »)
- Brancher le formulaire de pré-inscription sur un vrai service d'envoi
