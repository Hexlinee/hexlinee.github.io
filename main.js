const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const WAVE_SPEED = 200;
let objects = [];
let selectedObject = null;
let hoveredPerceiver = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Wave {
    constructor(source) {
        this.source = source;
        this.created = performance.now();
    }
}

class DopplerObject {
    constructor(type) {
        this.id = Date.now();
        this.type = type;
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.velocity = { x: 0, y: 0 };
        this.frequency = type === 'source' ? 1 : 0;
        this.waves = [];
        this.color = type === 'source' ? '#ff4444' : '#44aaff';
        this.radius = 15;
        this.lastWave = performance.now();
    }

    update() {
        if(this.type === 'source') {
            const now = performance.now();
            if(now - this.lastWave > 1000/this.frequency) {
                this.waves.push(new Wave(this));
                this.lastWave = now;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function createControls(obj) {
    const controls = document.createElement('div');
    controls.className = 'object-control';
    controls.innerHTML = `
        <h3>${obj.type.toUpperCase()} #${obj.id}</h3>
        ${obj.type === 'source' ? `
            <div class="slider-container">
                <label>Frequency (Hz): 
                    <input type="range" min="1" max="5" value="${obj.frequency}" class="frequency">
                    <span>${obj.frequency}Hz</span>
                </label>
            </div>
        ` : ''}
        <div class="slider-container">
            <label>Speed X: 
                <input type="range" min="-100" max="100" value="${obj.velocity.x}" class="speed-x">
            </label>
        </div>
        <div class="slider-container">
            <label>Speed Y: 
                <input type="range" min="-100" max="100" value="${obj.velocity.y}" class="speed-y">
            </label>
        </div>
        <button class="delete">🗑️ Delete</button>
    `;

    if(obj.type === 'source') {
        const freqInput = controls.querySelector('.frequency');
        const freqValue = freqInput.nextElementSibling;
        freqInput.addEventListener('input', e => {
            obj.frequency = parseInt(e.target.value);
            freqValue.textContent = `${obj.frequency}Hz`;
        });
    }

    controls.querySelector('.speed-x').addEventListener('input', e => {
        obj.velocity.x = parseInt(e.target.value);
    });

    controls.querySelector('.speed-y').addEventListener('input', e => {
        obj.velocity.y = parseInt(e.target.value);
    });

    controls.querySelector('.delete').addEventListener('click', () => {
        objects = objects.filter(o => o.id !== obj.id);
        controls.remove();
    });

    document.getElementById('objectControls').appendChild(controls);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    objects.forEach(obj => {
        obj.update();
        obj.draw();
        
        if(obj.type === 'source') {
            obj.waves = obj.waves.filter(wave => {
                const radius = (performance.now() - wave.created) * (WAVE_SPEED/1000);
                ctx.beginPath();
                ctx.arc(wave.source.x, wave.source.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 100, 100, ${1 - radius/1000})`;
                ctx.stroke();
                return radius < 1000;
            });
        }
    });

    requestAnimationFrame(animate);
}

// Event Listeners
document.getElementById('addSource').addEventListener('click', () => {
    const source = new DopplerObject('source');
    objects.push(source);
    createControls(source);
});

document.getElementById('addPerceiver').addEventListener('click', () => {
    const perceiver = new DopplerObject('perceiver');
    objects.push(perceiver);
    createControls(perceiver);
});

canvas.addEventListener('mousemove', (e) => {
    hoveredPerceiver = objects.find(obj => 
        obj.type === 'perceiver' &&
        Math.hypot(obj.x - e.clientX, obj.y - e.clientY) < obj.radius
    );
});

canvas.addEventListener('mousedown', (e) => {
    selectedObject = objects.find(obj => 
        Math.hypot(obj.x - e.clientX, obj.y - e.clientY) < obj.radius
    );
});

canvas.addEventListener('mousemove', (e) => {
    if(selectedObject) {
        selectedObject.x = e.clientX;
        selectedObject.y = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    selectedObject = null;
});

// Start animation
animate();
