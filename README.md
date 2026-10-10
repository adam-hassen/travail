# Book series shop — back-office

Back-office pour gérer la saisie et la planification de publication de livres (séries, tomes, dates de sortie). L'intégration Shopify et réseaux sociaux sera branchée dans une prochaine étape.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- PostgreSQL + Drizzle ORM

## Setup en local

1. Copier `.env.example` en `.env.local` et renseigner `DATABASE_URL` (une base PostgreSQL, locale ou hébergée type Neon/Railway)
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Appliquer les migrations :
   ```bash
   npx drizzle-kit migrate
   ```
4. Lancer le serveur de dev :
   ```bash
   npm run dev
   ```

## Déploiement (Vercel + Neon)

1. Créer un projet Vercel connecté à ce repo GitHub → déploiement automatique à chaque push
2. Créer une base PostgreSQL sur [Neon](https://neon.tech) (ou Railway)
3. Dans les variables d'environnement du projet Vercel, ajouter `DATABASE_URL` avec l'URL de connexion Neon
4. Appliquer les migrations sur la base de prod :
   ```bash
   DATABASE_URL="<url_neon>" npx drizzle-kit migrate
   ```

## Structure

- `src/db/schema.ts` — modèle de données (series, books, orders)
- `src/app/api/` — routes API (CRUD séries et livres)
- `src/components/` — formulaires et tableaux du back-office
- `drizzle/` — migrations SQL générées
