// Matter.js module aliases
let Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint;

// Function to initialize Matter.js components and simulation
function initMatterJs() {
    Engine = Matter.Engine;
    Render = Matter.Render;
    Runner = Matter.Runner;
    Bodies = Matter.Bodies;
    Composite = Matter.Composite;
    Mouse = Matter.Mouse;
    MouseConstraint = Matter.MouseConstraint;

    // create an engine
    const engine = Engine.create();
    const world = engine.world;

    // create a renderer
    const render = Render.create({
        element: document.body,
        canvas: document.getElementById('world'),
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            background: '#000',  // Darker background
            wireframes: false,
        }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    const boxes = [];
    for (let i = 0; i < 5; i++) {
        boxes.push(Bodies.rectangle(400 + i * 80, 200, 60, 60, { 
            render: { fillStyle: getRandomColor() }  // Random color for each block
        }));
    }
    Composite.add(world, boxes);

    // add ground
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 10, window.innerWidth, 20, { isStatic: true });
    Composite.add(world, ground);

    // add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            render: { visible: false }
        }
    });
    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // resize the canvas on window resize
    window.addEventListener('resize', () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight - 10 });
    });

    // Add procedural flickering stars to the background.
    addStars();

    // Add keyboard controls for moving the view
    let offsetX = 0, offsetY = 0;
    const moveSpeed = 10;

    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                offsetY -= moveSpeed;
                break;
            case 'ArrowDown':
            case 's':
                offsetY += moveSpeed;
                break;
            case 'ArrowLeft':
            case 'a':
                offsetX -= moveSpeed;
                break;
            case 'ArrowRight':
            case 'd':
                offsetX += moveSpeed;
                break;
        }
        Render.lookAt(render, {
            min: { x: offsetX, y: offsetY },
            max: { x: window.innerWidth + offsetX, y: window.innerHeight + offsetY }
        });
    });

    // Add night sounds to the background
    addNightSounds();
}

// Function to add procedural flickering stars to the background
function addStars() {
    const container = document.createElement('div');
    container.className = 'flickering-stars';

    for (let i = 0; i < 100; i++) {  // Increase the number of stars for higher density
        const star = document.createElement('div');
        star.className = 'star';
        star.style.position = 'absolute';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        container.appendChild(star);
    }

    document.body.appendChild(container);

    const style = document.createElement('style');
    style.innerHTML = `
        .flickering-stars .star {
            width: 2px;
            height: 2px;
            border-radius: 50%;
            background-color: white;  // Ensure stars are white
            opacity: 0.5;
            animation: flicker 2s infinite;
        }

        @keyframes flicker {
            0%, 100% { opacity: 0.5; }
            25% { opacity: 1; }
            75% { opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
}

// Function to generate random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to add night sounds to the background
function addNightSounds() {
    const audio = document.createElement('audio');
    audio.src = 'night_sounds.mp3';  // Ensure you have a night_sounds.mp3 file in your project directory
    audio.loop = true;
    audio.autoplay = true;
    document.body.appendChild(audio);
}

// Ensure Matter.js is loaded before initializing the simulation
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

// Load Matter.js from CDN and initialize the simulation
document.addEventListener('DOMContentLoaded', () => {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.18.0/matter.min.js', initMatterJs);
});
