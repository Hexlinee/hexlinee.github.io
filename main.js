// main.js

// Basic setup for Three.js
let scene, camera, renderer;
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.PointLight(0xFFFFFF, 1, 0);
    light.position.set(0, 0, 0);
    scene.add(light);

    // Creating the sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create planets
    const planetsData = [
        { size: 0.5, color: 0xAAAAFF, distance: 10 },
        { size: 1, color: 0xFF5533, distance: 15 },
        { size: 0.8, color: 0x33FF55, distance: 20 },
        { size: 0.6, color: 0xFFAA33, distance: 25 }
    ];

    planetsData.forEach((planetData, index) => {
        const planetGeometry = new THREE.SphereGeometry(planetData.size, 32, 32);
        const planetMaterial = new THREE.MeshBasicMaterial({ color: planetData.color });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);

        planet.position.x = planetData.distance;
        planet.userData = { distance: planetData.distance, angle: 0 };
        scene.add(planet);

        // Animate the planets
        function animatePlanet() {
            planet.userData.angle += 0.01;
            planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
            planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
            requestAnimationFrame(animatePlanet);
        }
        animatePlanet();
    });

    // Camera positioning
    camera.position.z = 50;

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Import Three.js from CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
script.onload = init;
document.head.appendChild(script);
