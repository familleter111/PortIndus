# Projet TTEI — Scénario de démonstration

> Prototype front-end de pilotage de projets APQP automobile.
> Aucun backend, aucune base de données, aucune API : toutes les données sont
> figées dans `src/lib/data.ts` et proviennent de `data_file.xlsx`.

---

## 1. Le problème métier

Un équipementier automobile lance plusieurs projets en parallèle pour ses
donneurs d'ordre (OEM Alpha, Beta, Gamma). Chaque projet suit la méthodologie
**APQP** : six portes de validation, de G0 (lancement du programme) à G5 (SOP,
démarrage série). À chaque porte, des livrables doivent être prêts — DFMEA,
PFMEA, plan de contrôle, dossier PPAP.

Trois questions reviennent en permanence :

1. **Est-ce qu'on tiendra la date SOP ?** L'avancement réel décroche-t-il du plan ?
2. **A-t-on les ressources ?** La fonction Qualité est-elle en surcharge ?
3. **Les preuves sont-elles là ?** Une action déclarée « terminée » sans document
   justificatif ne vaut rien lors d'un audit client.

L'application répond à ces trois questions, du portefeuille jusqu'à la preuve
PDF.

---

## 2. Le jeu de données

La démonstration tourne autour d'une **date de statut figée : 15/12/2026**.

| Projet | Client | Chef de projet | Phase | SOP | Réel / Plan | SPI | Santé |
|---|---|---|---|---|---|---|---|
| P-DEMO-001 Carter aluminium e-Drive | OEM Alpha | Leïla Mansour | Process Design | 05/07/2027 | 42 % / 48 % | 0,875 | 🟠 Orange |
| P-DEMO-002 Armature siège avant | OEM Beta | Hatem Ben Ali | Validation | 31/03/2027 | 69 % / 66 % | 1,045 | 🟢 Vert |
| P-DEMO-003 Support batterie EV | OEM Gamma | Sarra Khelifi | Product Design | 30/09/2027 | 26 % / 35 % | 0,743 | 🔴 Rouge |

Le fil rouge de la démo est **P-DEMO-001**, un projet orange : il avance moins
vite que prévu, sa porte G3 dérive de **+14 jours**, et sa fonction Qualité est
chargée à **112 %** de sa capacité.

Deux personnes portent l'histoire : **Noura Trabelsi** (pilote Qualité,
surchargée) et **Youssef Jaziri** (industrialisation).

---

## 3. Les rôles

Le bandeau supérieur affiche le rôle en cours. Il change selon l'écran :

- **Portfolio Manager** — vision consolidée, arbitrages inter-projets.
- **Chef de projet** — pilotage d'un projet, création, replanification.
- **Membre de l'équipe projet** — déclaration d'avancement et dépôt de preuves.

⚠️ C'est un **affichage**, pas une sécurité. Aucun droit n'est réellement
appliqué : n'importe qui peut ouvrir n'importe quel écran. Dans un produit réel,
ces rôles seraient contrôlés côté serveur.

---

## 4. L'histoire, écran par écran

### Acte I — Le constat

#### 🖥️ Écran 1 · Vue globale portefeuille projets `/portefeuille`

*Le Portfolio Manager arrive le matin du 15 décembre.*

Huit indicateurs en haut donnent la température : le portefeuille avance à
**41,9 %** au lieu des **47,0 %** prévus, le SPI global est à **0,893**, il y a
**1 projet rouge** et **6 actions en retard**. Le dernier indicateur affiche la
décision suggérée : **« Renforcer Qualité »**.

Trois blocs approfondissent :

- **Avancement par projet** — pour chaque projet, une barre bleue (planifié) et
  une barre dorée (réel). On voit immédiatement que P-DEMO-001 et P-DEMO-003
  sont en dessous du plan, et que P-DEMO-002 est en avance.
- **Santé portefeuille** — un anneau : 1 vert, 1 orange, 1 rouge.
- **Charge / Capacité par fonction** — un tableau où **Qualité ressort à 121 %**
  en rouge, tout le reste étant sous les 100 %. Le total du portefeuille est à
  92 % : ce n'est pas un problème global, c'est un **goulot d'étranglement sur
  une seule fonction**.

En bas, le tableau des trois projets détaille 14 colonnes : client, chef de
projet, phase, SOP, charge, planifié/réel, SPI, actions en retard, readiness,
charge Qualité, santé et prochaine gate.

**Ce que l'utilisateur peut faire :** cliquer « Voir le détail projet » (→ écran 2),
« Nouveau projet » (→ écran 4), « Voir surcharge capacité » ou « Analyser charge »
(→ écran 7), « Analyser exécution » (→ écran 3).

---

#### 🖥️ Écran 2 · Vue projet — Dashboard chef de projet `/projet`

*Le manager ouvre P-DEMO-001 pour comprendre.*

L'identité du projet est rappelée en bandeau, puis un second bandeau ambré
concentre le sujet : **prochaine gate G3 — Process Freeze**, baseline
**05/02/2027**, forecast **19/02/2027**, dérive **+14 jours**, readiness **58 %**.

Huit indicateurs projet : avancement réel 41 % contre 50,6 % planifié, SPI 0,81,
1 action en retard, 33 % de livrables approuvés, 3 actions critiques ouvertes,
charge Qualité 112 %, santé orange.

Puis quatre analyses :

- **Courbe en S** — le planifié (bleu pointillé) monte régulièrement jusqu'à
  100 %, le réel (orange) décroche à partir de juin et plafonne à 41 %. L'écart
  se creuse : le retard n'est pas ponctuel, il s'accumule.
- **Statut des actions** — 43 actions : 16 terminées (37 %), 24 en cours (56 %),
  3 en retard (7 %).
- **Alertes projet** — la dérive G3 (critique), la surcharge Qualité (majeure),
  l'action en retard (majeure).
- **Décisions attendues** — trois arbitrages nommés, avec leurs échéances.

En bas : le **parcours des gates APQP** (G0→G2 validées en vert, G3 en cours en
orange, G4/G5 à venir), les **livrables clés** (DFMEA approuvé 100 %, PFMEA en
cours 62 %, plan de contrôle en revue 48 %) et les alertes critiques.

**Ce que l'utilisateur peut faire :** « Ouvrir le planning » (→ écran 7),
« Piloter l'exécution » (→ écran 3), « Retour portefeuille » (→ écran 1),
« Créer un projet » (→ écran 4).

---

### Acte II — Le terrain

#### 🖥️ Écran 3 · Suivi d'exécution & éléments justificatifs `/execution`

*On passe côté équipe. Noura Trabelsi met à jour sa contribution.*

C'est le seul écran réellement **formulaire**. Il porte une action précise :
**« Clore action étanchéité process »**, rattachée au livrable PFMEA process,
priorité **Critique**, avancement **60 %**, état **En retard**, échéance dépassée
au 09/12/2026.

L'écran décompose le travail en **étapes de réalisation** (vérifier les causes
critiques, mettre à jour la cotation de risque, charger la preuve, soumettre),
chacune avec son statut.

Une **preuve** est attachée : `Plan_securisation_process_v2.pdf`, en **attente de
validation**. Le tableau de traçabilité en bas indique qui l'a déposée, quand, et
que la validation Qualité n'a pas encore eu lieu.

À droite : le compteur personnel (5 à traiter, 3 en retard, 2 critiques, 4 sans
preuve), l'historique horodaté des modifications, et surtout **l'impact projeté** —
valider cette contribution ferait passer le projet de **41 % à 43 %** et la
readiness G3 de **58 % à 62 %**.

**Ce que l'utilisateur peut faire :** modifier les champs du formulaire (ils sont
éditables), et cliquer sur la preuve ou sur « En attente de validation »
(→ écran 13).

---

#### 🖥️ Écran 13 · Analyse de preuve & validation *(modale)*

*Le responsable Qualité contrôle le document avant de le valider.*

La modale montre côté gauche le détail de la preuve et un **aperçu du PDF** (le
plan de sécurisation, ses 4 actions et leurs statuts). Côté droit, une **analyse
automatique** : confiance de conformité **87 %**, statut recommandé « Conforme
sous réserve », et un **écart détecté** — le commentaire de revue qualité manque.

Quatre **critères de validation** sont évalués : trois conformes, un
partiellement conforme (« la preuve couvre bien l'action déclarée »).

**Ce que l'utilisateur peut faire :** choisir sa décision (valider / demander une
correction / rejeter), commenter, puis « Valider la preuve » (→ écran 14) ou
« Retour à la contribution » (→ écran 3).

---

#### 🖥️ Écran 14 · Confirmation de validation `/validation`

*La boucle se ferme.*

Une coche verte, puis les chiffres promis à l'écran 3, désormais réalisés :
**progression projet 41 % → 43 % (+2 pts)** et **readiness G3 58 % → 62 %
(+4 pts)**.

Les effets sont listés explicitement : la preuve est conforme, la contribution
peut être clôturée, le dashboard est à jour, la traçabilité est conservée.
L'historique de validation enregistre la **Version 2** du document.

**Ce que l'utilisateur peut faire :** « Retour au projet » ou « Voir le dashboard
projet » (→ écran 2), « Ouvrir les notifications » (→ écran 15).

---

### Acte III — L'arbitrage

#### 🖥️ Écran 7 · Planning détaillé — Risques & conflits `/planning`

*Le cœur opérationnel. C'est ici qu'on décide.*

Cet écran passe en pleine largeur pour donner de la place au Gantt. Il combine
un **tableau WBS de 15 colonnes** et un **diagramme de Gantt** parfaitement
alignés ligne à ligne.

Le tableau détaille 9 lignes (T08 → T16) sur les lots 3.x et 4.x. Pour chacune :
les **dates baseline et forecast** côte à côte, la charge, l'avancement, le
caractère critique, les prédécesseurs, le **délai en jours** et le statut. La
ligne **3.5 — Gate G3 Process Freeze** est sélectionnée et surlignée : c'est le
point de bascule du projet.

Le Gantt superpose, pour chaque tâche, une **barre grise (baseline)** et une
**barre forecast** — dorée en temps normal, **rouge pour les tâches critiques**.
Les **flèches de dépendance** relient les tâches entre elles, les **losanges**
marquent les gates G3 (16/01/2027) et G4 (08/03/2027), et une ligne bleue
pointillée marque le 15/12/2026.

> 💡 Les barres ne sont pas dessinées à la main : elles sont **calculées à partir
> des dates ISO** du tableau. Les deux vues ne peuvent pas diverger.

Une barre d'affichage permet de changer le mode, filtrer, activer la
synchronisation des lignes et **zoomer sur le Gantt** (le zoom est fonctionnel).

En bas, trois blocs : les **5 risques détectés**, six **actions rapides**, et le
rappel des redirections.

**Ce que l'utilisateur peut faire :** sélectionner une ligne du tableau, zoomer,
et ouvrir les cinq modales décrites ci-dessous.

---

#### 🖥️ Écran 8 · Ajouter un jalon intermédiaire *(modale)*

Créer un point de contrôle **entre deux tâches existantes** — ici une « Revue
intermédiaire PFMEA » au 18/01/2027, positionnée entre T09 et T10.

L'intérêt : le panneau **Aperçu d'impact** répond avant de valider. Impact sur la
dérive : **+0 jour**. Surcharge critique : **aucune**. On peut donc ajouter ce
jalon sans dégrader le planning.

→ « Ajouter le jalon » ou « Annuler » ramènent à l'écran 7.

---

#### 🖥️ Écran 9 · Ajouter une tâche *(modale)*

Créer une vraie tâche — « Mettre à jour plan de contrôle G3 », 16 h, du
12/01 au 19/01/2027, affectée à Noura Trabelsi, priorité élevée.

Le panneau d'impact prévient : **+2 % de charge sur la fonction Qualité**, dérive
inchangée, mais la tâche est **critique**. Ajouter du travail à une ressource
déjà à 112 % n'est pas neutre.

→ « Créer la tâche » ou « Annuler » ramènent à l'écran 7.

---

#### 🖥️ Écran 10 · Ajouter une sous-tâche *(modale)*

Descendre d'un niveau sous une tâche existante : « Vérifier causes critiques
étanchéité » sous T09, 4 h, affectée à Youssef Jaziri.

Impact : **+1 % de capacité**, dérive inchangée, non critique. C'est le geste à
faible risque, par opposition à l'écran 9.

→ « Ajouter » ou « Annuler » ramènent à l'écran 7.

---

#### 🖥️ Écran 11 · Conflit de ressources détecté *(modale)*

*Le moment clé de la démonstration.*

On y arrive en cliquant sur le risque **« Conflit de charge sur Noura Trabelsi »**.

La modale expose le problème sans détour : Noura Trabelsi, fonction Qualité,
**capacité 140 h**, **charge 176 h**, soit **126 %** sur les semaines S03 à S05
de janvier 2027. Trois tâches se disputent son temps : T09 (80 h), T10 (64 h) et
la revue intermédiaire PFMEA (32 h). Le dépassement est de **36 h**.

Quatre solutions sont proposées, chacune chiffrée :

| Solution | Effet |
|---|---|
| **Décaler T10 de 3 jours** *(recommandée)* | soulage S04–S05 |
| Affecter une ressource supplémentaire | −36 h de surcharge |
| Réduire la charge de T09 | −16 h |
| Répartition automatique | optimise l'ensemble |

Et surtout, le résultat attendu : **impact sur G3 = +0 j**, **charge/capacité
après action = 98 %**, **criticité résiduelle faible**. On résout la surcharge
sans décaler la gate.

→ « Appliquer la solution » ou « Annuler » ramènent à l'écran 7.

---

#### 🖥️ Écran 12 · Simulation de replanification *(modale)*

*« Et si on le faisait vraiment ? »*

La simulation compare **Avant** et **Après** côte à côte. Les trois dates de gate
(G2, G3, G4) sont **identiques** dans les deux colonnes — la replanification ne
coûte aucun jour. Seule la charge Qualité bouge : **112 % → 98 %**, criticité
**Élevée → Faible**.

Quatre chiffres résument : **−14 % de charge**, **36 h réaffectées**, **0 jour**
de dérive, **risque résiduel faible**.

Deux mini-Gantt montrent visuellement le décalage de T10 vers la droite, et
l'analyse automatique conclut : la surcharge est résorbée, aucun impact sur G3.

→ « Appliquer la replanification » ou « Annuler » ramènent à l'écran 7.

---

### Acte IV — La création

#### 🖥️ Écrans 4, 5, 6 · Créer un nouveau projet `/nouveau-projet/etape-1…3`

*Un nouveau programme arrive : un module de refroidissement pour VE.*

**Étape 1/3 — Identité.** Code P-DEMO-004, nom « Module de refroidissement »,
client OEM Alpha, pièce « Cooling plate EV », chef de projet Leïla Mansour,
template « APQP Light — Nouveau produit ». La description et les quatre
objectifs clés cadrent le projet. Un résumé se met en regard.

**Étape 2/3 — Planning & ressources.** Kickoff 01/10/2026, SOP cible 30/09/2027,
calendrier standard 5/7 : **12 mois, 10 920 h**. Six fonctions sont dotées, et le
système détecte immédiatement **deux risques de capacité** :

- **Qualité — surcharge de 190 h** (critique) : impact potentiel sur G2/G3,
  recommandation d'ajouter 0,2 ETP ou de replanifier.
- **Process — marge faible de 180 h** (élevé) : réduire la charge ou lisser.

Le tableau d'affectation nominative montre six personnes, dont plusieurs déjà
engagées sur **2 projets en parallèle**. Le problème de l'écran 11 est donc
**structurel**, pas accidentel.

**Étape 3/3 — Prévisualisation & génération.** Avant de créer quoi que ce soit,
le système montre ce qu'il va produire : **6 gates, 18 tâches, 6 fonctions,
10 ressources, 10 920 h, 94 % de charge/capacité**. Le parcours APQP est daté de
G0 (01/10/2026) à G5 (30/09/2027), un mini-Gantt esquisse les phases, et la
surcharge Qualité est rappelée une dernière fois avec ses recommandations.

→ « Générer le projet » ouvre le dashboard projet (écran 2), « Voir le planning
initial » ouvre le planning (écran 7).

---

### Acte V — Le suivi

#### 🖥️ Écran 15 · Centre de notifications `/notifications`

*Tout ce qui s'est passé, au même endroit.*

Six notifications, filtrables par **Toutes / Non lues / Alertes / Projet /
Capacité / Validation** — les filtres fonctionnent réellement.

On y retrouve toute l'histoire : le PFMEA en retard, la surcharge Qualité à
112 %, la **preuve validée** (écran 14), la dérive G3 confirmée à +14 jours, la
contribution passée à 60 %, et la **simulation prête à appliquer**.

Le résumé contextuel à droite rappelle les quatre faits saillants du jour.

**Ce que l'utilisateur peut faire :** chaque notification renvoie à l'écran
concerné — « Preuve validée » → écran 14, « Simulation prête » → écran 7,
« Retour portefeuille » → écran 1, ce qui **boucle le parcours**.

---

## 5. Le parcours complet

```
        ┌──────────────────────────────────────────────────────┐
        │                                                      │
        ▼                                                      │
   ① Portefeuille ──► ② Dashboard projet ──► ③ Suivi exécution │
        │                    │    ▲                  │         │
        │                    │    └──────────────────┘         │
        │                    │                       ▼         │
        │                    │                 ⑬ Analyse preuve│
        │                    │                       │         │
        │                    │                       ▼         │
        │                    │                 ⑭ Confirmation  │
        │                    │                       │         │
        │                    │                       ▼         │
        │                    │                 ⑮ Notifications ┘
        │                    │
        │                    ▼
        │              ④⑤⑥ Création projet (3 étapes)
        │                    │
        ▼                    ▼
   ⑦ Planning détaillé ◄─────┘
        │
        ├─► ⑧ Ajouter un jalon      ──┐
        ├─► ⑨ Ajouter une tâche     ──┤
        ├─► ⑩ Ajouter une sous-tâche──┼──► retour ⑦
        ├─► ⑪ Conflit de ressources ──┤
        └─► ⑫ Simulation            ──┘
```

**Démo recommandée en 6 minutes :** ① → ② → ⑦ → ⑪ → ⑫ → ⑦ → ③ → ⑬ → ⑭ → ⑮ → ①

---

## 6. Ce que la démonstration ne présente pas:

Pour éviter toute ambiguïté lors de la présentation :

| Aspect | État réel |
|---|---|
| Persistance | ❌ Aucune. Un rafraîchissement remet tout à zéro. |
| Formulaires | ✏️ Éditables, mais rien n'est enregistré. |
| Rôles | 👁️ Affichés, pas appliqués. Aucun droit contrôlé. |
| Onglets secondaires | 🎨 « Charge / Capacité », « Risques », « Chemin critique », « Planning », « Livrables » sont visuels : seul l'onglet actif a du contenu. |
| Boutons secondaires | Certains (« Exporter », « Voir tous les risques », « Tout marquer comme lu ») sont décoratifs. |
| Backend / API / base | ❌ Inexistants, par conception. |
| Intégrations ERP/MES/PLM/QMS | ❌ Hors périmètre. |

Ce qui est **réellement interactif** : toutes les redirections du scénario, les
cinq modales du planning, la modale d'analyse de preuve, les filtres du centre
de notifications, le zoom et la sélection de ligne du Gantt, la synchronisation
du menu latéral, et la saisie dans les champs de formulaire.

---

## 7. Sous le capot

| Élément | Choix |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript strict |
| Style | Tailwind CSS, jetons de design centralisés dans `globals.css` |
| Graphiques | Recharts (anneaux, courbe en S) — le Gantt est fait main |
| Icônes | Lucide |
| Données | `src/lib/data.ts`, source unique pour tous les écrans |
| Mise en page | Chaque page tient dans **un écran, sans défilement vertical** |

Le point important pour une reprise : **il n'y a qu'une seule source de
données**. Les 112 % de charge Qualité, les +14 jours de dérive G3 et Noura
Trabelsi apparaissent sur cinq écrans différents — ils viennent tous du même
fichier. Modifier une valeur la propage partout, et rend toute incohérence
impossible.

Lancement :

```bash
npm install
npm run dev
```

Puis ouvrir <http://localhost:3000> — la racine redirige vers le portefeuille.
