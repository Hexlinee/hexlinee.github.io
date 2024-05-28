// main.js

// Matter.js module aliases
const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

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
        background: '#333436',
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
        render: { fillStyle: '#00f' }
    }));
}
Composite.add(world, boxes);

// add ground
const ground = Bodies.rectangle(400, window.innerHeight, 810, 60, { isStatic: true });
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
    Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight });
});

// Import Matter.js from CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.18.0/matter.min.js';
script.onload = init;
document.head.appendChild(script);
