import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /*
   * Next devine la racine du projet en cherchant les fichiers de verrouillage.
   * S'il en traîne un dans un dossier parent, il choisit ce parent et trace les
   * fichiers au mauvais endroit. On fixe la racine ici : elle ne dépend plus de
   * ce qui se trouve à côté du projet.
   */
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
