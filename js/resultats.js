/* ==========================================================
   Résultats des joueurs — partagé entre le site et l'espace admin.
   Les résultats sont gardés dans le navigateur de l'ordinateur utilisé.
   ========================================================== */
const NOMS_JEUX = {
  cv: "📄 Quiz du CV",
  mail: "📧 Quiz du mail pro",
  lettre: "✍️ Lettre de motivation",
  reseaux: "📱 Réseaux sociaux",
  culture: "🎨 Beaux-arts",
};

const Resultats = {
  CLE: "clic-avenir-resultats",
  CLE_NOM: "clic-avenir-joueur",
  MAX: 2000,

  liste() {
    try { return JSON.parse(localStorage.getItem(this.CLE)) || []; } catch (e) { return []; }
  },
  enregistrer(liste) {
    try { localStorage.setItem(this.CLE, JSON.stringify(liste.slice(-this.MAX))); } catch (e) { /* stockage plein ou bloqué */ }
  },
  ajouter(resultat) {
    this.enregistrer([...this.liste(), resultat]);
  },
  supprimer(ids) {
    const aRetirer = new Set(ids);
    this.enregistrer(this.liste().filter((r) => !aRetirer.has(r.id)));
  },
  toutEffacer() {
    try { localStorage.removeItem(this.CLE); } catch (e) { /* rien à faire */ }
  },
  dernierNom() {
    try { return localStorage.getItem(this.CLE_NOM) || ""; } catch (e) { return ""; }
  },
  memoriserNom(nom) {
    try { localStorage.setItem(this.CLE_NOM, nom); } catch (e) { /* rien à faire */ }
  },
};

const echapper = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
