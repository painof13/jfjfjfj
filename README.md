# GlamBrush — Thème Shopify Premium Beauté

Thème Shopify haute conversion pour le **Nettoyeur de Pinceaux Électrique USB 3-en-1 GlamBrush**.

---

## Structure du thème

```
theme/
├── layout/
│   └── theme.liquid           ← Layout principal (head, meta, structured data)
├── sections/
│   ├── announcement-bar.liquid ← Barre annonces (livraison, promotions)
│   ├── urgency-bar.liquid      ← Barre urgence + compte à rebours
│   ├── header.liquid           ← Navigation sticky
│   ├── hero-product.liquid     ← Section hero cinématique (image/vidéo + copy)
│   ├── trust-strip.liquid      ← Bande 4 éléments de confiance
│   ├── benefits.liquid         ← 4 bénéfices produit en cards
│   ├── how-it-works.liquid     ← 3 étapes animées
│   ├── social-proof.liquid     ← Avis + UGC masonry + rating widget
│   ├── faq-accordion.liquid    ← FAQ avec structured data SEO
│   ├── sticky-atc.liquid       ← Add-to-cart flottant
│   ├── final-cta.liquid        ← Section CTA plein écran sombre
│   └── footer.liquid           ← Pied de page
├── snippets/
│   ├── star-rating.liquid      ← Widget étoiles réutilisable
│   ├── trust-badges.liquid     ← Badges de confiance réutilisables
│   └── product-card.liquid     ← Carte produit réutilisable
├── assets/
│   ├── theme.css               ← Design system complet (CSS custom properties)
│   ├── animations.css          ← Animations CSS + keyframes
│   └── product-page.js         ← Logique cart, countdown, reveal, FAQ
└── config/
    ├── settings_schema.json    ← Paramètres éditables via Shopify theme editor
    └── settings_data.json      ← Valeurs par défaut
```

---

## Installation sur Shopify

### Méthode 1 — Shopify CLI (recommandée)

```bash
# Installer Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Se connecter au store
shopify auth login --store votre-boutique.myshopify.com

# Pousser le thème
shopify theme push --path ./theme

# Développement local avec live reload
shopify theme dev --store votre-boutique.myshopify.com --path ./theme
```

### Méthode 2 — Upload ZIP

1. Zipper le dossier `theme/`
2. Dans Shopify Admin → **Online Store → Themes**
3. Cliquer **"Add theme" → "Upload zip file"**
4. Sélectionner le fichier zip

---

## Configuration initiale

### 1. Fonts Google (déjà incluses dans theme.liquid)

Les polices suivantes sont chargées automatiquement :
- **Playfair Display** — Titres élégants
- **DM Sans** — Corps de texte moderne
- **Cormorant Garamond** — Accents luxe italiques

### 2. Homepage — ordre des sections recommandé

Dans **Shopify Admin → Online Store → Themes → Customize** :

1. `Announcement Bar` — Livraison gratuite + promo
2. `Header`
3. `Urgency Bar` — Barre compte à rebours
4. `Hero Produit` — Image + copy + ATC
5. `Trust Strip` — 4 icônes confiance
6. `Bénéfices produit` — 4 cards bénéfices
7. `Comment ça marche` — 3 étapes
8. `Avis clients` — Reviews masonry
9. `FAQ Accordion`
10. `CTA Final`
11. `Footer`

### 3. Paramètres à configurer

**Dans chaque section :**
- **Hero Produit** : uploader l'image/vidéo principale, saisir les textes, ajuster le stock
- **Urgency Bar** : activer et personnaliser le message d'urgence
- **Avis clients** : ajouter les avis avec photos UGC
- **Footer** : renseigner les liens réseaux sociaux

### 4. Produit Shopify

Créer le produit avec :
- **Titre** : GlamBrush — Nettoyeur Pinceaux Électrique USB 3-en-1
- **Prix** : 24.99 EUR
- **Prix comparé** : 74.99 EUR (pour afficher -67%)
- **Images** : au moins 4 photos produit (fond blanc + lifestyle)
- **Tags** : `beauté`, `maquillage`, `pinceaux`, `nettoyeur`

---

## Design System

### Palette couleurs

| Variable | Valeur | Usage |
|---|---|---|
| `--color-primary` | `#1A1A1A` | Noir profond — texte, boutons |
| `--color-accent` | `#E8C4B8` | Rose poudré — accents doux |
| `--color-accent-strong` | `#C9956A` | Or rosé — CTA, highlights |
| `--color-bg` | `#FDFAF8` | Blanc crème — fond général |
| `--color-bg-dark` | `#161616` | Fond sombre — sections hero |
| `--color-success` | `#2D6A4F` | Vert confiance — badges vérifiés |

### Boutons disponibles

```html
<button class="btn btn--primary">Bouton principal</button>
<button class="btn btn--accent btn--pulse">CTA pulsant</button>
<button class="btn btn--outline">Bouton outline</button>
<button class="btn btn--lg">Grand bouton</button>
<button class="btn btn--full">Pleine largeur</button>
```

### Animations

Ajouter `data-reveal` sur n'importe quel élément pour une animation au scroll :

```html
<div data-reveal>Apparaît en fade-in au scroll</div>
<div data-reveal="left">Glisse depuis la gauche</div>
<div data-reveal="right">Glisse depuis la droite</div>
<div data-reveal data-delay="2">Avec délai (120ms par unité)</div>
```

---

## JavaScript API

### Ajouter au panier

```javascript
// Depuis n'importe où dans le thème
addToCart(variantId, quantity);

// Exemple
addToCart('{{ product.variants.first.id }}', 1);
```

### Toast notification

```javascript
showToast('Message à afficher');
```

---

## Performance

- **Images** : toutes en `srcset` avec breakpoints 375/768/1200px
- **Fonts** : chargées avec `display=swap` (pas de FOIT)
- **JS** : non-critique en `defer` via `script_tag`
- **Hero image** : preloadée avec `fetchpriority="high"`
- **Animations** : respectent `prefers-reduced-motion`
- **Core Web Vitals targets** : LCP < 2.5s, CLS = 0, FID < 100ms

---

## SEO inclus

- Structured data `Product` (schema.org) — page produit
- Structured data `FAQPage` — accordéon FAQ
- Meta OG + Twitter Card
- Canonical URL
- ARIA labels sur tous les éléments interactifs
- Contraste WCAG AA sur tous les textes
