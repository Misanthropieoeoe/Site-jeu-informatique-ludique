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

/* ---------- Export CSV (s'ouvre dans Excel) : une ligne par réponse ---------- */
document.getElementById("exporter").addEventListener("click", () => {
  const cellule = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lignes = [["Date", "Joueur", "Jeu", "Résultat", "Question / essai", "Réponse donnée", "Bonne réponse", "Juste ?"]];
  resultatsFiltres().forEach((r) => {
    const base = [formatDate(r.date), r.nom, (NOMS_JEUX[r.jeu] || r.jeu).replace(/^\S+\s/, "")];
    if (r.jeu === "lettre") {
      (r.tentatives || []).forEach((n, i) =>
        lignes.push([...base, `${r.essais} essai(s)`, `Essai ${i + 1}`, `${n}/${r.total} blocs bien placés`, "", n === r.total ? "oui" : "non"]));
    } else {
      (r.reponses || []).forEach((rep) =>
        lignes.push([...base, `${r.points}/${r.total}`, rep.question, rep.choisie, rep.bonne, rep.juste ? "oui" : "non"]));
    }
  });
  const csv = "﻿" + lignes.map((l) => l.map(cellule).join(";")).join("\r\n");
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  lien.download = `resultats-clic-avenir-${new Date().toISOString().slice(0, 10)}.csv`;
  lien.click();
  URL.revokeObjectURL(lien.href);
});

afficherEspace();
