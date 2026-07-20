/**
 * Mise à l'échelle proportionnelle de la maquette.
 *
 * Les écrans de PortIndus sont dessinés en pixels fixes et tiennent tous en une
 * seule page, sans défilement. Sur une fenêtre plus courte — un portable, ou un
 * écran sous mise à l'échelle Windows à 125 % — la maquette n'a plus la place de
 * se déployer : les cartes se tassent, la barre d'outils passe à la ligne et le
 * Gantt perd la moitié de sa fenêtre de temps.
 *
 * Plutôt que de réagencer chaque écran, on garde la maquette intacte dans un
 * cadre d'au moins DESIGN_W × DESIGN_H et on la réduit optiquement pour qu'elle
 * remplisse exactement la fenêtre. Tous les postes voient alors la même image,
 * au facteur d'échelle près.
 *
 * Conséquence à retenir : à l'intérieur du cadre, les longueurs CSS ne sont plus
 * des pixels écran. Tout code qui mélange une mesure de pointeur (`clientX`,
 * `getBoundingClientRect`) — exprimée en pixels écran — avec une longueur de mise
 * en page doit convertir avec `appScale()`.
 */

declare global {
  interface Window {
    /** Écrit par VIEWPORT_SCRIPT, lu par `appScale()`. */
    __appScale?: number;
  }
}

/** Cadre de référence : la place minimale dont la maquette a besoin. */
export const DESIGN_W = 1440;
export const DESIGN_H = 940;

/** Plancher de réduction : en dessous, le texte deviendrait illisible. */
export const MIN_SCALE = 0.45;

/**
 * Facteur appliqué au cadre. Publié par VIEWPORT_SCRIPT sur `window`, et non lu
 * depuis les variables CSS : la valeur est consultée à chaque déplacement de
 * souris pendant un glissement, où un `getComputedStyle` forcerait un recalcul
 * de style à chaque image.
 */
export function appScale(): number {
  if (typeof window === "undefined") return 1;
  const s = window.__appScale;
  return typeof s === "number" && s > 0 ? s : 1;
}

/**
 * Exécuté avant le premier rendu du cadre, donc avant la première peinture :
 * la maquette n'apparaît jamais à la mauvaise taille. Reste en JavaScript brut
 * pour être injecté tel quel dans la page.
 */
export const VIEWPORT_SCRIPT = `(function(){
  var W=${DESIGN_W},H=${DESIGN_H},MIN=${MIN_SCALE},root=document.documentElement;
  function fit(){
    var vw=window.innerWidth,vh=window.innerHeight;
    var s=Math.max(MIN,Math.min(1,vw/W,vh/H));
    window.__appScale=s;
    root.style.setProperty('--app-scale',String(s));
    /* Arrondi à l'inférieur : le cadre ne dépasse jamais d'une fraction de
       pixel, ce qui ferait apparaître une barre de défilement fantôme. */
    root.style.setProperty('--app-w',Math.max(W,Math.floor(vw/s))+'px');
    root.style.setProperty('--app-h',Math.max(H,Math.floor(vh/s))+'px');
  }
  fit();
  window.addEventListener('resize',fit);
})();`;
