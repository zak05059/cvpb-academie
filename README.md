# CVPB Académie — Application de gestion des formations

Application web installable (PWA), branchée sur **CVPB Manager** (même projet Firebase `cvpb-gestion-001`).

## Ce qui vient de CVPB Manager (rien à ressaisir)
| Donnée | Collection CVPB Manager | Utilisation dans l'Académie |
|---|---|---|
| Liste des étudiants | `etudiants` | **Seul un étudiant « Actif » de cette liste peut être inscrit à l'Académie et se connecter.** S'il passe « Inactif » ou est supprimé, l'accès est coupé immédiatement. |
| Comptes du personnel | `users` (rôle + rolesSup) | Le rôle CVPB Manager donne l'espace Académie (voir tableau ci-dessous). |
| Paiements | `encaissements` | Lecture seule : T-shirt, cotisations, reste à payer de chaque étudiant. |

L'Académie écrit uniquement dans ses propres collections, toutes préfixées `aca_` : elle ne modifie jamais les données de CVPB Manager.

## Rôles
| Rôle CVPB Manager | Espace Académie |
|---|---|
| Présidence (e-mail du Président) | Président — tout |
| vicepresident | Vice-président — tout en lecture |
| secretaire | Secrétaire général — apprenants, calendrier, annonces ; pas de finances |
| formation | Responsable Formation |
| accompagnement | Responsable Suivi & Accompagnement |
| pedagogie | Formateur — appel et notes de SES formations |
| encaissement | Responsable des encaissements — situation financière, relances |
| caisse / tresorerie | Responsable de la caisse — situation financière (lecture) |
| tuteur, délégué, membre… | Pas d'accès |

## Inscrire un étudiant à l'Académie
Apprenants → **Inscrire un étudiant** → choisir l'étudiant dans la liste CVPB Manager → saisir son e-mail UVCI → cocher ses formations.
Un étudiant absent de la liste (ou « Inactif ») ne peut ni être inscrit ni se connecter : c'est vérifié par l'application **et** par les règles du serveur.

## Mise en ligne (depuis le téléphone)
1. **Règles Firestore** : Firebase → Firestore → Règles. Collez le contenu de `firestore.rules` **juste avant les deux dernières `}`** du fichier existant (ne remplacez rien), puis **Publier**. Ajoutez le même bloc à la fin de `regles-firestore.txt` de CVPB Manager pour ne pas le perdre à la prochaine mise à jour.
2. **config.js** : collez la configuration Firebase de CVPB Manager (celle de son `firebase-config.js`).
3. **GitHub** : nouveau dépôt `cvpb-academie` → téléverser tous les fichiers → Settings → Pages → main / racine.
   Le domaine `zak05059.github.io` est déjà autorisé dans Firebase (utilisé par CVPB Manager).
4. Ouvrir `https://zak05059.github.io/cvpb-academie/`, se connecter avec le compte du Président.
5. **Paramètres** : vérifier T-shirt, cotisation, premier mois (M1) et dernier mois — identiques à CVPB Manager.
6. **Formations** → créer le catalogue Académie et affecter les formateurs (comptes « pedagogie »).
7. **Apprenants** → inscrire les étudiants.

## Règles de gestion
- Assiduité = (Présences + Retards) ÷ (Présences + Retards + Absences non justifiées). Seuil d'alerte : 75 % (paramétrable).
- Moyenne par formation = moyenne pondérée des exercices ramenés sur 20.
- Paiements calculés comme CVPB Manager : l'inscription paie d'abord le T-shirt, le reste va aux cotisations ; les cotisations sont affectées au plus ancien mois non soldé ; les encaissements annulés sont ignorés.
- L'étudiant reçoit une notification pour chaque paiement enregistré dans CVPB Manager, chaque note, absence/retard, séance, sanction et annonce.
