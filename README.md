# Space Clicker

Un jeu incrémental sur le thème de l'espace où vous collectez des étoiles et débloquez des améliorations pour automatiser votre production.

## Caractéristiques

- **Gameplay simple mais addictif** : Cliquez sur une planète pour collecter des étoiles
- **Animations visuelles** : Des étoiles qui volent vers le compteur pour un retour visuel satisfaisant
- **Système de progression** : 11 générateurs passifs différents avec des barres de progression
- **Power-up Activable** : Un pouvoir stellaire qui double les étoiles par clic pendant 15 secondes
- **Formatage des grands nombres** : Affichage élégant des valeurs (k, M, B, etc.)
- **Design spatial immersif** : Interface utilisateur avec thème spatial et animations d'étoiles

## Générateurs

Le jeu propose 11 générateurs avec des productions et temps de cycle différents :

1. **Astrologue** : 1 étoile × niveau toutes les 3 secondes
2. **Astronome** : 7 étoiles × niveau toutes les 5 secondes
3. **Explorateur Orbital** : 25 étoiles × niveau toutes les 7 secondes
4. **Colonisateur Stellaire** : 80 étoiles × niveau toutes les 10 secondes
5. **Cartographe Galactique** : 250 étoiles × niveau toutes les 12 secondes
6. **Maître du Vide** : 900 étoiles × niveau toutes les 15 secondes
7. **Éveilleur de Trous Noirs** : 3000 étoiles × niveau toutes les 20 secondes
8. **Forgeur de Planètes** : 10000 étoiles × niveau toutes les 25 secondes
9. **Architecte Céleste** : 40000 étoiles × niveau toutes les 30 secondes
10. **Destructeur de Soleil** : 120000 étoiles × niveau toutes les 35 secondes

## Système de progression

- Chaque générateur produit (baseStars × niveau) étoiles par cycle
- Les animations d'étoiles correspondent exactement à la production (nombre et timing)
- Les barres de progression se remplissent à une vitesse constante pour chaque générateur
- Le coût de chaque amélioration augmente selon une progression exponentielle (×1.15 par niveau)
- Le power-up "Pouvoir Stellaire" coûte 10000 étoiles et est débloqué à vie après achat

## Comment jouer

1. Cliquez sur la planète pour collecter des étoiles
2. Achetez des améliorations dans le panneau de droite
3. Les améliorations passives généreront automatiquement des étoiles
4. Achetez et utilisez le power-up stellaire pour doubler temporairement votre production par clic
5. Continuez à améliorer vos générateurs pour augmenter votre production
6. Débloquez des générateurs plus puissants à mesure que vous progressez

## Aspects techniques

- Optimisé pour des performances fluides même avec de nombreuses animations
- Système de barres de progression soigneusement équilibré
- Feedback visuel pour chaque action de l'utilisateur
- Interface réactive et moderne avec Tailwind CSS

## Structure des fichiers

- `index.html` - La page principale du jeu
- `styles.css` - Les styles pour l'interface et les animations
- `game.js` - La logique complète du jeu et des systèmes de progression

## Installation

Aucune installation n'est requise. Il suffit de télécharger les fichiers et d'ouvrir index.html dans votre navigateur préféré.

Le jeu utilise des CDN pour Tailwind CSS et Font Awesome, donc une connexion internet est nécessaire pour une expérience optimale.