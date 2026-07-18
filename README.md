# PortIndus

Prototype d'interface pour le **pilotage de projets APQP** (Advanced Product
Quality Planning) dans l'industrie automobile : portefeuille consolidé, planning
Gantt avec détection de conflits de ressources, suivi d'exécution et validation
des preuves documentaires.

**100 % front-end.** Aucun backend, aucune base de données, aucune API. Toutes
les données sont figées dans `src/lib/data.ts`.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir <http://localhost:3000> — la racine redirige vers le portefeuille.

```bash
npm run typecheck   # vérification TypeScript
npm run build       # build de production
```

## Les écrans

| Route | Écran |
| --- | --- |
| `/portefeuille` | Vue globale du portefeuille — KPI, santé, charge/capacité |
| `/projet` | Dashboard chef de projet — courbe en S, gates APQP, livrables |
| `/execution` | Suivi d'exécution & éléments justificatifs *(+ modale d'analyse de preuve)* |
| `/planning` | Planning détaillé — Gantt, risques & conflits *(+ 5 modales)* |
| `/nouveau-projet/etape-1…3` | Assistant de création de projet en 3 étapes |
| `/validation` | Confirmation de validation d'une preuve |
| `/notifications` | Centre de notifications |

Le parcours complet, écran par écran, est décrit dans **[SCENARIO.md](SCENARIO.md)**.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS ·
Recharts · Lucide React

## Architecture

```
src/
├── app/
│   ├── portefeuille/            # Vue portefeuille
│   ├── projet/                  # Dashboard projet
│   ├── execution/               # Suivi d'exécution + modale de validation
│   ├── planning/                # Gantt, risques & conflits
│   ├── nouveau-projet/          # Assistant 3 étapes
│   ├── validation/              # Confirmation
│   └── notifications/           # Centre de notifications
├── components/
│   ├── layout/app-shell.tsx     # Sidebar repliable + barre supérieure
│   ├── planning/                # Gantt + les 5 modales du planning
│   ├── shared/                  # Titres, KPI, bandeaux, étapes d'assistant
│   └── ui/primitives.tsx        # Button, Card, Panel, Chip, Modal, champs…
└── lib/
    ├── data.ts                  # Source unique de toutes les données
    └── utils.ts                 # cn(), initiales, formatage numérique
```

## Principes de conception

- **Une seule source de données.** Les 112 % de charge Qualité, la dérive de
  +14 jours sur G3 et les ressources en conflit apparaissent sur plusieurs
  écrans : ils viennent tous de `data.ts`. Aucune divergence possible.
- **Un écran, sans défilement.** Chaque page tient dans la hauteur de la
  fenêtre ; seuls les panneaux internes défilent si nécessaire.
- **Le Gantt est calculé.** Les barres sont dérivées des dates ISO du tableau
  WBS, jamais positionnées à la main.

## Palette

| Rôle | Couleur |
| --- | --- |
| Bronze principal | `#B45F09` |
| Or / ambre | `#E5A11B` · `#E58A00` |
| Texte | `#101828` · `#667085` |
| Bordures | `#EAECF0` |
| Vert / Rouge / Bleu | `#2E7D32` · `#D92D20` · `#3976D3` |

## Limites assumées

Prototype de démonstration : aucune persistance (un rafraîchissement remet tout
à zéro), les formulaires sont éditables mais rien n'est enregistré, les rôles
affichés ne sont pas appliqués, et certains onglets et boutons secondaires sont
décoratifs.
