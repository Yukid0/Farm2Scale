// État du jeu
const gameState = {
    stars: 20000,
    totalStars: 20000,
    clickValue: 1,
    starsPerSecond: 0,
    powerUp: {
        doubleClick: {
            unlocked: false,
            active: false,
            cost: 10000,
            duration: 15000, // 15 secondes
            cooldown: 300000, // 5 minutes
            lastUsed: 0,
            timeRemaining: 0
        }
    },
    upgrades: [
        {
            id: 1,
            name: "Aspirateur d'étoiles",
            description: "Augmente les étoiles par clic de 1",
            baseCost: 10,
            cost: 10,
            owned: 0,
            baseStars: 1,
            icon: "fa-wind",
            type: "click"
        },
        {
            id: 2,
            name: "Astrologue",
            description: "Génère 1 étoile × niveau toutes les 3 secondes",
            baseCost: 15,
            cost: 15,
            owned: 0,
            baseStars: 1,
            icon: "fa-user-astronaut",
            type: "passive"
        },
        {
            id: 3,
            name: "Astronome",
            description: "Génère 7 étoiles × niveau toutes les 5 secondes",
            baseCost: 100,
            cost: 100,
            owned: 0,
            baseStars: 7,
            icon: "fa-telescope",
            type: "passive"
        },
        {
            id: 4,
            name: "Explorateur Orbital",
            description: "Génère 25 étoiles × niveau toutes les 7 secondes",
            baseCost: 600,
            cost: 600,
            owned: 0,
            baseStars: 25,
            icon: "fa-satellite",
            type: "passive"
        },
        {
            id: 5,
            name: "Colonisateur Stellaire",
            description: "Génère 80 étoiles × niveau toutes les 10 secondes",
            baseCost: 3000,
            cost: 3000,
            owned: 0,
            baseStars: 80,
            icon: "fa-rocket",
            type: "passive"
        },
        {
            id: 6,
            name: "Cartographe Galactique",
            description: "Génère 250 étoiles × niveau toutes les 12 secondes",
            baseCost: 10000,
            cost: 10000,
            owned: 0,
            baseStars: 250,
            icon: "fa-map-marked-alt",
            type: "passive"
        },
        {
            id: 7,
            name: "Maître du Vide",
            description: "Génère 900 étoiles × niveau toutes les 15 secondes",
            baseCost: 40000,
            cost: 40000,
            owned: 0,
            baseStars: 900,
            icon: "fa-hand-sparkles",
            type: "passive"
        },
        {
            id: 8,
            name: "Éveilleur de Trous Noirs",
            description: "Génère 3000 étoiles × niveau toutes les 20 secondes",
            baseCost: 200000,
            cost: 200000,
            owned: 0,
            baseStars: 3000,
            icon: "fa-circle-notch",
            type: "passive"
        },
        {
            id: 9,
            name: "Forgeur de Planètes",
            description: "Génère 10000 étoiles × niveau toutes les 25 secondes",
            baseCost: 750000,
            cost: 750000,
            owned: 0,
            baseStars: 10000,
            icon: "fa-globe",
            type: "passive"
        },
        {
            id: 10,
            name: "Architecte Céleste",
            description: "Génère 40000 étoiles × niveau toutes les 30 secondes",
            baseCost: 3000000,
            cost: 3000000,
            owned: 0,
            baseStars: 40000,
            icon: "fa-drafting-compass",
            type: "passive"
        },
        {
            id: 11,
            name: "Destructeur de Soleil",
            description: "Génère 120000 étoiles × niveau toutes les 35 secondes",
            baseCost: 15000000,
            cost: 15000000,
            owned: 0,
            baseStars: 120000,
            icon: "fa-sun",
            type: "passive"
        }
    ]
};

// Système de production d'étoiles par barre de progression
const progressionSystem = {
    // Pour chaque amélioration, stocker son état de progression
    progressState: {},
    
    // Temps de remplissage par amélioration (en ms)
    fillTimes: {
        // ID de l'amélioration: temps en ms (tous multipliés par 4x5x3x1.5=90 pour ralentir)
        2: 270000,   // Astrologue: 1 étoile/3sec
        3: 450000,   // Astronome: 7 étoiles/5sec
        4: 630000,   // Explorateur Orbital: 25 étoiles/7sec
        5: 900000,   // Colonisateur Stellaire: 80 étoiles/10sec
        6: 1080000,  // Cartographe Galactique: 250 étoiles/12sec
        7: 1350000,  // Maître du Vide: 900 étoiles/15sec
        8: 1800000,  // Éveilleur de Trous Noirs: 3000 étoiles/20sec
        9: 2250000,  // Forgeur de Planètes: 10000 étoiles/25sec
        10: 2700000, // Architecte Céleste: 40000 étoiles/30sec
        11: 3150000  // Destructeur de Soleil: 120000 étoiles/35sec
    },
    
    // Initialiser ou réinitialiser une barre de progression
    initBar: function(upgradeId, ownedCount) {
        this.progressState[upgradeId] = {
            production: ownedCount,
            progress: 0,
            lastUpdate: Date.now()
        };
    },
    
    // Mettre à jour la progression et vérifier si une étoile doit être générée
    updateProgress: function(upgradeId, elapsedMs) {
        if (!this.progressState[upgradeId]) return false;
        
        const state = this.progressState[upgradeId];
        const production = state.production;
        
        // Si la production est nulle, ne rien faire
        if (!production || production <= 0) return false;
        
        // Trouver le temps de remplissage pour cette amélioration
        // Si non spécifié, utiliser un temps par défaut
        const fillTime = this.fillTimes[upgradeId] || 2000;
        
        // Ajouter le temps écoulé à la progression (basé sur le temps de remplissage fixe)
        // Progression strictement linéaire
        const progressIncrement = (elapsedMs / fillTime) * 100;
        state.progress += progressIncrement;
        
        // Vérifier si on a atteint ou dépassé 100%
        if (state.progress >= 100) {
            // Calculer combien d'étoiles à générer pour cette amélioration
            const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
            
            // Le nombre d'étoiles générées est égal au baseStars × niveau
            const starsToGenerate = upgrade.baseStars * upgrade.owned;
            
            // Réinitialiser complètement la barre à 0
            state.progress = 0;
            
            // Mettre à jour le timestamp pour repartir de zéro
            state.lastUpdate = Date.now();
            
            // Retourner le nombre d'étoiles à générer
            return starsToGenerate;
        }
        
        return false;
    },
    
    // Obtenir la progression actuelle
    getProgress: function(upgradeId) {
        return this.progressState[upgradeId] ? this.progressState[upgradeId].progress : 0;
    },
    
    // Obtenir le temps de remplissage pour une amélioration
    getFillTime: function(upgradeId) {
        return this.fillTimes[upgradeId] || 2000;
    }
};

// Fonction pour formater les seconds en texte lisible
function formatSeconds(seconds) {
    if (seconds >= 1) {
        return seconds.toFixed(1) + " sec";
    } else {
        return (seconds * 1000).toFixed(0) + " ms";
    }
}

// Fonction pour mettre à jour l'affichage de la production pour toutes les améliorations
function updateProductionDisplay() {
    gameState.upgrades.forEach(upgrade => {
        if (upgrade.type === "passive" && upgrade.owned > 0) {
            const productionElement = document.querySelector(`.upgrade-item[data-id="${upgrade.id}"] .text-xs.text-purple-200.mt-1`);
            const nameElement = document.querySelector(`.upgrade-item[data-id="${upgrade.id}"] h3.font-semibold`);
            
            if (productionElement) {
                // Utiliser le temps de remplissage original pour l'affichage
                const originalFillTime = progressionSystem.getFillTime(upgrade.id) / 90000;
                const totalProduction = upgrade.baseStars * upgrade.owned;
                
                // Le taux par seconde est basé sur la production totale
                const ratePerSecond = (totalProduction / originalFillTime).toFixed(1);
                
                productionElement.innerHTML = `
                    ${ratePerSecond}/sec
                    <span class="text-xs text-purple-400">(${totalProduction} étoiles/${formatSeconds(originalFillTime)})</span>
                `;
            }
            
            if (nameElement) {
                nameElement.textContent = `${upgrade.name} lvl.${upgrade.owned}`;
            }
        }
    });
}

// Fonction pour formater les grands nombres
function formatNumber(num) {
    if (num < 1000) return Math.floor(num);
    
    const units = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const unitIndex = Math.floor(Math.log10(num) / 3);
    const value = num / Math.pow(1000, unitIndex);
    
    // Afficher avec 1 décimale si < 10, sinon arrondir
    return unitIndex === 0 
        ? Math.floor(value) 
        : (value < 10 
            ? value.toFixed(1).replace(/\.0$/, '') 
            : Math.floor(value)) + units[unitIndex];
}

// Créer les étoiles de fond
function createStars() {
    const starsContainer = document.getElementById('stars-container');
    const starsCount = 100;
    
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Taille aléatoire entre 1 et 3px
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Position aléatoire
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Animation delay aléatoire
        star.style.animationDelay = `${Math.random() * 2}s`;
        
        starsContainer.appendChild(star);
    }
}

// Mettre à jour l'affichage
function updateDisplay() {
    document.getElementById('counter').textContent = formatNumber(gameState.stars);
    document.getElementById('total-stars').textContent = formatNumber(gameState.totalStars);
    
    // Mettre à jour l'affichage des étoiles par seconde
    const starsPerSecondElement = document.getElementById('stars-per-second');
    if (gameState.starsPerSecond <= 0) {
        starsPerSecondElement.textContent = "0";
    } else if (gameState.starsPerSecond < 1000) {
        starsPerSecondElement.textContent = gameState.starsPerSecond.toFixed(1);
    } else {
        starsPerSecondElement.textContent = formatNumber(gameState.starsPerSecond);
    }
    
    // Mettre à jour l'affichage du power-up
    updatePowerUpDisplay();
    
    document.getElementById('click-value').textContent = `+${formatNumber(gameState.clickValue)} étoile${gameState.clickValue > 1 ? 's' : ''} par clic`;
    
    // Ajouter une animation au compteur
    document.getElementById('counter').classList.add('counter-pop');
    setTimeout(() => {
        document.getElementById('counter').classList.remove('counter-pop');
    }, 300);
    
    // Mettre à jour l'affichage de la production
    updateProductionDisplay();
}

// Fonction pour mettre à jour l'affichage du power-up
function updatePowerUpDisplay() {
    const powerUp = gameState.powerUp.doubleClick;
    const powerUpButton = document.getElementById('power-up-button');
    const powerUpStatus = document.getElementById('power-up-status');
    const powerUpTimer = document.getElementById('power-up-timer');
    const powerUpCooldown = document.getElementById('power-up-cooldown');
    const powerUpProgress = document.getElementById('power-up-progress');
    
    // Mettre à jour le bouton d'achat/activation
    if (!powerUp.unlocked) {
        // Power-up pas encore débloqué
        powerUpButton.textContent = `${formatNumber(powerUp.cost)} étoiles`;
        powerUpButton.disabled = gameState.stars < powerUp.cost;
        powerUpButton.classList.toggle('opacity-50', gameState.stars < powerUp.cost);
        powerUpButton.classList.toggle('cursor-not-allowed', gameState.stars < powerUp.cost);
    } else {
        // Power-up débloqué, vérifier s'il est actif ou en cooldown
        const now = Date.now();
        
        if (powerUp.active) {
            // Power-up actif
            powerUpButton.innerHTML = `<i class="fas fa-bolt mr-1"></i>Actif`;
            powerUpButton.disabled = true;
            powerUpButton.classList.add('opacity-50', 'cursor-not-allowed', 'bg-green-600');
            powerUpButton.classList.remove('bg-yellow-600', 'hover:bg-yellow-500');
            
            // Afficher le temps restant
            const timeRemaining = Math.ceil(powerUp.timeRemaining / 1000);
            powerUpTimer.textContent = `${timeRemaining}s`;
            
            // Mettre à jour la barre de progression
            const progressPercentage = (powerUp.timeRemaining / powerUp.duration) * 100;
            powerUpProgress.style.width = `${progressPercentage}%`;
            powerUpProgress.classList.add('bg-green-500');
            powerUpProgress.classList.remove('bg-red-500');
            
            // Ajouter la classe pour l'effet visuel
            document.body.classList.add('power-up-active');
        } else if (now - powerUp.lastUsed < powerUp.cooldown) {
            // Power-up en cooldown
            powerUpButton.innerHTML = `<i class="fas fa-hourglass-half mr-1"></i>Recharge`;
            powerUpButton.disabled = true;
            powerUpButton.classList.add('opacity-50', 'cursor-not-allowed', 'bg-red-600');
            powerUpButton.classList.remove('bg-yellow-600', 'hover:bg-yellow-500');
            
            // Afficher le temps de cooldown restant
            const cooldownRemaining = Math.ceil((powerUp.cooldown - (now - powerUp.lastUsed)) / 1000);
            powerUpCooldown.textContent = `${cooldownRemaining}s`;
            
            // Mettre à jour la barre de progression du cooldown
            const progressPercentage = ((powerUp.cooldown - (now - powerUp.lastUsed)) / powerUp.cooldown) * 100;
            powerUpProgress.style.width = `${progressPercentage}%`;
            powerUpProgress.classList.add('bg-red-500');
            powerUpProgress.classList.remove('bg-green-500');
            
            // Enlever la classe pour l'effet visuel
            document.body.classList.remove('power-up-active');
        } else {
            // Power-up prêt à être utilisé
            powerUpButton.innerHTML = `<i class="fas fa-bolt mr-1"></i>Activer`;
            powerUpButton.disabled = false;
            powerUpButton.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-red-600');
            powerUpButton.classList.add('bg-yellow-600', 'hover:bg-yellow-500', 'power-up-ready');
            
            // Enlever la classe pour l'effet visuel
            document.body.classList.remove('power-up-active');
        }
    }
    
    // Afficher ou masquer la section de statut
    if (powerUp.unlocked) {
        powerUpStatus.classList.remove('hidden');
    } else {
        powerUpStatus.classList.add('hidden');
    }
}

// Fonction pour activer le power-up
function activatePowerUp() {
    const powerUp = gameState.powerUp.doubleClick;
    
    if (!powerUp.unlocked) {
        // Débloquer le power-up
        if (gameState.stars >= powerUp.cost) {
            gameState.stars -= powerUp.cost;
            powerUp.unlocked = true;
            
            // Jouer un son d'achat (simulé par une animation)
            const container = document.getElementById('power-up-container');
            if (container) {
                container.classList.add('bg-yellow-500/20');
                setTimeout(() => {
                    container.classList.remove('bg-yellow-500/20');
                }, 300);
            }
        }
    } else {
        // Activer le power-up si pas en cooldown
        const now = Date.now();
        if (now - powerUp.lastUsed >= powerUp.cooldown) {
            // Activer l'effet
            powerUp.active = true;
            powerUp.timeRemaining = powerUp.duration;
            
            // Doubler la valeur de clic actuelle
            const originalClickValue = gameState.clickValue;
            gameState.clickValue *= 2;
            
            // Créer un effet d'activation
            document.body.classList.add('power-up-active');
            
            // Créer un effet de flash
            const flash = document.createElement('div');
            flash.className = 'fixed inset-0 bg-yellow-300 opacity-40 z-50 pointer-events-none';
            document.body.appendChild(flash);
            setTimeout(() => {
                flash.remove();
            }, 200);
            
            // Programmer la fin de l'effet
            setTimeout(() => {
                powerUp.active = false;
                powerUp.lastUsed = Date.now();
                gameState.clickValue = originalClickValue;
                document.body.classList.remove('power-up-active');
                updateDisplay();
            }, powerUp.duration);
        }
    }
    
    updateDisplay();
}

// Fonction pour mettre à jour le power-up à chaque frame
function updatePowerUp() {
    const powerUp = gameState.powerUp.doubleClick;
    
    if (powerUp.active) {
        powerUp.timeRemaining -= 16; // 16ms = environ 60fps
        if (powerUp.timeRemaining <= 0) {
            powerUp.active = false;
            powerUp.lastUsed = Date.now();
            
            // Restaurer la valeur de clic d'origine
            gameState.clickValue = 1 + gameState.upgrades[0].owned * gameState.upgrades[0].baseStars;
            document.body.classList.remove('power-up-active');
        }
    }
    
    // Mettre à jour l'affichage si le power-up est débloqué
    if (powerUp.unlocked) {
        updatePowerUpDisplay();
    }
}

// Afficher les améliorations
function renderUpgrades() {
    const upgradesContainer = document.getElementById('upgrades');
    upgradesContainer.innerHTML = '';
    
    gameState.upgrades.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = `upgrade-item bg-purple-900/70 hover:bg-purple-900/90 rounded-lg p-3 cursor-pointer ${gameState.stars >= upgrade.cost ? 'opacity-100' : 'opacity-60'}`;
        upgradeElement.setAttribute('data-id', upgrade.id);
        
        // Calcul de la production pour les améliorations passives
        let productionInfo = '';
        let progressBar = '';
        
        if (upgrade.type === "passive" && upgrade.owned > 0) {
            // Utiliser le temps de remplissage original pour l'affichage
            const originalFillTime = progressionSystem.getFillTime(upgrade.id) / 90000;
            const totalProduction = upgrade.baseStars * upgrade.owned;
            const ratePerSecond = (totalProduction / originalFillTime).toFixed(1);
            
            productionInfo = `
                <div class="text-xs text-purple-200 mt-1">
                    ${ratePerSecond}/sec
                    <span class="text-xs text-purple-400">(${upgrade.baseStars} étoiles × ${upgrade.owned}/${formatSeconds(originalFillTime)})</span>
                </div>
            `;
            
            // Ajouter la barre de progression seulement pour les améliorations qui produisent
            if (upgrade.owned > 0) {
                progressBar = `
                    <div class="progress-bar-container">
                        <div class="progress-bar" data-production="${upgrade.owned}" data-upgrade-id="${upgrade.id}" style="width: 0%"></div>
                    </div>
                `;
            }
        } else if (upgrade.type === "click" && upgrade.owned > 0) {
            const clickBonus = upgrade.baseStars * upgrade.owned;
            productionInfo = `
                <div class="text-xs text-purple-200 mt-1">
                    Bonus de clic: +${formatNumber(clickBonus)}
                </div>
            `;
        }
        
        // Mise à jour de la description pour refléter les valeurs actuelles de baseStars
        let description = upgrade.description;
        if (upgrade.type === "passive") {
            // Remplacer les valeurs dans la description par les valeurs actuelles
            description = description.replace(/\d+ étoiles?/, `${upgrade.baseStars} étoiles`);
        }
        
        upgradeElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fas ${upgrade.icon} text-xl text-yellow-300"></i>
                    <div>
                        <h3 class="font-semibold">${upgrade.name}${upgrade.owned > 0 ? ` lvl.${upgrade.owned}` : ''}</h3>
                        <p class="text-xs text-purple-300">${description}</p>
                        ${productionInfo}
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-yellow-300">${formatNumber(upgrade.cost)} étoiles</div>
                </div>
            </div>
            ${progressBar}
        `;
        
        upgradeElement.addEventListener('click', () => buyUpgrade(upgrade.id));
        upgradesContainer.appendChild(upgradeElement);
    });
}

// Acheter une amélioration
function buyUpgrade(upgradeId) {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    
    if (gameState.stars >= upgrade.cost) {
        gameState.stars -= upgrade.cost;
        upgrade.owned += 1;
        
        // Augmenter le coût pour le prochain achat
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
        
        // Appliquer l'effet de l'amélioration selon son type
        if (upgrade.type === "click") {
            // Améliorations qui affectent la valeur de clic
            // L'aspirateur d'étoiles augmente la valeur de clic de 1 par niveau
            gameState.clickValue = 1 + gameState.upgrades[0].owned * gameState.upgrades[0].baseStars;
        } else if (upgrade.type === "passive") {
            // Améliorations qui génèrent des étoiles passivement
            calculateStarsPerSecond();
        }
        
        // Jouer un son d'achat (simulé par une animation)
        const upgradeElement = document.querySelector(`.upgrade-item[data-id="${upgradeId}"]`);
        if (upgradeElement) {
            upgradeElement.classList.add('bg-yellow-500/20');
            setTimeout(() => {
                upgradeElement.classList.remove('bg-yellow-500/20');
            }, 300);
        }
        
        // Mettre à jour l'affichage
        updateDisplay();
        
        // Recharger les améliorations pour mettre à jour les barres de progression
        renderUpgrades();
        
        // Initialiser immédiatement la barre de progression pour cette amélioration
        setTimeout(() => {
            // Trouver la barre de progression associée à cette amélioration
            const progressBar = document.querySelector(`.progress-bar[data-upgrade-id="${upgradeId}"]`);
            if (progressBar && upgrade.type === "passive") {
                // Initialiser la barre avec le système de progression
                progressionSystem.initBar(upgradeId, upgrade.owned);
            }
        }, 50);
    }
}

// Calculer le nombre d'étoiles par seconde
function calculateStarsPerSecond() {
    gameState.starsPerSecond = 0;
    
    gameState.upgrades
        .filter(u => u.type === "passive" && u.owned > 0)
        .forEach(u => {
            // Calculer les étoiles par seconde en fonction du temps de remplissage original
            const originalFillTime = progressionSystem.getFillTime(u.id) / 90000;
            
            // Le nombre d'étoiles générées par seconde est baseStars × niveau divisé par le temps original
            const starsPerSec = (u.baseStars * u.owned) / originalFillTime;
            gameState.starsPerSecond += starsPerSec;
        });
    
    // Arrondir à 1 décimale pour éviter les problèmes d'affichage
    gameState.starsPerSecond = parseFloat(gameState.starsPerSecond.toFixed(1));
}

// Gestion du clic
function handleClick(event) {
    // Ajouter des étoiles
    gameState.stars += gameState.clickValue;
    gameState.totalStars += gameState.clickValue;
    
    // Créer un effet de clic
    const clickEffect = document.createElement('div');
    clickEffect.className = 'click-effect';
    clickEffect.style.left = `${event.clientX - 10}px`;
    clickEffect.style.top = `${event.clientY - 10}px`;
    document.body.appendChild(clickEffect);
    
    // Supprimer l'effet après l'animation
    setTimeout(() => {
        clickEffect.remove();
    }, 600);
    
    // Animation d'étoile qui rejoint le compteur lors du clic
    const counter = document.querySelector('.flex.items-center.gap-4.mb-4');
    const counterRect = counter.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const endX = counterRect.left + counterRect.width/2 - startX;
    const endY = counterRect.top + counterRect.height/2 - startY;
    
    // Créer une étoile qui va vers le compteur
    const star = document.createElement('div');
    star.className = 'star-to-counter';
    star.innerHTML = `<i class="fas fa-star"></i>`;
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    star.style.setProperty('--endX', `${endX}px`);
    star.style.setProperty('--endY', `${endY}px`);
    document.body.appendChild(star);
    
    star.addEventListener('animationend', () => {
        star.remove();
    });
    
    updateDisplay();
}

// Mettre à jour les barres de progression
function updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    const now = Date.now();
    
    // Tableau pour stocker les étoiles à générer
    const starsToGenerate = [];
    
    progressBars.forEach(bar => {
        try {
            const upgradeId = parseInt(bar.getAttribute('data-upgrade-id') || '0');
            
            // Si pas d'ID d'amélioration, ignorer
            if (!upgradeId) {
                bar.style.width = '0%';
                return;
            }
            
            // Obtenir l'amélioration correspondante
            const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
            if (!upgrade || upgrade.owned <= 0) {
                bar.style.width = '0%';
                return;
            }
            
            // Initialiser l'état de progression si nécessaire
            if (!progressionSystem.progressState[upgradeId]) {
                progressionSystem.initBar(upgradeId, upgrade.owned);
            }
            
            // Calculer le temps écoulé
            const lastUpdate = progressionSystem.progressState[upgradeId].lastUpdate;
            const timeElapsed = now - lastUpdate;
            
            // Mettre à jour la progression
            const generatedStars = progressionSystem.updateProgress(upgradeId, timeElapsed);
            
            // Si des étoiles ont été générées, les ajouter à la liste
            if (generatedStars) {
                starsToGenerate.push({
                    upgradeId: upgradeId,
                    count: generatedStars,
                    baseStars: upgrade.baseStars,
                    level: upgrade.owned,
                    totalProduction: upgrade.baseStars * upgrade.owned
                });
                
                // Forcer la réinitialisation visuelle de la barre sans transition
                bar.classList.add('progress-reset');
                bar.style.width = '0%';
                
                // Petit délai pour permettre au navigateur de voir le changement
                setTimeout(() => {
                    bar.classList.remove('progress-reset');
                    // Progression strictement à 0 après réinitialisation
                    bar.style.width = '0%';
                    
                    // Forcer un redraw du navigateur
                    void bar.offsetWidth;
                    
                    // Puis mettre à jour avec la progression actuelle
                    requestAnimationFrame(() => {
                        const progress = progressionSystem.getProgress(upgradeId);
                        bar.style.width = `${progress}%`;
                    });
                }, 20);
            } else {
                // Mise à jour normale avec animation linéaire
                // Utiliser requestAnimationFrame pour des animations plus fluides
                requestAnimationFrame(() => {
                    const progress = progressionSystem.getProgress(upgradeId);
                    bar.style.width = `${progress}%`;
                });
            }
            
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la barre de progression:", error);
        }
    });
    
    // Générer les étoiles une fois que toutes les barres sont mises à jour
    starsToGenerate.forEach(item => {
        // Ajouter immédiatement toutes les étoiles au compteur
        gameState.stars += item.count;
        gameState.totalStars += item.count;
        
        // Créer exactement le nombre d'animations d'étoiles correspondant à la production totale (baseStars × niveau)
        const animationCount = item.totalProduction;
        
        // Adapter le délai entre les animations en fonction du nombre total
        const delayBetweenAnimations = animationCount > 100 ? 10 : 
                                       animationCount > 50 ? 20 : 
                                       animationCount > 20 ? 30 : 50;
        
        for (let i = 0; i < animationCount; i++) {
            // Créer une animation d'étoile avec un léger délai entre chaque
            setTimeout(() => {
                createStarAnimation();
            }, i * delayBetweenAnimations);
        }
        
        // Mettre à jour l'affichage une seule fois après l'ajout de toutes les étoiles
        updateDisplay();
    });
}

// Boucle de jeu pour les gains automatiques
function gameLoop() {
    // Mettre à jour les barres de progression qui génèrent des étoiles
    updateProgressBars();
    
    // Mettre à jour le power-up
    updatePowerUp();
}

// Fonction pour créer une animation d'étoile
function createStarAnimation() {
    const counter = document.querySelector('.flex.items-center.gap-4.mb-4');
    const counterRect = counter.getBoundingClientRect();
    
    // Position de départ aléatoire sur les bords de l'écran
    let startX, startY;
    const side = Math.floor(Math.random() * 4); // 0: haut, 1: droite, 2: bas, 3: gauche
    
    switch(side) {
        case 0: // haut
            startX = Math.random() * window.innerWidth;
            startY = -20;
            break;
        case 1: // droite
            startX = window.innerWidth + 20;
            startY = Math.random() * window.innerHeight;
            break;
        case 2: // bas
            startX = Math.random() * window.innerWidth;
            startY = window.innerHeight + 20;
            break;
        case 3: // gauche
            startX = -20;
            startY = Math.random() * window.innerHeight;
            break;
    }
    
    const endX = counterRect.left + counterRect.width/2 - startX;
    const endY = counterRect.top + counterRect.height/2 - startY;
    
    const star = document.createElement('div');
    star.className = 'star-to-counter';
    star.innerHTML = `<i class="fas fa-star"></i>`;
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    star.style.setProperty('--endX', `${endX}px`);
    star.style.setProperty('--endY', `${endY}px`);
    document.body.appendChild(star);
    
    // Attendre la fin de l'animation pour incrémenter le compteur
    star.addEventListener('animationend', () => {
        star.remove();
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le jeu
    createStars();
    renderUpgrades();
    
    // Calculer les valeurs initiales
    const clickUpgrades = gameState.upgrades.filter(u => u.type === "click");
    if (clickUpgrades.length > 0 && clickUpgrades[0].owned > 0) {
        gameState.clickValue = 1 + clickUpgrades[0].owned * clickUpgrades[0].baseStars;
    }
    
    // Calculer les étoiles par seconde
    calculateStarsPerSecond();
    
    // Initialiser les barres de progression
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-bar');
        if (progressBars.length > 0) {
            progressBars.forEach(bar => {
                const upgradeId = parseInt(bar.getAttribute('data-upgrade-id') || '0');
                
                if (upgradeId) {
                    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
                    if (upgrade && upgrade.owned > 0) {
                        // Initialiser la barre avec le niveau de l'amélioration
                        progressionSystem.initBar(upgradeId, upgrade.owned);
                    }
                }
            });
        }
        
        // Première mise à jour des barres
        updateProgressBars();
    }, 100);
    
    // Gestion du clic
    document.getElementById('clicker').addEventListener('click', handleClick);
    
    // Gestion du power-up
    document.getElementById('power-up-button').addEventListener('click', activatePowerUp);
    
    // Boucle de jeu (mise à jour à 60fps pour animation parfaitement fluide)
    setInterval(gameLoop, 16);
    
    // Mettre à jour l'affichage initial
    updateDisplay();
}); 