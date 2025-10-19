const mainMenu = document.getElementById('main-menu');
const startGameButton = document.getElementById('start-game');
const gameCanvas = document.getElementById('game-canvas');

let gameRunning = false;
let scene, camera, renderer, playerCar, pitStop;
const keys = {};
const opponents = [];

window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

function startGame() {
    mainMenu.style.display = 'none';
    gameCanvas.style.display = 'block';
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    gameRunning = true;
    init();
    animate();
}

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: gameCanvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);

    // Racetrack
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const trackGeometry = new THREE.PlaneGeometry(20, 100);
    const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.01; // Place it slightly above the ground to avoid z-fighting
    scene.add(track);

    // Player's car
    const carGeometry = new THREE.BoxGeometry(2, 1, 4);
    const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    playerCar = new THREE.Mesh(carGeometry, carMaterial);
    playerCar.position.y = 0.5;
    playerCar.pitStopTime = 0;
    playerCar.speed = 0.1;
    scene.add(playerCar);

    // Opponent cars
    const numOpponents = 20;
    const carGeometry = new THREE.BoxGeometry(2, 1, 4);
    for (let i = 0; i < numOpponents; i++) {
        const carMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const opponentCar = new THREE.Mesh(carGeometry, carMaterial);
        opponentCar.position.y = 0.5;
        opponentCar.position.x = (Math.random() - 0.5) * 18;
        opponentCar.position.z = (Math.random() - 0.5) * 100;
        opponents.push(opponentCar);
        scene.add(opponentCar);
    }

    // Pit stop
    const pitStopGeometry = new THREE.BoxGeometry(10, 1, 20);
    const pitStopMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    pitStop = new THREE.Mesh(pitStopGeometry, pitStopMaterial);
    pitStop.position.set(15, 0.5, 0);
    scene.add(pitStop);
}

function animate() {
    if (!gameRunning) return;
    requestAnimationFrame(animate);

    // Car controls
    const rotationSpeed = 0.05;

    if (playerCar.pitStopTime > 0) {
        playerCar.pitStopTime--;
    } else {
        if (keys['ArrowUp']) {
            playerCar.position.x -= Math.sin(playerCar.rotation.y) * playerCar.speed;
            playerCar.position.z -= Math.cos(playerCar.rotation.y) * playerCar.speed;
        }
        if (keys['ArrowDown']) {
            playerCar.position.x += Math.sin(playerCar.rotation.y) * playerCar.speed;
            playerCar.position.z += Math.cos(playerCar.rotation.y) * playerCar.speed;
        }
    if (keys['ArrowLeft']) {
        playerCar.rotation.y += rotationSpeed;
    }
    if (keys['ArrowRight']) {
        playerCar.rotation.y -= rotationSpeed;
    }
}

    // Camera follow
    camera.position.x = playerCar.position.x;
    camera.position.z = playerCar.position.z + 20;
    camera.lookAt(playerCar.position);

    // Pit stop collision
    const playerBox = new THREE.Box3().setFromObject(playerCar);
    const pitStopBox = new THREE.Box3().setFromObject(pitStop);
    if (playerBox.intersectsBox(pitStopBox)) {
        playerCar.pitStopTime = 180; // 3 seconds at 60fps
        playerCar.speed = 0.2; // Speed boost
    } else {
        playerCar.speed = 0.1; // Reset speed
    }

    // Opponent car movement
    opponents.forEach(opponent => {
        opponent.position.z += 0.05;
        if (opponent.position.z > 50) {
            opponent.position.z = -50;
            opponent.position.x = (Math.random() - 0.5) * 18;
        }
    });

    renderer.render(scene, camera);
}

startGameButton.addEventListener('click', startGame);
