/* ==========================================================
   Mini-générateur de fichiers Excel (.xlsx), sans librairie externe.
   Fonctionne hors connexion.

   creerExcel([
     { nom: "Feuille", colonnes: [{ titre: "Nom", largeur: 20 }, …],
       lignes: [["Sarah", 12, { v: 0.8, style: "pourcent" }, { v: "oui", style: "oui" }], …] },
   ]) → Blob
   Styles de cellule : "pourcent", "alerte" (pourcentage sur fond rouge),
   "oui" (fond vert), "non" (fond rouge), "gras".
   ========================================================== */
(function () {
  const STYLES = { entete: 1, pourcent: 2, oui: 3, non: 4, gras: 5, alerte: 6 };

  const xml = (t) =>
    String(t ?? "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const lettreColonne = (i) => {
    let s = "";
    for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
    return s;
  };

  function cellule(valeur, ref, styleForce) {
    const objet = valeur !== null && typeof valeur === "object";
    const v = objet ? valeur.v : valeur;
    const style = styleForce ?? (objet && valeur.style ? STYLES[valeur.style] : 0);
    const s = style ? ` s="${style}"` : "";
    if (v === null || v === undefined || v === "") return style ? `<c r="${ref}"${s}/>` : "";
    if (typeof v === "number" && isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`;
    return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
  }

  function feuilleXml({ colonnes, lignes }) {
    const derniere = lettreColonne(colonnes.length - 1);
    const tete = `<row r="1">${colonnes.map((c, i) => cellule(c.titre, lettreColonne(i) + 1, STYLES.entete)).join("")}</row>`;
    const corps = lignes.map((ligne, l) =>
      `<row r="${l + 2}">${ligne.map((v, i) => cellule(v, lettreColonne(i) + (l + 2))).join("")}</row>`).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${colonnes.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.largeur || 15}" customWidth="1"/>`).join("")}</cols>
<sheetData>${tete}${corps}</sheetData>
<autoFilter ref="A1:${derniere}${lignes.length + 1}"/>
</worksheet>`;
  }

  const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><name val="Calibri"/></font>
</fonts>
<fills count="5">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF6C4CF5"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFD8F6EE"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFE1EA"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="7">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="9" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="0" xfId="0" applyFill="1"><alignment vertical="top"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="9" fontId="2" fillId="4" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1"><alignment vertical="top"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  function fichiers(feuilles) {
    const nomFeuille = (n) => xml(String(n).replace(/[\\/?*[\]:]/g, " ").slice(0, 31));
    const f = {
      "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${feuilles.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("\n")}
</Types>`,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
      "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${feuilles.map((s, i) => `<sheet name="${nomFeuille(s.nom)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>
<definedNames>${feuilles.map((s, i) => `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${nomFeuille(s.nom).replace(/'/g, "''")}'!$A$1:$${lettreColonne(s.colonnes.length - 1)}$${s.lignes.length + 1}</definedName>`).join("")}</definedNames>
</workbook>`,
      "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${feuilles.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("\n")}
<Relationship Id="rId${feuilles.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
      "xl/styles.xml": STYLES_XML,
    };
    feuilles.forEach((s, i) => (f[`xl/worksheets/sheet${i + 1}.xml`] = feuilleXml(s)));
    return f;
  }

  /* ---------- Archive ZIP (sans compression) ---------- */
  const TABLE_CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (octets) => {
    let c = 0xffffffff;
    for (let i = 0; i < octets.length; i++) c = TABLE_CRC[(c ^ octets[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };

  function zip(contenus) {
    const enc = new TextEncoder();
    const morceaux = [];
    const central = [];
    let decalage = 0;
    const entete = (taille) => { const b = new DataView(new ArrayBuffer(taille)); return b; };

    Object.entries(contenus).forEach(([nom, texte]) => {
      const nomOctets = enc.encode(nom);
      const donnees = enc.encode(texte);
      const crc = crc32(donnees);

      const local = entete(30);
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(8, 0, true);           // pas de compression
      local.setUint16(12, 0x21, true);       // date DOS fixe (1980-01-01)
      local.setUint32(14, crc, true);
      local.setUint32(18, donnees.length, true);
      local.setUint32(22, donnees.length, true);
      local.setUint16(26, nomOctets.length, true);
      morceaux.push(local.buffer, nomOctets, donnees);

      const c = entete(46);
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, 20, true);
      c.setUint16(6, 20, true);
      c.setUint16(14, 0x21, true);
      c.setUint32(16, crc, true);
      c.setUint32(20, donnees.length, true);
      c.setUint32(24, donnees.length, true);
      c.setUint16(28, nomOctets.length, true);
      c.setUint32(42, decalage, true);
      central.push(c.buffer, nomOctets);

      decalage += 30 + nomOctets.length + donnees.length;
    });

    const tailleCentral = central.reduce((s, b) => s + b.byteLength, 0);
    const fin = entete(22);
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, Object.keys(contenus).length, true);
    fin.setUint16(10, Object.keys(contenus).length, true);
    fin.setUint32(12, tailleCentral, true);
    fin.setUint32(16, decalage, true);
    return new Blob([...morceaux, ...central, fin.buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  window.creerExcel = (feuilles) => zip(fichiers(feuilles));
})();
