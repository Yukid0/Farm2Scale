// Variables du jeu
let gameState = {
    coins: 0,
    coinsPerClick: 1,
    coinsPerSecond: 0,
    lastSave: Date.now(),
    totalClicks: 0,
    totalCoinsEarned: 0,
    startTime: Date.now(),
    achievements: [],
    upgrades: [
        {
            id: 1,
            name: "Petit pot",
            description: "Augmente les pièces par clic de 1",
            baseCost: 10,
            costMultiplier: 1.1,
            level: 0,
            effect: () => { gameState.coinsPerClick += 1; }
        },
        {
            id: 2,
            name: "Tirelire",
            description: "+1 pièce par seconde",
            baseCost: 25,
            costMultiplier: 1.15,
            level: 0,
            effect: () => { gameState.coinsPerSecond += 1; }
        },
        {
            id: 3,
            name: "Coffre-fort",
            description: "+5 pièces par seconde",
            baseCost: 100,
            costMultiplier: 1.2,
            level: 0,
            effect: () => { gameState.coinsPerSecond += 5; }
        },
        {
            id: 4,
            name: "Banque",
            description: "+25 pièces par seconde",
            baseCost: 500,
            costMultiplier: 1.25,
            level: 0,
            effect: () => { gameState.coinsPerSecond += 25; }
        },
        {
            id: 5,
            name: "Mine d'or",
            description: "+100 pièces par seconde",
            baseCost: 2500,
            costMultiplier: 1.3,
            level: 0,
            effect: () => { gameState.coinsPerSecond += 100; }
        },
        {
            id: 6,
            name: "Super clic",
            description: "Double les pièces par clic",
            baseCost: 1000,
            costMultiplier: 2,
            level: 0,
            effect: () => { gameState.coinsPerClick *= 2; }
        },
        {
            id: 7,
            name: "Machine à pièces",
            description: "+500 pièces par seconde",
            baseCost: 10000,
            costMultiplier: 1.4,
            level: 0,
            effect: () => { gameState.coinsPerSecond += 500; }
        }
    ]
};

// Éléments du DOM
const coinsElement = document.getElementById('coins');
const coinsPerSecondElement = document.getElementById('coins-per-second');
const coinsPerClickElement = document.getElementById('coins-per-click');
const clickerButton = document.getElementById('clicker');
const upgradesList = document.getElementById('upgrades-list');
const saveButton = document.getElementById('save-button');
const resetButton = document.getElementById('reset-button');
const statsButton = document.getElementById('stats-button');
const coinImage = document.getElementById('coin-image');
const statsModal = document.getElementById('stats-modal');
const closeModal = document.querySelector('.close-modal');
const totalCoinsElement = document.getElementById('total-coins');
const totalClicksElement = document.getElementById('total-clicks');
const playTimeElement = document.getElementById('play-time');

// Précharger l'image de la pièce
function preloadCoinImage() {
    // Vérifier si l'image est déjà chargée
    if (coinImage.complete && coinImage.naturalHeight !== 0) {
        return;
    }
    
    // Si l'image n'est pas chargée correctement, créer une image temporaire
    coinImage.onerror = function() {
        createTemporaryCoin();
    };
    
    // Essayer de charger l'image
    coinImage.src = 'images/coin.png';
}

// Initialisation du jeu
function initGame() {
    preloadCoinImage();
    loadGame();
    renderUpgrades();
    updateDisplay();
    setupEventListeners();
    startGameLoop();
    
    // Petit effet d'animation au démarrage
    gsapFallInElements();
}

// Animation d'entrée avec GSAP (simulation si GSAP n'est pas disponible)
function gsapFallInElements() {
    // Si GSAP est disponible, utiliser ses animations
    if (typeof gsap !== 'undefined') {
        gsap.from('.header', { y: -50, opacity: 0, duration: 0.8, ease: 'back.out' });
        gsap.from('.clicker-area', { scale: 0.5, opacity: 0, duration: 0.8, delay: 0.2, ease: 'back.out(1.7)' });
        gsap.from('.upgrades-container', { x: 50, opacity: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' });
        gsap.from('.footer', { y: 30, opacity: 0, duration: 0.8, delay: 0.6, ease: 'power2.out' });
    } else {
        // Sinon, utiliser des animations CSS simples
        const elements = ['.header', '.clicker-area', '.upgrades-container', '.footer'];
        elements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            element.style.opacity = '0';
            element.style.transform = selector === '.clicker-area' ? 'scale(0.5)' : 'translateY(30px)';
            element.style.transition = 'opacity 0.8s, transform 0.8s';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'none';
            }, 100 + index * 200);
        });
    }
}

// Mettre à jour l'affichage
function updateDisplay() {
    coinsElement.textContent = formatNumber(gameState.coins);
    coinsPerSecondElement.textContent = formatNumber(gameState.coinsPerSecond);
    coinsPerClickElement.textContent = formatNumber(gameState.coinsPerClick);
    
    // Mettre à jour le titre de la page avec le nombre de pièces
    document.title = `${formatNumber(gameState.coins)} pièces - Farm & Scale`;
    
    // Mettre à jour les statistiques si le modal est visible
    if (statsModal.classList.contains('show')) {
        updateStats();
    }
}

// Mettre à jour les statistiques
function updateStats() {
    totalCoinsElement.textContent = formatNumber(gameState.totalCoinsEarned);
    totalClicksElement.textContent = formatNumber(gameState.totalClicks);
    
    // Calculer le temps de jeu
    const currentTime = Date.now();
    const playTimeInMinutes = Math.floor((currentTime - gameState.startTime) / 60000);
    
    if (playTimeInMinutes < 60) {
        playTimeElement.textContent = `${playTimeInMinutes} minute${playTimeInMinutes !== 1 ? 's' : ''}`;
    } else {
        const hours = Math.floor(playTimeInMinutes / 60);
        const minutes = playTimeInMinutes % 60;
        playTimeElement.textContent = `${hours} heure${hours !== 1 ? 's' : ''} et ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
}

// Formater les grands nombres
function formatNumber(num) {
    if (num < 1000) {
        return Math.floor(num).toString();
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num < 1000000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else {
        return (num / 1000000000000).toFixed(1) + 'T';
    }
}

// Créer les éléments d'amélioration
function renderUpgrades() {
    upgradesList.innerHTML = '';
    
    gameState.upgrades.forEach(upgrade => {
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
        
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade-item';
        upgradeElement.dataset.id = upgrade.id;
        
        if (gameState.coins < cost) {
            upgradeElement.classList.add('disabled');
        }
        
        upgradeElement.innerHTML = `
            <div class="upgrade-info">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-description">${upgrade.description}</span>
            </div>
            <div class="upgrade-details">
                <span class="upgrade-cost">${formatNumber(cost)} pièces</span>
                <span class="upgrade-level">Niv. ${upgrade.level}</span>
            </div>
        `;
        
        upgradeElement.addEventListener('click', () => buyUpgrade(upgrade.id));
        upgradesList.appendChild(upgradeElement);
    });
}

// Acheter une amélioration
function buyUpgrade(upgradeId) {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    
    if (gameState.coins >= cost) {
        // Animation d'achat
        const upgradeElement = document.querySelector(`.upgrade-item[data-id="${upgradeId}"]`);
        if (upgradeElement) {
            upgradeElement.classList.add('buying');
            setTimeout(() => {
                upgradeElement.classList.remove('buying');
            }, 300);
        }
        
        gameState.coins -= cost;
        upgrade.level++;
        upgrade.effect();
        
        // Son d'achat si disponible
        playSound('purchase');
        
        updateDisplay();
        renderUpgrades();
        saveGame();
    } else {
        // Secouer l'élément pour indiquer qu'il n'y a pas assez de pièces
        const upgradeElement = document.querySelector(`.upgrade-item[data-id="${upgradeId}"]`);
        if (upgradeElement) {
            upgradeElement.classList.add('shake');
            setTimeout(() => {
                upgradeElement.classList.remove('shake');
            }, 500);
        }
        
        // Son d'erreur si disponible
        playSound('error');
    }
}

// Jouer un son
function playSound(soundName) {
    // Si un système audio est implémenté plus tard
    // const sound = new Audio(`sounds/${soundName}.mp3`);
    // sound.volume = 0.3;
    // sound.play().catch(e => console.log('Audio play error:', e));
}

// Animation de clic
function createFloatingNumber(x, y, amount) {
    const floatingNumber = document.createElement('div');
    floatingNumber.className = 'floating-number';
    floatingNumber.textContent = `+${amount}`;
    floatingNumber.style.left = `${x}px`;
    floatingNumber.style.top = `${y}px`;
    
    // Ajouter une légère variation à la position et à l'angle
    const randomX = (Math.random() * 40) - 20;
    const randomRotate = (Math.random() * 40) - 20;
    floatingNumber.style.transform = `translateX(${randomX}px) rotate(${randomRotate}deg)`;
    
    document.body.appendChild(floatingNumber);
    
    setTimeout(() => {
        floatingNumber.remove();
    }, 1500);
}

// Animation de la pièce
function animateCoinClick() {
    coinImage.style.transform = 'scale(0.8) rotate(20deg)';
    setTimeout(() => {
        coinImage.style.transform = '';
    }, 150);
}

// Afficher/masquer le modal de statistiques
function toggleStatsModal() {
    if (statsModal.classList.contains('show')) {
        statsModal.classList.remove('show');
    } else {
        updateStats();
        statsModal.classList.add('show');
    }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    clickerButton.addEventListener('click', (e) => {
        gameState.coins += gameState.coinsPerClick;
        gameState.totalClicks++;
        gameState.totalCoinsEarned += gameState.coinsPerClick;
        
        // Animations
        animateCoinClick();
        
        // Animation de clic
        const rect = clickerButton.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        createFloatingNumber(x, y, gameState.coinsPerClick);
        
        // Son de clic si disponible
        playSound('click');
        
        updateDisplay();
        renderUpgrades();
    });
    
    saveButton.addEventListener('click', () => {
        saveGame();
        
        // Afficher un message de sauvegarde
        const saveMessage = document.createElement('div');
        saveMessage.className = 'save-message';
        saveMessage.textContent = 'Jeu sauvegardé!';
        document.body.appendChild(saveMessage);
        
        setTimeout(() => {
            saveMessage.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            saveMessage.classList.remove('show');
            setTimeout(() => {
                saveMessage.remove();
            }, 500);
        }, 2000);
    });
    
    resetButton.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser votre progression?')) {
            resetGame();
        }
    });
    
    // Bouton des statistiques
    statsButton.addEventListener('click', toggleStatsModal);
    
    // Fermer le modal
    closeModal.addEventListener('click', () => {
        statsModal.classList.remove('show');
    });
    
    // Fermer le modal en cliquant en dehors
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) {
            statsModal.classList.remove('show');
        }
    });
    
    // Double-clic sur la pièce pour un bonus aléatoire (1-5 fois le montant par clic)
    clickerButton.addEventListener('dblclick', (e) => {
        e.preventDefault();
        const bonusMultiplier = Math.floor(Math.random() * 5) + 1;
        const bonusAmount = gameState.coinsPerClick * bonusMultiplier;
        
        gameState.coins += bonusAmount;
        gameState.totalCoinsEarned += bonusAmount;
        
        // Animation spéciale pour le bonus
        const rect = clickerButton.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        const bonusNumber = document.createElement('div');
        bonusNumber.className = 'floating-number bonus';
        bonusNumber.textContent = `BONUS! +${bonusAmount}`;
        bonusNumber.style.left = `${x}px`;
        bonusNumber.style.top = `${y}px`;
        bonusNumber.style.fontSize = '1.6rem';
        bonusNumber.style.color = '#ff9900';
        
        document.body.appendChild(bonusNumber);
        
        setTimeout(() => {
            bonusNumber.remove();
        }, 2000);
        
        // Son de bonus si disponible
        playSound('bonus');
        
        updateDisplay();
        renderUpgrades();
    });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        // Espace pour cliquer
        if (e.code === 'Space') {
            clickerButton.click();
        }
        
        // S pour sauvegarder
        if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            saveButton.click();
        }
        
        // Echap pour fermer le modal
        if (e.code === 'Escape' && statsModal.classList.contains('show')) {
            statsModal.classList.remove('show');
        }
    });
}

// Boucle principale du jeu
function startGameLoop() {
    let lastTime = Date.now();
    
    function gameLoop() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000; // en secondes
        
        // Ajouter les pièces par seconde
        gameState.coins += gameState.coinsPerSecond * deltaTime;
        gameState.totalCoinsEarned += gameState.coinsPerSecond * deltaTime;
        
        updateDisplay();
        
        // Mettre à jour les améliorations si nécessaire
        if (currentTime - lastTime > 500) {
            renderUpgrades();
        }
        
        // Sauvegarder automatiquement toutes les 30 secondes
        if (currentTime - gameState.lastSave > 30000) {
            saveGame();
            gameState.lastSave = currentTime;
        }
        
        lastTime = currentTime;
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

// Sauvegarder le jeu
function saveGame() {
    localStorage.setItem('clickerGameState', JSON.stringify(gameState));
    gameState.lastSave = Date.now();
}

// Charger le jeu
function loadGame() {
    const savedGame = localStorage.getItem('clickerGameState');
    
    if (savedGame) {
        try {
            const parsedState = JSON.parse(savedGame);
            
            // Calculer les pièces gagnées pendant l'absence du joueur
            const offlineTime = (Date.now() - (parsedState.lastSave || Date.now())) / 1000;
            const offlineEarnings = Math.floor(parsedState.coinsPerSecond * offlineTime);
            
            // Fusionner l'état sauvegardé avec l'état par défaut
            gameState.coins = (parsedState.coins || 0) + offlineEarnings;
            gameState.coinsPerClick = parsedState.coinsPerClick || 1;
            gameState.coinsPerSecond = parsedState.coinsPerSecond || 0;
            gameState.totalClicks = parsedState.totalClicks || 0;
            gameState.totalCoinsEarned = (parsedState.totalCoinsEarned || 0) + offlineEarnings;
            gameState.startTime = parsedState.startTime || Date.now();
            gameState.achievements = parsedState.achievements || [];
            
            // Charger les niveaux d'amélioration
            if (parsedState.upgrades) {
                parsedState.upgrades.forEach((savedUpgrade, index) => {
                    if (index < gameState.upgrades.length) {
                        gameState.upgrades[index].level = savedUpgrade.level || 0;
                    }
                });
            }
            
            // Réinitialiser les stats par clic et par seconde
            gameState.coinsPerClick = 1;
            gameState.coinsPerSecond = 0;
            
            // Réappliquer les effets des améliorations
            gameState.upgrades.forEach(upgrade => {
                for (let i = 0; i < upgrade.level; i++) {
                    upgrade.effect();
                }
            });
            
            // Afficher un message pour les gains hors ligne si significatifs
            if (offlineEarnings > 0) {
                setTimeout(() => {
                    showOfflineEarnings(offlineEarnings, offlineTime);
                }, 1000);
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement de la sauvegarde:', error);
        }
    }
}

// Afficher les gains hors ligne
function showOfflineEarnings(earnings, time) {
    if (earnings < 1) return;
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    
    let timeText = '';
    if (hours > 0) {
        timeText = `${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        timeText = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    const offlineMessage = document.createElement('div');
    offlineMessage.className = 'offline-earnings';
    offlineMessage.innerHTML = `
        <h3>Gains pendant votre absence</h3>
        <p>Vous avez gagné <strong>${formatNumber(earnings)} pièces</strong> pendant votre absence de ${timeText}!</p>
        <button id="claim-offline">Super!</button>
    `;
    
    document.body.appendChild(offlineMessage);
    
    setTimeout(() => {
        offlineMessage.classList.add('show');
    }, 100);
    
    document.getElementById('claim-offline').addEventListener('click', () => {
        offlineMessage.classList.remove('show');
        setTimeout(() => {
            offlineMessage.remove();
        }, 500);
    });
}

// Réinitialiser le jeu
function resetGame() {
    gameState = {
        coins: 0,
        coinsPerClick: 1,
        coinsPerSecond: 0,
        lastSave: Date.now(),
        totalClicks: 0,
        totalCoinsEarned: 0,
        startTime: Date.now(),
        achievements: [],
        upgrades: gameState.upgrades.map(upgrade => ({
            ...upgrade,
            level: 0
        }))
    };
    
    saveGame();
    updateDisplay();
    renderUpgrades();
    
    // Effet visuel de réinitialisation
    const gameContainer = document.querySelector('.game-container');
    gameContainer.classList.add('reset-effect');
    setTimeout(() => {
        gameContainer.classList.remove('reset-effect');
    }, 1000);
}

// Créer une pièce temporaire si l'image n'est pas disponible
function createTemporaryCoin() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    // Dessiner un cercle doré
    ctx.beginPath();
    ctx.arc(100, 100, 90, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#daa520';
    ctx.stroke();
    
    // Dessiner un cercle intérieur
    ctx.beginPath();
    ctx.arc(100, 100, 75, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#daa520';
    ctx.stroke();
    
    // Dessiner le symbole € au centre
    ctx.font = 'bold 120px Arial';
    ctx.fillStyle = '#daa520';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('€', 100, 95);
    
    // Ajouter des reflets
    ctx.beginPath();
    ctx.arc(70, 70, 15, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(130, 130, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    
    // Définir l'image du coin
    coinImage.src = canvas.toDataURL();
}

// Ajouter des styles CSS dynamiques
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .offline-earnings {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background-color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            text-align: center;
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 90%;
            width: 400px;
        }
        
        .offline-earnings.show {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .offline-earnings h3 {
            color: #4a6fa5;
            margin-bottom: 10px;
        }
        
        .offline-earnings p {
            margin-bottom: 15px;
        }
        
        .offline-earnings button {
            background-color: #4a6fa5;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .save-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        }
        
        .save-message.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .reset-effect {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
        
        .upgrade-item.buying {
            animation: pulse-buy 0.3s ease;
        }
        
        @keyframes pulse-buy {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); background-color: #e7f5ff; }
            100% { transform: scale(1); }
        }
        
        .upgrade-item.shake {
            animation: shake 0.5s ease-in-out;
        }
    `;
    document.head.appendChild(style);
}

// Ajouter les styles CSS dynamiques
addDynamicStyles();

// Démarrer le jeu lorsque la page est chargée
document.addEventListener('DOMContentLoaded', initGame); 