/* ==========================================================
   Clic & Avenir — scripts du site
   ========================================================== */

/* ---------- Menu mobile ---------- */
const menuBtn = document.querySelector(".menu-btn");
const menu = document.querySelector(".menu");
menuBtn.addEventListener("click", () => {
  const ouvert = menu.classList.toggle("ouvert");
  menuBtn.setAttribute("aria-expanded", ouvert);
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") menu.classList.remove("ouvert");
});

/* ---------- Onglets des mini-jeux ---------- */
document.querySelectorAll(".onglet").forEach((onglet) => {
  onglet.addEventListener("click", () => {
    document.querySelectorAll(".onglet").forEach((o) => {
      o.classList.toggle("actif", o === onglet);
      o.setAttribute("aria-selected", o === onglet);
    });
    document.querySelectorAll(".jeu").forEach((jeu) => {
      jeu.hidden = jeu.id !== "jeu-" + onglet.dataset.jeu;
    });
    // On reprend le dernier prénom saisi pour ne pas le retaper
    document.querySelectorAll(".ecran-joueur input").forEach((champ) => {
      if (!champ.value) champ.value = Resultats.dernierNom();
    });
  });
});

function afficherMessage(el, texte, type) {
  el.textContent = texte;
  el.className = "message" + (type ? " " + type : "");
}

/* ==========================================================
   Contenu des quiz
   bonne = numéro de la bonne réponse (0 = la première)
   ========================================================== */
const VF = ["Vrai", "Faux"];
const QUIZ = {
  cv: [
    {
      q: "Pour un premier CV, combien de pages faut-il viser ?",
      choix: ["Une seule page", "Trois pages minimum", "Pas de limite, plus c'est long mieux c'est"],
      bonne: 0,
      explication: "Un recruteur passe en moyenne moins d'une minute sur un CV : une page claire suffit largement.",
    },
    {
      q: "Si je mets une photo, laquelle choisir ?",
      choix: ["Un selfie avec un filtre sympa", "Une photo neutre, souriante, sur fond uni", "Une photo de soirée avec mes amis"],
      bonne: 1,
      explication: "La photo n'est pas obligatoire en France. Si tu en mets une, elle doit être sobre et professionnelle.",
    },
    {
      q: "Dans la rubrique « Expériences », je commence par…",
      choix: ["La plus ancienne", "La plus récente", "Peu importe l'ordre"],
      bonne: 1,
      explication: "On classe de la plus récente à la plus ancienne : c'est ce que le recruteur veut voir en premier.",
    },
    {
      q: "Mon stage de 3e, du baby-sitting ou du bénévolat, je les mets sur mon CV ?",
      choix: ["Non, ce ne sont pas de vraies expériences", "Oui, ça montre ce que je sais faire"],
      bonne: 1,
      explication: "Toute expérience compte ! Elle montre ton sérieux, ta ponctualité, ton sens des responsabilités…",
    },
    {
      q: "Sous quel format envoyer mon CV ?",
      choix: ["Une photo du CV prise avec mon téléphone", "En PDF, nommé « CV_Prenom_Nom.pdf »", "Peu importe"],
      bonne: 1,
      explication: "Le PDF garde ta mise en page intacte sur tous les ordinateurs. Un nom de fichier clair aide le recruteur.",
    },
    {
      q: "Quelques fautes d'orthographe sur un CV, c'est grave ?",
      choix: ["Non, personne ne fait attention", "Oui : je me relis et je fais relire"],
      bonne: 1,
      explication: "Les fautes donnent une impression de négligence. Utilise le correcteur et demande à quelqu'un de relire.",
    },
  ],
  mail: [
    {
      q: "Quelle adresse choisir pour envoyer une candidature ?",
      choix: ["bg-du-93@mail.fr", "sarah.martin@mail.fr", "lapetiteprincesse2008@mail.fr"],
      bonne: 1,
      explication: "Prénom + nom : c'est simple, sérieux, et le recruteur sait tout de suite qui tu es.",
    },
    {
      q: "Quel objet écrire dans le mail ?",
      choix: ["(rien, je laisse vide)", "slt", "Candidature – Poste de vendeur – Sarah Martin"],
      bonne: 2,
      explication: "L'objet doit dire en une ligne pourquoi tu écris. Un mail sans objet risque de finir dans les spams.",
    },
    {
      q: "Comment commencer le mail ?",
      choix: ["Wesh !", "Coucou,", "Bonjour Madame, Monsieur,"],
      bonne: 2,
      explication: "On reste poli et formel. Si tu connais le nom de la personne : « Bonjour Madame Dupont, ».",
    },
    {
      q: "J'écris mon mail tout en MAJUSCULES pour montrer ma motivation.",
      choix: ["Bonne idée", "Mauvaise idée"],
      bonne: 1,
      explication: "Sur Internet, les majuscules donnent l'impression de crier. On écrit normalement.",
    },
    {
      q: "Je mets mon CV en pièce jointe. Que j'écris dans le corps du mail ?",
      choix: ["Rien, tout est dans le CV", "Quelques lignes pour me présenter et dire ce que je cherche"],
      bonne: 1,
      explication: "Un mail vide fait peu sérieux. Quelques phrases polies suffisent, puis une formule de fin et ta signature.",
    },
    {
      q: "Avant de cliquer sur « Envoyer », je vérifie…",
      choix: ["Que la pièce jointe est bien là", "L'orthographe et l'adresse du destinataire", "Les deux !"],
      bonne: 2,
      explication: "L'oubli de pièce jointe est l'erreur la plus fréquente. Un dernier coup d'œil évite bien des soucis.",
    },
  ],
  reseaux: [
    {
      q: "Une photo que j'ai publiée peut être supprimée définitivement d'Internet.",
      choix: VF,
      bonne: 1,
      explication: "Même supprimée, elle a pu être copiée ou capturée. Réfléchis avant de publier !",
    },
    {
      q: "Un recruteur peut regarder mes réseaux sociaux avant de m'embaucher.",
      choix: VF,
      bonne: 0,
      explication: "C'est très courant. Pense à vérifier ce qui est public sur tes profils : c'est ton e-réputation.",
    },
    {
      q: "Une information partagée des milliers de fois est forcément vraie.",
      choix: VF,
      bonne: 1,
      explication: "Les fausses infos circulent souvent plus vite que les vraies. Vérifie la source et croise avec des médias fiables.",
    },
    {
      q: "Je peux publier la photo d'un ami sans lui demander son accord.",
      choix: VF,
      bonne: 1,
      explication: "C'est le droit à l'image : chacun doit donner son accord avant qu'on publie une photo de lui.",
    },
    {
      q: "Le cyberharcèlement est puni par la loi.",
      choix: VF,
      bonne: 0,
      explication: "Oui. Si tu en es victime ou témoin, parles-en : le 3018 est un numéro gratuit et anonyme.",
    },
    {
      q: "Utiliser le même mot de passe partout, c'est pratique et sans risque.",
      choix: VF,
      bonne: 1,
      explication: "Si un seul site se fait pirater, tous tes comptes sont en danger. Un mot de passe différent par compte !",
    },
    {
      q: "Les réseaux sociaux me montrent surtout ce qui me fait réagir, pour que je reste connecté·e.",
      choix: VF,
      bonne: 0,
      explication: "Les algorithmes choisissent ce que tu vois. Varie tes sources pour ne pas rester dans une « bulle ».",
    },
  ],
  culture: [
    {
      q: "Qui a peint La Joconde ?",
      choix: ["Pablo Picasso", "Léonard de Vinci", "Claude Monet"],
      bonne: 1,
      explication: "Peinte au début du XVIe siècle, elle est exposée au musée du Louvre, à Paris.",
    },
    {
      q: "Qui a peint La Nuit étoilée, avec son ciel en tourbillons ?",
      choix: ["Vincent van Gogh", "Salvador Dalí", "Rembrandt"],
      bonne: 0,
      explication: "Van Gogh l'a peinte en 1889. Son style aux couleurs vives et aux touches épaisses est reconnaissable entre mille.",
    },
    {
      q: "Le Penseur est une célèbre sculpture de…",
      choix: ["Michel-Ange", "Camille Claudel", "Auguste Rodin"],
      bonne: 2,
      explication: "On peut l'admirer au musée Rodin, à Paris. Camille Claudel, elle aussi grande sculptrice, fut son élève.",
    },
    {
      q: "Qui a peint la série des Nymphéas ?",
      choix: ["Claude Monet", "Gustave Courbet", "Henri Matisse"],
      bonne: 0,
      explication: "Monet est l'un des pères de l'impressionnisme. Ses Nymphéas géants sont au musée de l'Orangerie, à Paris.",
    },
    {
      q: "Quel peintre a réalisé La Liberté guidant le peuple (1830) ?",
      choix: ["Jacques-Louis David", "Eugène Delacroix", "Théodore Géricault"],
      bonne: 1,
      explication: "Delacroix y représente la révolution de juillet 1830. Le tableau est au Louvre.",
    },
    {
      q: "Le street art (graffitis, fresques, collages) peut être exposé dans des musées.",
      choix: VF,
      bonne: 0,
      explication: "Oui ! Des artistes comme Banksy ou le Français JR sont exposés dans le monde entier.",
    },
    {
      q: "En France, les musées nationaux sont gratuits pour les moins de 26 ans résidant dans l'Union européenne.",
      choix: VF,
      bonne: 0,
      explication: "Profites-en : le Louvre, Orsay, le château de Versailles… sont gratuits pour toi (sur présentation d'une pièce d'identité).",
    },
  ],
};

/* Écran d'accueil d'un jeu : on demande le prénom avant de jouer */
function demanderNom(conteneur, jeu, auDepart) {
  conteneur.innerHTML = `
    <form class="ecran-joueur">
      <label>👤 Ton prénom ou ton pseudo
        <input class="champ" name="nom" maxlength="20" required value="${echapper(Resultats.dernierNom())}">
      </label>
      <button class="btn btn-principal" type="submit">C'est parti !</button>
    </form>`;
  conteneur.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const nom = e.target.nom.value.trim();
    if (!nom) return;
    Resultats.memoriserNom(nom);
    auDepart(nom);
  });
}

/* ==========================================================
   Moteur de quiz
   ========================================================== */
function lancerQuiz(conteneur, questions, jeu) {
  let index = 0;
  let score = 0;
  let joueur = "";
  let reponses = [];

  function commencer(nom) {
    joueur = nom;
    index = 0;
    score = 0;
    reponses = [];
    afficherQuestion();
  }

  function afficherQuestion() {
    const { q, choix } = questions[index];
    conteneur.innerHTML = `
      <p class="quiz-progression">👤 ${echapper(joueur)} · Question ${index + 1} / ${questions.length} · Score : ${score}</p>
      <p class="quiz-question">${q}</p>
      <div class="quiz-choix">${choix.map((c, i) => `<button class="choix" data-i="${i}">${c}</button>`).join("")}</div>
      <div class="quiz-suite"></div>`;
    conteneur.querySelectorAll(".choix").forEach((b) => b.addEventListener("click", () => repondre(Number(b.dataset.i))));
  }

  function repondre(i) {
    const { bonne, explication } = questions[index];
    const boutons = conteneur.querySelectorAll(".choix");
    boutons.forEach((b) => (b.disabled = true));
    boutons[bonne].classList.add("juste");
    if (i === bonne) score++;
    else boutons[i].classList.add("faux");
    reponses.push({
      question: questions[index].q,
      choisie: questions[index].choix[i],
      bonne: questions[index].choix[bonne],
      juste: i === bonne,
    });

    const suite = conteneur.querySelector(".quiz-suite");
    const derniere = index === questions.length - 1;
    suite.innerHTML = `
      <p class="explication">${i === bonne ? "✅ Bien vu ! " : "❌ Raté… "}${explication}</p>
      <button class="btn btn-principal">${derniere ? "Voir mon score" : "Question suivante →"}</button>`;
    suite.querySelector("button").addEventListener("click", () => {
      if (derniere) afficherFin();
      else { index++; afficherQuestion(); }
    });
  }

  function afficherFin() {
    Resultats.ajouter({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      jeu,
      nom: joueur,
      date: new Date().toISOString(),
      points: score,
      total: questions.length,
      reponses,
    });
    const ratio = score / questions.length;
    const bilan =
      ratio === 1 ? "parfait, tu es un·e expert·e ! 🏆" :
      ratio >= 0.6 ? "très bien, tu as les bons réflexes ! 👏" :
      "pas mal ! L'atelier t'aidera à aller plus loin. 💪";
    conteneur.innerHTML = `
      <p class="quiz-fin">${echapper(joueur)}, ton score : ${score} / ${questions.length}</p>
      <p>Bravo ${echapper(joueur)}, ${bilan}</p>
      <div class="boutons">
        <button class="btn btn-principal" data-action="rejouer">Rejouer</button>
        <button class="btn btn-secondaire" data-action="changer">Changer de joueur</button>
      </div>`;
    conteneur.querySelector('[data-action="rejouer"]').addEventListener("click", () => commencer(joueur));
    conteneur.querySelector('[data-action="changer"]').addEventListener("click", () => demanderNom(conteneur, jeu, commencer));
  }

  demanderNom(conteneur, jeu, commencer);
}

document.querySelectorAll(".quiz").forEach((el) => lancerQuiz(el, QUIZ[el.dataset.quiz], el.dataset.quiz));

/* ==========================================================
   Outils mail : vérificateur et générateur d'adresse
   ========================================================== */
(function outilsMail() {
  const champ = document.getElementById("mail-test");
  const verdict = document.getElementById("mail-verdict");
  const MOTS_A_EVITER = [
    "bg", "bb", "bebe", "love", "lol", "mdr", "ptdr", "sexy", "boss", "beau", "belle", "princesse",
    "prince", "chou", "cherie", "gangster", "killer", "ange", "diable", "kiss", "xx", "swag", "babe",
    "darkk", "gamer", "pgm", "coeur", "doudou", "loulou", "minou", "titi", "chaton", "bogoss", "miss",
  ];

  champ.addEventListener("input", () => {
    const adresse = champ.value.trim();
    verdict.innerHTML = "";
    if (!adresse) return;

    const remarques = [];
    const ok = (t) => remarques.push(["bien", "✅ " + t]);
    const ko = (t) => remarques.push(["attention", "⚠️ " + t]);

    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(adresse)) {
      ko("Ce n'est pas encore une adresse complète (forme attendue : nom@fournisseur.fr).");
    } else {
      const local = adresse.split("@")[0];
      const minuscule = local.toLowerCase();
      const mots = minuscule.split(/[._\-0-9]+/);
      const motsTrouves = MOTS_A_EVITER.filter((m) => mots.includes(m) || (m.length > 3 && minuscule.includes(m)));

      if (motsTrouves.length) ko(`Évite les surnoms et les mots familiers (« ${motsTrouves.join(", ")} »).`);
      if ((local.match(/\d/g) || []).length > 2) ko("Trop de chiffres : évite ta date de naissance ou ton code postal.");
      if (/[A-Z]/.test(local)) ko("Préfère les minuscules, c'est plus facile à recopier.");
      if (local.length > 30) ko("Adresse trop longue : difficile à retenir et à recopier.");
      if (/[._-]{2,}/.test(local)) ko("Évite les symboles à la suite (.. ou __).");
      if (!/[.\-]/.test(local)) ko("Astuce : sépare ton prénom et ton nom par un point (prenom.nom).");

      if (!remarques.length) ok("Cette adresse a l'air professionnelle, bravo !");
    }
    verdict.innerHTML = remarques.map(([c, t]) => `<li class="${c}">${t}</li>`).join("");
  });

  const prenomEl = document.getElementById("mail-prenom");
  const nomEl = document.getElementById("mail-nom");
  const suggestions = document.getElementById("mail-suggestions");
  const nettoyer = (t) =>
    t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
      .replace(/[^a-z\s-]/g, "").replace(/\s+/g, "-");

  function proposer() {
    const p = nettoyer(prenomEl.value);
    const n = nettoyer(nomEl.value);
    if (!p || !n) { suggestions.innerHTML = ""; return; }
    const domaine = "@fournisseur.fr";
    const idees = [`${p}.${n}`, `${p}-${n}`, `${p[0]}.${n}`, `${n}.${p}`];
    suggestions.innerHTML =
      idees.map((i) => `<li>${i}${domaine}</li>`).join("") +
      '<li class="note-fournisseur">Remplace « fournisseur.fr » par Gmail, Outlook, Laposte…</li>';
  }
  prenomEl.addEventListener("input", proposer);
  nomEl.addEventListener("input", proposer);
})();

/* ==========================================================
   Jeu : remets la lettre de motivation dans l'ordre
   ========================================================== */
(function jeuLettre() {
  const BLOCS = [
    "Sarah Martin · 12 rue des Lilas · sarah.martin@mail.fr · 06 00 00 00 00",
    "Objet : Candidature au poste de vendeuse",
    "Madame, Monsieur,",
    "« Vous » — Votre magasin est reconnu pour la qualité de son accueil et de ses conseils, des valeurs qui me tiennent à cœur.",
    "« Moi » — Lors de mon stage dans une boulangerie, j'ai appris à accueillir les clients, tenir la caisse et travailler en équipe.",
    "« Nous » — Je serais ravie de vous rencontrer lors d'un entretien pour vous montrer ma motivation.",
    "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    "Sarah Martin",
  ];
  const liste = document.getElementById("lettre-blocs");
  const messageEl = document.getElementById("lettre-message");
  const accueil = document.getElementById("lettre-accueil");
  const zoneJeu = document.getElementById("lettre-jeu");
  const barre = document.getElementById("lettre-barre");
  let ordre = [];
  let joueur = "";
  let essais = 0;
  let tentatives = [];
  let termine = false;

  function commencer(nom) {
    joueur = nom;
    accueil.innerHTML = "";
    zoneJeu.hidden = false;
    barre.innerHTML = `👤 ${echapper(joueur)} · <button type="button" class="lien" id="lettre-changer">Changer de joueur</button>`;
    document.getElementById("lettre-changer").addEventListener("click", () => {
      zoneJeu.hidden = true;
      demanderNom(accueil, "lettre", commencer);
    });
    melanger();
  }

  function melanger() {
    do {
      ordre = BLOCS.map((_, i) => i);
      for (let i = ordre.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
      }
    } while (ordre.every((v, i) => v === i));
    essais = 0;
    tentatives = [];
    termine = false;
    afficherMessage(messageEl, "");
    dessiner();
  }

  function dessiner(corrige = false) {
    liste.innerHTML = ordre.map((b, pos) => `
      <li class="bloc-lettre${corrige ? (b === pos ? " bien-place" : " mal-place") : ""}">
        <span class="fleches">
          <button data-pos="${pos}" data-sens="-1" aria-label="Monter" ${pos === 0 ? "disabled" : ""}>▲</button>
          <button data-pos="${pos}" data-sens="1" aria-label="Descendre" ${pos === ordre.length - 1 ? "disabled" : ""}>▼</button>
        </span>
        <p>${BLOCS[b]}</p>
      </li>`).join("");
  }

  liste.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || termine) return;
    const pos = Number(btn.dataset.pos);
    const cible = pos + Number(btn.dataset.sens);
    [ordre[pos], ordre[cible]] = [ordre[cible], ordre[pos]];
    afficherMessage(messageEl, "");
    dessiner();
  });

  document.getElementById("lettre-verifier").addEventListener("click", () => {
    if (termine) return;
    essais++;
    const bienPlaces = ordre.filter((b, pos) => b === pos).length;
    tentatives.push(bienPlaces);
    dessiner(true);
    if (bienPlaces === BLOCS.length) {
      termine = true;
      Resultats.ajouter({
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        jeu: "lettre",
        nom: joueur,
        date: new Date().toISOString(),
        essais,
        total: BLOCS.length,
        tentatives,
      });
      afficherMessage(messageEl,
        `Bravo ${joueur}, ta lettre est parfaitement construite en ${essais} essai${essais > 1 ? "s" : ""} ! 🎉`, "bravo");
    } else {
      afficherMessage(messageEl, `${bienPlaces} / ${BLOCS.length} blocs bien placés. Les blocs en rose sont à déplacer.`, "oups");
    }
  });
  document.getElementById("lettre-melanger").addEventListener("click", melanger);

  demanderNom(accueil, "lettre", commencer);
})();

/* ==========================================================
   Formulaire de pré-inscription (démo, pas encore d'envoi réel)
   ========================================================== */
document.getElementById("form-inscription").addEventListener("submit", (e) => {
  e.preventDefault();
  const prenom = e.target.prenom.value.trim();
  afficherMessage(
    document.getElementById("form-message"),
    `Merci ${prenom} ! Ta demande est bien notée. (Démo : l'envoi réel reste à brancher.)`,
    "bravo"
  );
  e.target.reset();
});
