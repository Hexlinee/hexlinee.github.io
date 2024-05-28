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

    // Add procedural equations to the background
    addEquations();

    // Add stars to the background
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
}

// Function to add procedural equations to the background
function addEquations() {
    const equations = [
        'E = mc^2', 'F = ma', 'a^2 + b^2 = c^2', 'V = IR', 'pV = nRT',
        'F = G(m1m2)/r^2', 'E = hf', 'λ = h/p', 'p = mv', 'W = Fd'
    ];
    const container = document.createElement('div');
    container.className = 'equations';

    for (let i = 0; i < 20; i++) {  // Reduced the number of equations to 20
        const eq = document.createElement('div');
        eq.style.position = 'absolute';
        eq.style.top = `${Math.random() * 100}%`;
        eq.style.left = `${Math.random() * 100}%`;
        eq.innerText = equations[Math.floor(Math.random() * equations.length)];
        container.appendChild(eq);
    }

    document.body.appendChild(container);
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

// Function to add stars to the background
function addStars() {
    const starContainer = document.querySelector('.stars');
    if (starContainer) {
        starContainer.style.background = createStarPattern();
    }
}

// Function to create a star pattern
function createStarPattern() {
    let pattern = '';
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        pattern += `${x}% ${y}%, `;
    }
    return `radial-gradient(circle, white 1px, transparent 1px) repeat, ${pattern.slice(0, -2)}`;
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
