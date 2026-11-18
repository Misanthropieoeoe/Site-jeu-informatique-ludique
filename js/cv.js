/* ==========================================================
   Créateur de CV — Clic & Avenir
   Les données restent dans le navigateur (localStorage).
   ========================================================== */

/* ---------- Menu mobile ---------- */
const menuBtn = document.querySelector(".menu-btn");
const menuNav = document.querySelector(".menu");
menuBtn.addEventListener("click", () => {
  const ouvert = menuNav.classList.toggle("ouvert");
  menuBtn.setAttribute("aria-expanded", ouvert);
});

const CLE_STOCKAGE = "clic-avenir-cv";
const COULEURS = ["#6c4cf5", "#1f6feb", "#0f8b8d", "#2e7d32", "#c2410c", "#be185d", "#334155", "#8b5e34"];
const CHAMPS_SIMPLES = ["prenom", "nom", "titre", "email", "tel", "ville", "mobilite", "profil", "competences", "langues", "loisirs"];

const vide = () => ({
  modele: "classique",
  couleur: COULEURS[0],
  photo: "",
  ...Object.fromEntries(CHAMPS_SIMPLES.map((c) => [c, ""])),
  experiences: [],
  formations: [],
});

const EXEMPLE = {
  modele: "classique",
  couleur: COULEURS[0],
  photo: "",
  prenom: "Sarah",
  nom: "Martin",
  titre: "Vendeuse en boulangerie",
  email: "sarah.martin@mail.fr",
  tel: "06 00 00 00 00",
  ville: "Lyon",
  mobilite: "Permis B en cours",
  profil: "Souriante et dynamique, j'aime le contact avec les clients et le travail en équipe. Je souhaite développer mes compétences dans la vente.",
  experiences: [
    { poste: "Vendeuse (job d'été)", lieu: "Boulangerie Au Bon Pain", dates: "Juil. 2025 – Août 2025", description: "Accueil et conseil des clients, tenue de la caisse, mise en rayon." },
    { poste: "Stage d'observation", lieu: "Supermarché du Centre", dates: "Déc. 2023", description: "Découverte des métiers de la vente et de la logistique." },
    { poste: "Bénévole", lieu: "Association Les Restos du Quartier", dates: "Depuis 2024", description: "Distribution de repas, accueil des familles." },
  ],
  formations: [
    { poste: "CAP Équipier polyvalent du commerce", lieu: "Lycée Jean Moulin, Lyon", dates: "2024 – 2026" },
    { poste: "Diplôme national du brevet", lieu: "Collège Victor Hugo, Lyon", dates: "2024" },
  ],
  competences: "Accueil et conseil client\nEncaissement\nTravail en équipe\nWord, Excel, réseaux sociaux",
  langues: "Français : langue maternelle\nAnglais : niveau intermédiaire",
  loisirs: "Pâtisserie\nBasket en club\nDessin",
};

let cv = charger();

/* ---------- Sauvegarde locale ---------- */
function charger() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (brut) return { ...vide(), ...JSON.parse(brut) };
  } catch (e) { /* stockage indisponible : on part de zéro */ }
  return vide();
}
function sauvegarder() {
  try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(cv)); } catch (e) { /* tant pis */ }
}

/* ---------- Outils ---------- */
const echapper = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lignes = (t) => String(t || "").split("\n").map((l) => l.trim()).filter(Boolean);
const remplis = (liste) => liste.filter((x) => Object.values(x).some((v) => String(v).trim()));

/* ==========================================================
   Rendu des modèles
   ========================================================== */
function blocsCommuns() {
  const nomComplet = [cv.prenom, cv.nom].filter(Boolean).join(" ") || "Prénom Nom";
  const photo = cv.photo ? `<img class="photo" src="${cv.photo}" alt="">` : "";
  const contact = [
    cv.email && `✉ ${echapper(cv.email)}`,
    cv.tel && `☎ ${echapper(cv.tel)}`,
    cv.ville && `⌂ ${echapper(cv.ville)}`,
    cv.mobilite && `🚗 ${echapper(cv.mobilite)}`,
  ].filter(Boolean);

  const items = (liste, avecDesc) =>
    remplis(liste).map((x) => `
      <div class="item">
        <div class="item-tete"><span class="item-titre">${echapper(x.poste)}</span><span class="item-dates">${echapper(x.dates)}</span></div>
        ${x.lieu ? `<div class="item-lieu">${echapper(x.lieu)}</div>` : ""}
        ${avecDesc && x.description ? `<p class="item-desc">${echapper(x.description)}</p>` : ""}
      </div>`).join("");

  const section = (titre, contenu) => (contenu ? `<div class="rubrique"><h2>${titre}</h2><div class="rubrique-contenu">${contenu}</div></div>` : "");
  const puces = (texte, classe = "liste-puces") => {
    const l = lignes(texte);
    return l.length ? `<ul class="${classe}">${l.map((x) => `<li>${echapper(x)}</li>`).join("")}</ul>` : "";
  };

  return {
    nomComplet: echapper(nomComplet),
    titre: cv.titre ? `<p class="titre">${echapper(cv.titre)}</p>` : "",
    photo,
    profil: cv.profil ? `<p class="profil">${echapper(cv.profil)}</p>` : "",
    contactListe: contact.length ? `<ul class="contact">${contact.map((c) => `<li>${c}</li>`).join("")}</ul>` : "",
    contactLigne: contact.map((c) => `<span>${c}</span>`).join(""),
    experiences: items(cv.experiences, true),
    formations: items(cv.formations, false),
    section,
    puces,
  };
}

const MODELES = {
  classique(b) {
    return `
      <aside class="cote">
        ${b.photo}
        ${b.section("Contact", b.contactListe)}
        ${b.section("Compétences", b.puces(cv.competences))}
        ${b.section("Langues", b.puces(cv.langues))}
        ${b.section("Centres d'intérêt", b.puces(cv.loisirs))}
      </aside>
      <div class="principal">
        <div class="entete-cv"><h1 class="nom">${b.nomComplet}</h1>${b.titre}</div>
        ${b.section("Profil", b.profil)}
        ${b.section("Expériences", b.experiences)}
        ${b.section("Formations", b.formations)}
      </div>`;
  },
  moderne(b) {
    return `
      <header class="bandeau">
        ${b.photo}
        <div><h1 class="nom">${b.nomComplet}</h1>${b.titre}${b.profil}</div>
      </header>
      <div class="corps">
        <div class="principal">
          ${b.section("Expériences", b.experiences)}
          ${b.section("Formations", b.formations)}
        </div>
        <aside class="cote">
          ${b.section("Contact", b.contactListe)}
          ${b.section("Compétences", b.puces(cv.competences))}
          ${b.section("Langues", b.puces(cv.langues))}
          ${b.section("Centres d'intérêt", b.puces(cv.loisirs))}
        </aside>
      </div>`;
  },
  epure(b) {
    return `
      <header class="entete-cv">
        <div>
          <h1 class="nom">${b.nomComplet}</h1>${b.titre}
          <div class="contact-ligne">${b.contactLigne}</div>
        </div>
        ${b.photo}
      </header>
      <div class="filet"></div>
      ${b.section("Profil", b.profil)}
      ${b.section("Expériences", b.experiences)}
      ${b.section("Formations", b.formations)}
      ${b.section("Compétences", b.puces(cv.competences, "tags"))}
      ${b.section("Langues", b.puces(cv.langues))}
      ${b.section("Centres d'intérêt", b.puces(cv.loisirs, "tags"))}`;
  },
};

const page = document.getElementById("cv-page");
const alertePage = document.getElementById("alerte-page");

function rendreCV() {
  page.className = "cv-page cv-" + cv.modele;
  page.style.setProperty("--accent", cv.couleur);
  page.innerHTML = MODELES[cv.modele](blocsCommuns());
  // Le contenu dépasse-t-il une page A4 ?
  const dernier = [...page.querySelectorAll(".rubrique, .item, .entete-cv, .bandeau")].reduce(
    (max, el) => Math.max(max, el.getBoundingClientRect().bottom), 0);
  const depasse = dernier - page.getBoundingClientRect().top > page.getBoundingClientRect().height + 1;
  alertePage.hidden = !depasse;
  sauvegarder();
}

/* ---------- Mise à l'échelle de l'aperçu ---------- */
const cadre = document.getElementById("apercu-cadre");
const echelle = document.getElementById("apercu-echelle");
function ajusterEchelle() {
  const style = getComputedStyle(cadre);
  const dispo = cadre.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const ratio = Math.min(1, dispo / 794);
  echelle.style.transform = `scale(${ratio})`;
  echelle.style.height = 1123 * ratio + "px";
  rendreCV(); // recalcul de l'alerte (dépend de la taille affichée)
}
new ResizeObserver(ajusterEchelle).observe(cadre);

/* ==========================================================
   Éditeur
   ========================================================== */
const form = document.getElementById("editeur");

/* Modèles */
const boutonsModele = document.querySelectorAll(".modele");
boutonsModele.forEach((b) =>
  b.addEventListener("click", () => {
    cv.modele = b.dataset.modele;
    majChoix();
    rendreCV();
  })
);

/* Couleurs */
const zoneCouleurs = document.getElementById("couleurs");
COULEURS.forEach((c) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "couleur";
  b.style.background = c;
  b.dataset.couleur = c;
  b.setAttribute("aria-label", "Couleur " + c);
  b.addEventListener("click", () => { cv.couleur = c; majChoix(); rendreCV(); });
  zoneCouleurs.appendChild(b);
});

function majChoix() {
  boutonsModele.forEach((b) => b.classList.toggle("actif", b.dataset.modele === cv.modele));
  zoneCouleurs.querySelectorAll(".couleur").forEach((b) => b.classList.toggle("actif", b.dataset.couleur === cv.couleur));
}

/* Champs simples */
form.addEventListener("input", (e) => {
  const el = e.target;
  if (el.name && CHAMPS_SIMPLES.includes(el.name)) {
    cv[el.name] = el.value;
    rendreCV();
  }
});

/* Photo : on la redimensionne pour garder un fichier léger */
const champPhoto = document.getElementById("photo");
const photoApercu = document.getElementById("photo-apercu");
const btnRetirer = document.getElementById("photo-retirer");

champPhoto.addEventListener("change", () => {
  const fichier = champPhoto.files[0];
  if (!fichier || !fichier.type.startsWith("image/")) return;
  const lecteur = new FileReader();
  lecteur.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Recadrage carré centré, 400 × 400 px
      const cote = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 400;
      canvas.getContext("2d").drawImage(img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, 400, 400);
      cv.photo = canvas.toDataURL("image/jpeg", 0.85);
      majPhoto();
      rendreCV();
    };
    img.src = lecteur.result;
  };
  lecteur.readAsDataURL(fichier);
  champPhoto.value = "";
});
btnRetirer.addEventListener("click", () => { cv.photo = ""; majPhoto(); rendreCV(); });

function majPhoto() {
  photoApercu.style.backgroundImage = cv.photo ? `url(${cv.photo})` : "";
  photoApercu.classList.toggle("rempli", !!cv.photo);
  btnRetirer.hidden = !cv.photo;
}

/* Listes répétables : expériences et formations */
function dessinerListe(type) {
  const conteneur = document.getElementById("liste-" + type);
  const modele = document.getElementById("tpl-" + type);
  conteneur.innerHTML = "";
  cv[type].forEach((entree, i) => {
    const bloc = modele.content.firstElementChild.cloneNode(true);
    bloc.querySelectorAll("[data-champ]").forEach((champ) => {
      champ.value = entree[champ.dataset.champ] || "";
      champ.addEventListener("input", () => { entree[champ.dataset.champ] = champ.value; rendreCV(); });
    });
    bloc.querySelectorAll("[data-action]").forEach((btn) => {
      const action = btn.dataset.action;
      if (action === "monter" && i === 0) btn.hidden = true;
      if (action === "descendre" && i === cv[type].length - 1) btn.hidden = true;
      btn.addEventListener("click", () => {
        if (action === "supprimer") cv[type].splice(i, 1);
        else {
          const j = action === "monter" ? i - 1 : i + 1;
          [cv[type][i], cv[type][j]] = [cv[type][j], cv[type][i]];
        }
        dessinerListe(type);
        rendreCV();
      });
    });
    conteneur.appendChild(bloc);
  });
}

document.querySelectorAll("[data-ajouter]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const type = btn.dataset.ajouter;
    cv[type].push({ poste: "", lieu: "", dates: "", description: "" });
    dessinerListe(type);
    rendreCV();
    const blocs = document.querySelectorAll(`#liste-${type} .bloc`);
    blocs[blocs.length - 1].querySelector("input").focus();
  })
);

/* Remplir tout le formulaire à partir des données */
function remplirFormulaire() {
  CHAMPS_SIMPLES.forEach((c) => (form.elements[c].value = cv[c] || ""));
  dessinerListe("experiences");
  dessinerListe("formations");
  majChoix();
  majPhoto();
  rendreCV();
}

document.getElementById("exemple").addEventListener("click", () => {
  if (cv.prenom || cv.nom) {
    if (!confirm("Remplacer tes informations par l'exemple ?")) return;
  }
  cv = { ...structuredClone(EXEMPLE), modele: cv.modele, couleur: cv.couleur, photo: cv.photo };
  remplirFormulaire();
});
document.getElementById("effacer").addEventListener("click", () => {
  if (!confirm("Effacer tout ton CV ?")) return;
  cv = { ...vide(), modele: cv.modele, couleur: cv.couleur };
  remplirFormulaire();
});

/* Téléchargement PDF via l'impression du navigateur */
document.getElementById("telecharger").addEventListener("click", () => {
  const ancienTitre = document.title;
  const nomFichier = ["CV", cv.prenom, cv.nom].filter(Boolean).join("_").replace(/\s+/g, "-");
  document.title = nomFichier; // nom proposé pour le PDF
  window.print();
  document.title = ancienTitre;
});

remplirFormulaire();
