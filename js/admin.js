/* ==========================================================
   Espace animateur — Clic & Avenir

   ⚠️ Le mot de passe protège l'accès sur ce site simple, sans serveur.
   Ce n'est pas une sécurité forte : une personne qui s'y connaît
   pourrait lire les résultats directement dans le navigateur.

   Pour changer le mot de passe : calcule l'empreinte SHA-256 du nouveau
   mot de passe (ex. sur un site « SHA-256 generator ») et remplace la
   valeur ci-dessous. Mot de passe par défaut : animateur2026
   ========================================================== */
const EMPREINTE_MDP = "dcd762a954274d7a4bb898f9800007c60f01716bed2e9e4e87b7f2198cf28903";
const CLE_SESSION = "clic-avenir-admin";

const connexion = document.getElementById("connexion");
const tableau = document.getElementById("tableau");

async function empreinte(texte) {
  const octets = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(octets)].map((o) => o.toString(16).padStart(2, "0")).join("");
}

function estConnecte() {
  try { return sessionStorage.getItem(CLE_SESSION) === "1"; } catch (e) { return false; }
}
function afficherEspace() {
  const ok = estConnecte();
  connexion.hidden = ok;
  tableau.hidden = !ok;
  if (ok) rafraichir();
}

document.getElementById("form-connexion").addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = document.getElementById("connexion-message");
  if (!window.crypto || !crypto.subtle) {
    message.textContent = "Ce navigateur ne permet pas la connexion. Essaie avec Chrome, Edge ou Firefox récent.";
    message.className = "message oups";
    return;
  }
  if ((await empreinte(e.target.mdp.value)) === EMPREINTE_MDP) {
    try { sessionStorage.setItem(CLE_SESSION, "1"); } catch (err) { /* session non mémorisée */ }
    e.target.reset();
    message.textContent = "";
    connexion.hidden = true;
    tableau.hidden = false;
    rafraichir();
  } else {
    message.textContent = "Mot de passe incorrect.";
    message.className = "message oups";
  }
});

document.getElementById("deconnexion").addEventListener("click", () => {
  try { sessionStorage.removeItem(CLE_SESSION); } catch (e) { /* rien */ }
  afficherEspace();
});

/* ---------- Filtres ---------- */
const filtreNom = document.getElementById("filtre-nom");
const filtreJeu = document.getElementById("filtre-jeu");
Object.entries(NOMS_JEUX).forEach(([cle, nom]) => filtreJeu.add(new Option(nom, cle)));
filtreNom.addEventListener("input", rafraichir);
filtreJeu.addEventListener("change", rafraichir);

const normaliser = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function resultatsFiltres() {
  const nom = normaliser(filtreNom.value);
  return Resultats.liste().filter((r) =>
    (!filtreJeu.value || r.jeu === filtreJeu.value) && (!nom || normaliser(r.nom).includes(nom)));
}

/* ---------- Affichage ---------- */
const formatDate = (iso) =>
  new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/* Taux de réussite d'une partie (de 0 à 1) */
function reussite(r) {
  if (r.jeu === "lettre") return r.essais <= 1 ? 1 : r.essais <= 3 ? 0.6 : 0.3;
  return r.total ? r.points / r.total : 0;
}
function note(r) {
  const t = reussite(r);
  const classe = t >= 0.8 ? "bon" : t >= 0.5 ? "moyen" : "faible";
  const texte = r.jeu === "lettre" ? `Réussie en ${r.essais} essai${r.essais > 1 ? "s" : ""}` : `${r.points} / ${r.total}`;
  return `<span class="note ${classe}">${texte}</span>`;
}

function detail(r) {
  if (r.jeu === "lettre") {
    return `<ol>${(r.tentatives || []).map((n, i) =>
      `<li><span class="${n === r.total ? "juste" : "faux"}">Essai ${i + 1} : ${n} / ${r.total} blocs bien placés</span></li>`).join("")}</ol>`;
  }
  return `<ol>${(r.reponses || []).map((rep) => `
    <li>
      <div class="q">${echapper(rep.question)}</div>
      <p class="rep ${rep.juste ? "juste" : "faux"}">${rep.juste ? "✅" : "❌"} Réponse : ${echapper(rep.choisie)}</p>
      ${rep.juste ? "" : `<p class="rep">Bonne réponse : ${echapper(rep.bonne)}</p>`}
    </li>`).join("")}</ol>`;
}

function rafraichir() {
  const liste = resultatsFiltres();

  // Chiffres clés
  const joueurs = new Set(liste.map((r) => normaliser(r.nom)));
  const moyenne = liste.length ? Math.round((liste.reduce((s, r) => s + reussite(r), 0) / liste.length) * 100) : 0;
  const aujourdHui = new Date().toDateString();
  const duJour = liste.filter((r) => new Date(r.date).toDateString() === aujourdHui).length;
  document.getElementById("chiffres").innerHTML = `
    <div class="chiffre"><strong>${joueurs.size}</strong><span>joueur${joueurs.size > 1 ? "s" : ""}</span></div>
    <div class="chiffre"><strong>${liste.length}</strong><span>partie${liste.length > 1 ? "s" : ""} jouée${liste.length > 1 ? "s" : ""}</span></div>
    <div class="chiffre"><strong>${duJour}</strong><span>aujourd'hui</span></div>
    <div class="chiffre"><strong>${moyenne} %</strong><span>de réussite moyenne</span></div>`;

  // Questions les plus ratées (utile pour savoir quoi réexpliquer)
  const stats = {};
  liste.forEach((r) => (r.reponses || []).forEach((rep) => {
    const s = (stats[rep.question] ||= { question: rep.question, jeu: r.jeu, ratees: 0, total: 0 });
    s.total++;
    if (!rep.juste) s.ratees++;
  }));
  const ratees = Object.values(stats).filter((s) => s.ratees).sort((a, b) => b.ratees / b.total - a.ratees / a.total).slice(0, 5);
  document.getElementById("questions-ratees").innerHTML = ratees.length ? `
    <div class="ratees">
      <h2>🎯 Questions les plus ratées</h2>
      <ol>${ratees.map((s) => `
        <li>${echapper(s.question)} <em>(${NOMS_JEUX[s.jeu]})</em> —
          <span class="taux">${Math.round((s.ratees / s.total) * 100)} % d'erreurs</span> (${s.ratees}/${s.total})</li>`).join("")}
      </ol>
    </div>` : "";

  // Une carte par joueur, parties les plus récentes en premier
  const parJoueur = new Map();
  liste.forEach((r) => {
    const cle = normaliser(r.nom);
    if (!parJoueur.has(cle)) parJoueur.set(cle, { nom: r.nom, parties: [] });
    parJoueur.get(cle).parties.push(r);
  });
  const cartes = [...parJoueur.values()].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const zone = document.getElementById("joueurs");

  if (!cartes.length) {
    zone.innerHTML = `<p class="vide-admin">${Resultats.liste().length ? "Aucun résultat ne correspond à ta recherche." : "Aucun résultat pour l'instant. Les parties jouées sur cet ordinateur apparaîtront ici."}</p>`;
    return;
  }
  zone.innerHTML = cartes.map((j) => `
    <article class="joueur-carte">
      <h2>👤 ${echapper(j.nom)} <small>${j.parties.length} partie${j.parties.length > 1 ? "s" : ""}</small></h2>
      ${j.parties.sort((a, b) => b.date.localeCompare(a.date)).map((r) => `
        <details class="partie">
          <summary>
            <span class="date">${formatDate(r.date)}</span>
            <span class="jeu-nom">${NOMS_JEUX[r.jeu] || r.jeu}</span>
            ${note(r)}
          </summary>
          <div class="detail">
            ${detail(r)}
            <div class="actions-partie"><button class="lien danger" data-supprimer="${echapper(r.id)}">Supprimer cette partie</button></div>
          </div>
        </details>`).join("")}
    </article>`).join("");
}

document.getElementById("joueurs").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-supprimer]");
  if (!btn || !confirm("Supprimer cette partie ?")) return;
  Resultats.supprimer([btn.dataset.supprimer]);
  rafraichir();
});

document.getElementById("tout-effacer").addEventListener("click", () => {
  if (!confirm("Effacer TOUS les résultats de cet ordinateur ? Pense à exporter avant si tu veux les garder.")) return;
  Resultats.toutEffacer();
  rafraichir();
});

/* ---------- Export Excel (.xlsx) : 4 onglets ---------- */
document.getElementById("exporter").addEventListener("click", () => {
  const liste = resultatsFiltres().sort((a, b) => a.date.localeCompare(b.date));
  if (!liste.length) { alert("Aucun résultat à exporter."); return; }
  const nomJeu = (r) => (NOMS_JEUX[r.jeu] || r.jeu).replace(/^\S+\s/, ""); // sans l'emoji
  const ouiNon = (ok) => ({ v: ok ? "oui" : "non", style: ok ? "oui" : "non" });

  // 1. Une ligne par partie
  const parties = liste.map((r) => [
    formatDate(r.date), { v: r.nom, style: "gras" }, nomJeu(r),
    r.jeu === "lettre" ? `Réussie en ${r.essais} essai(s)` : `${r.points} / ${r.total}`,
    r.jeu === "lettre" ? "" : r.points,
    r.total,
    r.jeu === "lettre" ? r.essais : "",
    { v: reussite(r), style: "pourcent" },
  ]);

  // 2. Une ligne par réponse (ou par essai pour la lettre)
  const reponses = [];
  liste.forEach((r) => {
    const base = [formatDate(r.date), { v: r.nom, style: "gras" }, nomJeu(r)];
    if (r.jeu === "lettre") {
      (r.tentatives || []).forEach((n, i) =>
        reponses.push([...base, `Essai ${i + 1}`, `${n} / ${r.total} blocs bien placés`, `${r.total} / ${r.total}`, ouiNon(n === r.total)]));
    } else {
      (r.reponses || []).forEach((rep) =>
        reponses.push([...base, rep.question, rep.choisie, rep.bonne, ouiNon(rep.juste)]));
    }
  });

  // 3. Bilan par joueur
  const joueurs = new Map();
  liste.forEach((r) => {
    const cle = normaliser(r.nom);
    if (!joueurs.has(cle)) joueurs.set(cle, { nom: r.nom, parties: [] });
    joueurs.get(cle).parties.push(r);
  });
  const parJoueur = [...joueurs.values()].sort((a, b) => a.nom.localeCompare(b.nom, "fr")).map((j) => {
    const meilleur = (jeu) => {
      const p = j.parties.filter((r) => r.jeu === jeu);
      return p.length ? { v: Math.max(...p.map(reussite)), style: "pourcent" } : "";
    };
    return [
      { v: j.nom, style: "gras" }, j.parties.length,
      { v: j.parties.reduce((s, r) => s + reussite(r), 0) / j.parties.length, style: "pourcent" },
      ...Object.keys(NOMS_JEUX).map(meilleur),
      formatDate(j.parties[j.parties.length - 1].date),
    ];
  });

  // 4. Statistiques par question
  const stats = new Map();
  liste.forEach((r) => (r.reponses || []).forEach((rep) => {
    if (!stats.has(rep.question)) stats.set(rep.question, { jeu: nomJeu(r), question: rep.question, bonne: rep.bonne, total: 0, erreurs: 0 });
    const s = stats.get(rep.question);
    s.total++;
    if (!rep.juste) s.erreurs++;
  }));
  const questions = [...stats.values()].sort((a, b) => b.erreurs / b.total - a.erreurs / a.total).map((s) => [
    s.jeu, s.question, s.bonne, s.total, s.erreurs, { v: s.erreurs / s.total, style: s.erreurs / s.total >= 0.5 ? "alerte" : "pourcent" },
  ]);

  const fichier = creerExcel([
    { nom: "Parties", lignes: parties, colonnes: [
      { titre: "Date", largeur: 17 }, { titre: "Joueur", largeur: 18 }, { titre: "Jeu", largeur: 22 },
      { titre: "Résultat", largeur: 22 }, { titre: "Bonnes réponses", largeur: 16 }, { titre: "Nb questions / blocs", largeur: 20 },
      { titre: "Essais (lettre)", largeur: 15 }, { titre: "Réussite", largeur: 11 } ] },
    { nom: "Détail des réponses", lignes: reponses, colonnes: [
      { titre: "Date", largeur: 17 }, { titre: "Joueur", largeur: 18 }, { titre: "Jeu", largeur: 22 },
      { titre: "Question", largeur: 55 }, { titre: "Réponse donnée", largeur: 40 }, { titre: "Bonne réponse", largeur: 40 },
      { titre: "Juste ?", largeur: 9 } ] },
    { nom: "Par joueur", lignes: parJoueur, colonnes: [
      { titre: "Joueur", largeur: 18 }, { titre: "Parties", largeur: 9 }, { titre: "Réussite moyenne", largeur: 17 },
      ...Object.values(NOMS_JEUX).map((n) => ({ titre: "Meilleur : " + n.replace(/^\S+\s/, ""), largeur: 20 })),
      { titre: "Dernière partie", largeur: 17 } ] },
    { nom: "Questions", lignes: questions, colonnes: [
      { titre: "Jeu", largeur: 22 }, { titre: "Question", largeur: 60 }, { titre: "Bonne réponse", largeur: 40 },
      { titre: "Nb réponses", largeur: 12 }, { titre: "Nb erreurs", largeur: 11 }, { titre: "% d'erreurs", largeur: 12 } ] },
  ]);

  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(fichier);
  lien.download = `resultats-clic-avenir-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
});

afficherEspace();
