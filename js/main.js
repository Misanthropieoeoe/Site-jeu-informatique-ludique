/* ==========================================================
   Les Petits Codeurs — scripts du site
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
  });
});

function afficherMessage(el, texte, type) {
  el.textContent = texte;
  el.className = "message" + (type ? " " + type : "");
}

/* ==========================================================
   Jeu 1 : les cartes binaires
   ========================================================== */
(function jeuBinaire() {
  const valeurs = [16, 8, 4, 2, 1];
  const conteneur = document.getElementById("bin-cartes");
  const cibleEl = document.getElementById("bin-cible");
  const totalEl = document.getElementById("bin-total");
  const codeEl = document.getElementById("bin-code");
  const messageEl = document.getElementById("bin-message");
  let cible = 0;
  const etat = valeurs.map(() => false);

  valeurs.forEach((v, i) => {
    const carte = document.createElement("button");
    carte.className = "carte-bin";
    carte.setAttribute("aria-label", "Carte " + v);
    carte.innerHTML = `<span class="points">${"●".repeat(v)}</span><span class="valeur">${v}</span>`;
    carte.addEventListener("click", () => {
      etat[i] = !etat[i];
      carte.classList.toggle("retournee", etat[i]);
      mettreAJour();
    });
    conteneur.appendChild(carte);
  });

  function mettreAJour() {
    const total = valeurs.reduce((s, v, i) => s + (etat[i] ? v : 0), 0);
    totalEl.textContent = total;
    codeEl.textContent = etat.map((b) => (b ? "1" : "0")).join("");
    if (total === cible) {
      afficherMessage(messageEl, `Bravo ! ${cible} s'écrit ${codeEl.textContent} en binaire 🎉`, "bravo");
    } else if (total > cible) {
      afficherMessage(messageEl, "Trop grand ! Retourne une carte.", "oups");
    } else {
      afficherMessage(messageEl, "");
    }
  }

  function nouveau() {
    let n;
    do { n = 1 + Math.floor(Math.random() * 31); } while (n === cible);
    cible = n;
    cibleEl.textContent = cible;
    etat.fill(false);
    conteneur.querySelectorAll(".carte-bin").forEach((c) => c.classList.remove("retournee"));
    mettreAJour();
  }

  document.getElementById("bin-nouveau").addEventListener("click", nouveau);
  nouveau();
})();

/* ==========================================================
   Jeu 2 : guide le robot
   R = robot, * = étoile, # = mur, . = vide
   ========================================================== */
(function jeuRobot() {
  const niveaux = [
    [
      "......",
      ".R..*.",
      "......",
      "......",
      "......",
      "......",
    ],
    [
      "R.#...",
      "..#...",
      "..#.*.",
      "..#...",
      "......",
      "......",
    ],
    [
      "R#....",
      ".#.##*",
      ".#..#.",
      ".##.#.",
      "....#.",
      "###...",
    ],
  ];
  const directions = {
    haut: { dl: -1, dc: 0, icone: "⬆️" },
    bas: { dl: 1, dc: 0, icone: "⬇️" },
    gauche: { dl: 0, dc: -1, icone: "⬅️" },
    droite: { dl: 0, dc: 1, icone: "➡️" },
  };
  const MAX_INSTRUCTIONS = 30;

  const grilleEl = document.getElementById("robot-grille");
  const programmeEl = document.getElementById("robot-programme");
  const messageEl = document.getElementById("robot-message");
  const niveauEl = document.getElementById("robot-niveau");
  const btnLancer = document.getElementById("robot-lancer");

  let niveau = 0;
  let carte, depart, robot, etoile;
  let programme = [];
  let enCours = false;

  function chargerNiveau() {
    carte = niveaux[niveau].map((ligne) => ligne.split(""));
    carte.forEach((ligne, l) =>
      ligne.forEach((c, col) => {
        if (c === "R") depart = { l, c: col };
        if (c === "*") etoile = { l, c: col };
      })
    );
    robot = { ...depart };
    programme = [];
    niveauEl.textContent = niveau + 1;
    afficherMessage(messageEl, "");
    dessinerGrille();
    dessinerProgramme();
  }

  function dessinerGrille() {
    grilleEl.innerHTML = "";
    carte.forEach((ligne, l) =>
      ligne.forEach((c, col) => {
        const caseEl = document.createElement("div");
        caseEl.className = "case" + (c === "#" ? " mur" : "");
        if (robot.l === l && robot.c === col) caseEl.textContent = "🤖";
        else if (etoile.l === l && etoile.c === col) caseEl.textContent = "⭐";
        else if (c === "#") caseEl.textContent = "🧱";
        grilleEl.appendChild(caseEl);
      })
    );
  }

  function dessinerProgramme(courante = -1) {
    if (programme.length === 0) {
      programmeEl.innerHTML = '<span class="vide">Clique sur les flèches…</span>';
      return;
    }
    programmeEl.innerHTML = programme
      .map((cmd, i) => `<span class="etape${i === courante ? " courante" : ""}">${directions[cmd].icone}</span>`)
      .join("");
  }

  document.querySelectorAll(".cmd").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (enCours || programme.length >= MAX_INSTRUCTIONS) return;
      programme.push(btn.dataset.cmd);
      dessinerProgramme();
    });
  });

  document.getElementById("robot-effacer").addEventListener("click", () => {
    if (enCours) return;
    programme = [];
    robot = { ...depart };
    afficherMessage(messageEl, "");
    dessinerGrille();
    dessinerProgramme();
  });

  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  btnLancer.addEventListener("click", async () => {
    if (enCours || programme.length === 0) return;
    enCours = true;
    btnLancer.disabled = true;
    robot = { ...depart };
    afficherMessage(messageEl, "Le robot exécute ton programme…");
    dessinerGrille();

    let probleme = null;
    for (let i = 0; i < programme.length; i++) {
      dessinerProgramme(i);
      await pause(400);
      const d = directions[programme[i]];
      const l = robot.l + d.dl;
      const c = robot.c + d.dc;
      if (l < 0 || l >= carte.length || c < 0 || c >= carte[0].length) {
        probleme = "Oups, le robot est sorti de la grille ! 🐛 Trouve le bug et réessaie.";
        break;
      }
      if (carte[l][c] === "#") {
        probleme = "Bong ! Le robot s'est cogné dans un mur. 🐛 Corrige ton programme.";
        break;
      }
      robot = { l, c };
      dessinerGrille();
    }
    dessinerProgramme();

    if (probleme) {
      afficherMessage(messageEl, probleme, "oups");
    } else if (robot.l === etoile.l && robot.c === etoile.c) {
      if (niveau < niveaux.length - 1) {
        afficherMessage(messageEl, "Bravo, étoile attrapée ! ⭐ Niveau suivant…", "bravo");
        await pause(1500);
        niveau++;
        chargerNiveau();
      } else {
        afficherMessage(messageEl, "Incroyable, tu as fini tous les niveaux ! 🏆 Tu es un vrai programmeur.", "bravo");
      }
    } else {
      afficherMessage(messageEl, "Le programme est fini, mais le robot n'est pas sur l'étoile. Encore un effort !", "oups");
    }
    enCours = false;
    btnLancer.disabled = false;
  });

  chargerNiveau();
})();

/* ==========================================================
   Jeu 3 : dessine avec des nombres
   ========================================================== */
(function jeuPixels() {
  const TAILLE = 8;
  const grilleEl = document.getElementById("pixels-grille");
  const codeEl = document.getElementById("pixels-code");
  const pixels = Array.from({ length: TAILLE }, () => Array(TAILLE).fill(0));
  const modele = [
    "01100110",
    "11111111",
    "11111111",
    "11111111",
    "01111110",
    "00111100",
    "00011000",
    "00000000",
  ];

  const boutons = [];
  for (let l = 0; l < TAILLE; l++) {
    for (let c = 0; c < TAILLE; c++) {
      const b = document.createElement("button");
      b.className = "pixel";
      b.setAttribute("aria-label", `Pixel ligne ${l + 1}, colonne ${c + 1}`);
      b.addEventListener("click", () => {
        pixels[l][c] = pixels[l][c] ? 0 : 1;
        rafraichir();
      });
      grilleEl.appendChild(b);
      boutons.push(b);
    }
  }

  function rafraichir() {
    pixels.forEach((ligne, l) =>
      ligne.forEach((v, c) => boutons[l * TAILLE + c].classList.toggle("allume", v === 1))
    );
    codeEl.textContent = pixels.map((ligne) => ligne.join("")).join("\n");
  }

  document.getElementById("pixels-effacer").addEventListener("click", () => {
    pixels.forEach((ligne) => ligne.fill(0));
    rafraichir();
  });
  document.getElementById("pixels-modele").addEventListener("click", () => {
    modele.forEach((ligne, l) => ligne.split("").forEach((v, c) => (pixels[l][c] = Number(v))));
    rafraichir();
  });

  rafraichir();
})();

/* ==========================================================
   Formulaire de pré-inscription (démo, pas encore d'envoi réel)
   ========================================================== */
document.getElementById("form-inscription").addEventListener("submit", (e) => {
  e.preventDefault();
  const prenom = e.target.prenom.value.trim();
  afficherMessage(
    document.getElementById("form-message"),
    `Merci ! La demande pour ${prenom} est bien notée. (Démo : l'envoi réel reste à brancher.)`,
    "bravo"
  );
  e.target.reset();
});
