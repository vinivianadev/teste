import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const scene = new THREE.Scene();
const fov = 100;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 15, 40);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Superfície base
const planeSize = 400;
const loader = new THREE.TextureLoader();
const groundTexture = loader.load('resources/images/asphalt.jpg');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(40, 40);
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Carregamento de objetos 3D
const objLoader = new OBJLoader();
const carModels = [
    'resources/cars/koenigsegg.obj',
    'resources/cars/supercar.obj',
    'resources/cars/humvee.obj'
];

// Cores personalizadas para cada carro
const carColors = [
    new THREE.Color(0x55bb66), // Vermelho para o Koenigsegg
    new THREE.Color(0x6666ee), // Verde para o Supercar
    new THREE.Color(0xdd6644)  // Azul para o Humvee
];

const cars = []; // Armazenar os carros carregados

// Função para ajustar a escala e aplicar cor
function adjustScaleAndColor(object, targetSize, color) {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scaleFactor = targetSize / maxDimension;
    object.scale.set(scaleFactor, scaleFactor, scaleFactor);

    object.position.sub(center.multiplyScalar(scaleFactor));
    object.position.y += 1; // Deslocamento no eixo Y

    // Aplicar cor ao material
    object.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.6, // Definindo o brilho metálico
                roughness: 0.3 // Definindo a rugosidade
            });
        }
    });
}

// Carregar os carros e aplicar cores
carModels.forEach((objPath, index) => {
    const color = carColors[index]; // Cor personalizada de cada carro
    objLoader.load(
        objPath,
        (object) => {
            adjustScaleAndColor(object, 10, color); // Ajusta escala e aplica cor
            object.position.x = (index - 1) * 30;
            object.position.z = 0;
            object.castShadow = true;
            cars.push(object); // Armazenar o objeto do carro
            scene.add(object);
        },
        undefined,
        (error) => {
            console.error('Erro ao carregar o modelo:', error);
        }
    );
});

// Iluminação

// Adicionar luz direcional bem suave
const directionalLight = new THREE.DirectionalLight(0x555555, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);


// Adicionar pontos de luz (PointLights)
const pointLight1 = new THREE.PointLight(0xFFFFFF, 1500, 1000); // cor, intensidade, distância máxima
pointLight1.position.set(0, 20, 0); // Posicionando a luz em algum ponto da cena
pointLight1.castShadow = true; // Faz a luz projetar sombras
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xFFFFaa, 1500, 100);
pointLight2.position.set(100, 20, 100);
pointLight2.castShadow = true;
scene.add(pointLight2);

const pointLight9 = new THREE.PointLight(0xFFFFaa, 500, 100);
pointLight9.position.set(100, 20, 50);
pointLight9.castShadow = true;
scene.add(pointLight9);

const pointLight3 = new THREE.PointLight(0xFFaaFF, 1500, 100);
pointLight3.position.set(100, 20, -100);
pointLight3.castShadow = true;
scene.add(pointLight3);

const pointLight4 = new THREE.PointLight(0xaaFFFF, 1500, 100);
pointLight4.position.set(-100, 20, -100);
pointLight4.castShadow = true;
scene.add(pointLight4);

const pointLight5 = new THREE.PointLight(0xaaaaaa, 1500, 100);
pointLight5.position.set(-100, 20, 100);
pointLight5.castShadow = true;
scene.add(pointLight5);

const pointLight6 = new THREE.PointLight(0xFFaaFF, 500, 100);
pointLight6.position.set(50, 20, -100);
pointLight6.castShadow = true;
scene.add(pointLight6);

const pointLight7 = new THREE.PointLight(0xaaFFFF, 500, 100);
pointLight7.position.set(-50, 20, -100);
pointLight7.castShadow = true;
scene.add(pointLight7);

const pointLight8 = new THREE.PointLight(0xaaaaaa, 500, 100);
pointLight8.position.set(-50, 20, 100);
pointLight8.castShadow = true;
scene.add(pointLight8);

// Sistema de navegação
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.enablePan = true;

// Variáveis de controle
const carSpeed = 1.5; // Velocidade de movimento dos carros
const rotationSpeed = Math.PI / 30; // Velocidade de rotação dos carros

// Variáveis para armazenar o estado das teclas pressionadas
const keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

// Função para mover os carros
function moveCars() {
    cars.forEach(car => {
        const direction = new THREE.Vector3();
        car.getWorldDirection(direction); // Obtém a direção em que o carro está olhando
        direction.y = 0; // Ignora o eixo Y
        direction.normalize(); // Normaliza a direção

        // Movimentos combinados
        if (keys.up && keys.right) {
            car.position.add(direction.multiplyScalar(carSpeed)); // Move para frente
            car.rotation.y -= rotationSpeed; // Gira para a direita
        } else if (keys.up && keys.left) {
            car.position.add(direction.multiplyScalar(carSpeed)); // Move para frente
            car.rotation.y += rotationSpeed; // Gira para a esquerda
        } else if (keys.down && keys.right) {
            car.position.sub(direction.multiplyScalar(carSpeed)); // Move para trás
            car.rotation.y -= rotationSpeed; // Gira para a direita
        } else if (keys.down && keys.left) {
            car.position.sub(direction.multiplyScalar(carSpeed)); // Move para trás
            car.rotation.y += rotationSpeed; // Gira para a esquerda
        } else if (keys.up) {
            car.position.add(direction.multiplyScalar(carSpeed)); // Move para frente
        } else if (keys.down) {
            car.position.sub(direction.multiplyScalar(carSpeed)); // Move para trás
        } else if (keys.right) {
            car.rotation.y -= rotationSpeed; // Gira para a direita
        } else if (keys.left) {
            car.rotation.y += rotationSpeed; // Gira para a esquerda
        }
    });
}

// Listener para as teclas pressionadas
function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp': 
            keys.up = true;
            break;
        case 'ArrowDown': 
            keys.down = true;
            break;
        case 'ArrowLeft': 
            keys.left = true;
            break;
        case 'ArrowRight': 
            keys.right = true;
            break;
    }
}

// Listener para as teclas soltas
function handleKeyUp(event) {
    switch (event.key) {
        case 'ArrowUp': 
            keys.up = false;
            break;
        case 'ArrowDown': 
            keys.down = false;
            break;
        case 'ArrowLeft': 
            keys.left = false;
            break;
        case 'ArrowRight': 
            keys.right = false;
            break;
    }
}

function createObstacles() {
    const obstacles = [];
    for (let i = 0; i < 20; i++) {
        const size = Math.random() * 20 + 2;
        const x = Math.random() * planeSize - planeSize / 2;
        const z = Math.random() * planeSize - planeSize / 2;
        const obstacleGeometry = new THREE.BoxGeometry(size, size, size);
        const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        obstacle.position.set(x, size / 2, z); // Ajuste a posição corretamente
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        scene.add(obstacle);
        obstacles.push(obstacle); // Armazenando obstáculos no array
    }
    return obstacles;
}

// Função de detecção de colisões
function detectCollisions() {
    cars.forEach(car => {
        obstacles.forEach(obstacle => {
            const carBox = new THREE.Box3().setFromObject(car);
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);

            // Calculando a distância entre as caixas
            const carCenter = carBox.getCenter(new THREE.Vector3());
            const obstacleCenter = obstacleBox.getCenter(new THREE.Vector3());

            const distance = carCenter.distanceTo(obstacleCenter);
            const sizeSum = (carBox.getSize(new THREE.Vector3()).x / 2) + (obstacleBox.getSize(new THREE.Vector3()).x / 2);

            // Detectando colisão
            if (distance < sizeSum) {
                console.log("Colisão detectada!");
                
                // Exibir uma mensagem de alerta
                alert("Colisão detectada! O jogo será reiniciado.");

                // Chamar a função para reiniciar o jogo
                resetGame();
            }
        });
    });
}

// Chamar a função para criar os obstáculos
const obstacles = createObstacles();

function resetGame() {

    // Remover carros antigos da cena
    cars.forEach(car => {
        scene.remove(car);
    });
    cars.length = 0; // Limpar a lista de carros

    carModels.forEach((objPath, index) => {
        const color = carColors[index]; // Cor personalizada de cada carro
        objLoader.load(
            objPath,
            (object) => {
                adjustScaleAndColor(object, 10, color); // Ajusta escala e aplica cor
                object.position.x = (index - 1) * 40;
                object.position.z = 0;
                object.castShadow = true;
                cars.push(object); // Armazenar o objeto do carro
                scene.add(object);
            },
            undefined,
            (error) => {
                console.error('Erro ao carregar o modelo:', error);
            }
        );
        keys.up = false;
        keys.down = false;
        keys.left = false;
        keys.right = false;
    });

    // Resetar a posição dos obstáculos
    obstacles.forEach(obstacle => {
        obstacle.position.set(
            Math.random() * planeSize - planeSize / 2,
            obstacle.geometry.parameters.height / 2,
            Math.random() * planeSize - planeSize / 2
        );
    });
}

// Listener para as teclas
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Função de animação
function animate() {
    moveCars(); // Atualiza a posição dos carros com base nas teclas pressionadas
    detectCollisions(); // Verifica colisões entre os carros e os obstáculos
    controls.update(); // Atualiza os controles (só se o OrbitControls estiver ativado)
    renderer.render(scene, camera); // Renderiza a cena
}

renderer.setAnimationLoop(animate);

// Ajuste de tamanho da janela
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
