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

Les questions se modifient facilement dans `js/main.js` (objet `QUIZ`).

## Lancer le site

Aucune installation : ouvrir `index.html` dans un navigateur.

## Structure

```
index.html     page d'accueil, programme, mini-jeux
cv.html        créateur de CV
css/style.css  styles communs
css/cv.css     styles du créateur de CV et des 3 modèles
js/main.js     menu, onglets, quiz et mini-jeux
js/cv.js       créateur de CV
```

## À compléter

- Nom définitif de l'atelier
- Public, durée, lieu, dates et tarif (section « Infos pratiques »)
- Brancher le formulaire de pré-inscription sur un vrai service d'envoi
