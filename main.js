// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GeoJsonGeometry } from 'three/addons/geometries/GeoJsonGeometry.js';

let scene, camera, renderer, controls;
let earthMesh, countryBorders;

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Earth sphere
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.MeshPhongMaterial({
        map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
        bumpScale: 0.05,
        specular: new THREE.Color('grey'),
        shininess: 5
    });
    earthMesh = new THREE.Mesh(geometry, material);
    scene.add(earthMesh);

    // Country borders
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const loader = new THREE.FileLoader();
    loader.load('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson', function(data) {
        const countries = JSON.parse(data);
        countries.features.forEach(feature => {
            const countryGeometry = new GeoJsonGeometry(feature, 5.1, 64);
            const line = new THREE.Line(countryGeometry, lineMaterial);
            scene.add(line);
        });
    });

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    // Camera position
    camera.position.z = 15;

    // Window resize handler
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    earthMesh.rotation.y += 0.0005;
    renderer.render(scene, camera);
}
