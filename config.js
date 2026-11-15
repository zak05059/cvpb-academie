// ============================================================
//  CVPB ACADÉMIE — FICHIER DE CONFIGURATION
//  C'est le SEUL fichier à modifier pour mettre l'application en ligne.
// ============================================================

export default {
  // 1) Collez ici la configuration Firebase de CVPB MANAGER (projet cvpb-gestion-001) :
  //    copiez exactement le bloc de firebase-config.js de CVPB Manager.
  //    L'Académie DOIT utiliser le même projet pour lire la liste des étudiants,
  //    les comptes du personnel et le registre d'encaissement.
  //    Tant que apiKey vaut "A_REMPLACER", l'application tourne en MODE DÉMO
  //    (données fictives stockées sur le téléphone, aucun envoi en ligne).
  firebase: {
    apiKey: "AIzaSyAKX7yyLiZc5ffBSHK0r3uAsYDUmuuZm4o",
    authDomain: "cvpb-gestion-001.firebaseapp.com",
    projectId: "cvpb-gestion-001",
    storageBucket: "cvpb-gestion-001.firebasestorage.app",
    messagingSenderId: "359098791087",
    appId: "1:359098791087:web:2c9aa6200e912046b4905a"
  },

  // 2) Domaine autorisé : seuls les comptes Google de ce domaine peuvent se connecter.
  allowedDomain: "uvci.edu.ci",

  // 3) Compte(s) du Président : accès total + gestion des accès.
  //    Doit être identique à la liste présente dans firestore.rules.
  superAdmins: ["zakaria.ouedraogo@uvci.edu.ci"],

  // 4) Identité
  appName: "CVPB Académie",
  slogan: "Renforce tes compétences, complète ton parcours."
};
