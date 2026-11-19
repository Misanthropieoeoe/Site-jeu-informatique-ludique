/* ==========================================================
   Résultats des joueurs — partagé entre le site et l'espace admin.
   Les résultats sont toujours gardés dans le navigateur de l'ordinateur utilisé.
   Si le site est ouvert depuis le serveur de salle (poste animateur),
   chaque résultat lui est AUSSI envoyé automatiquement.
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
    resultat.poste = Salle.poste();
    this.enregistrer([...this.liste(), resultat]);
    Salle.envoyer(resultat);
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

/* ==========================================================
   Mode salle : envoi des résultats au poste animateur
   ========================================================== */
const Salle = {
  CLE_ATTENTE: "clic-avenir-a-envoyer",
  CLE_POSTE: "clic-avenir-poste",

  /* Le site est-il ouvert depuis le serveur de salle (http://…) ? */
  active: location.protocol === "http:" || location.protocol === "https:",

  /* Numéro du poste : donné une fois dans l'adresse (…/?poste=3), puis mémorisé */
  poste() {
    try {
      const param = new URLSearchParams(location.search).get("poste");
      if (param) localStorage.setItem(this.CLE_POSTE, param.slice(0, 20));
      return localStorage.getItem(this.CLE_POSTE) || "";
    } catch (e) { return ""; }
  },

  attente() {
    try { return JSON.parse(localStorage.getItem(this.CLE_ATTENTE)) || []; } catch (e) { return []; }
  },
  memoriserAttente(liste) {
    try { localStorage.setItem(this.CLE_ATTENTE, JSON.stringify(liste.slice(-500))); } catch (e) { /* rien */ }
  },

  async envoyer(resultat) {
    if (!this.active) return;
    this.memoriserAttente([...this.attente(), resultat]);
    await this.viderAttente();
  },

  /* Envoie les résultats en attente (ex. si le wifi a coupé) */
  async viderAttente() {
    if (!this.active || this.envoiEnCours) return;
    this.envoiEnCours = true;
    try {
      for (const r of this.attente()) {
        const rep = await fetch("/api/resultats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(r),
        });
        if (!rep.ok && rep.status !== 400) break;      // serveur injoignable : on réessaiera
        this.memoriserAttente(this.attente().filter((x) => x.id !== r.id));
      }
    } catch (e) {
      /* pas de réseau : on réessaiera plus tard */
    } finally {
      this.envoiEnCours = false;
    }
  },
};

Salle.poste();                                   // mémorise ?poste=… dès l'ouverture
Salle.viderAttente();
setInterval(() => Salle.viderAttente(), 30000);  // nouvel essai toutes les 30 s
