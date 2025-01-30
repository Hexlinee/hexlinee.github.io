const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const waveSpeed = 200;
const GRID_SIZE = 50;

let objects = [];
let selectedObject = null;
let hoveredPerceiver = null;
let lastTimestamp = 0;
let isDraggingControls = false;
let controlsStartPos = { x: 20, y: 20 };

// Initialize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

class Wave {
    constructor(source, startTime) {
        this.source = source;
        this.startTime = startTime;
        this.radius = 0;
    }
}

class DopplerObject {
    constructor(type) {
        this.id = Date.now();
        this.type = type;
        this.x = window.innerWidth/2;
        this.y = window.innerHeight/2;
        this.velocity = { x: 0, y: 0 };
        this.frequency = type === 'source' ? 2 : 0;
        this.waves = [];
        this.color = type === 'source' ? '#ff5555' : '#5599ff';
        this.radius = 15;
        this.lastWaveTime = 0;
    }

    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        if(this.type === 'source' && this.frequency > 0) {
            const waveInterval = 1000/this.frequency;
            if(Date.now() - this.lastWaveTime > waveInterval) {
                this.waves.push(new Wave(this, Date.now()));
                this.lastWaveTime = Date.now();
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Velocity vector
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.velocity.x * 20, this.y + this.velocity.y * 20);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function createControls(object) {
    const controls = document.createElement('div');
    controls.className = 'object-control';
    controls.innerHTML = `
        <h4>${object.type} #${object.id}</h4>
        ${object.type === 'source' ? `
            <div class="slider-container">
                Frequency (1-10Hz): 
                <input type="range" min="1" max="10" value="${object.frequency}" class="frequency">
                <span>${object.frequency}Hz</span>
            </div>
        ` : ''}
        <div class="slider-container">
            Speed (0-200px/s): 
            <input type="range" min="0" max="200" value="${Math.hypot(object.velocity.x, object.velocity.y)}" class="speed">
        </div>
        <div class="slider-container">
            Direction: 
            <input type="range" min="0" max="360" value="${Math.atan2(object.velocity.y, object.velocity.x) * 180/Math.PI}" class="direction">
        </div>
        <button class="delete">🗑️ Delete</button>
    `;

    if(object.type === 'source') {
        controls.querySelector('.frequency').addEventListener('input', (e) => {
            object.frequency = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${object.frequency}Hz`;
        });
    }

    const updateVelocity = () => {
        const speed = controls.querySelector('.speed').value;
        const angle = controls.querySelector('.direction').value * Math.PI/180;
        object.velocity.x = speed * Math.cos(angle);
        object.velocity.y = speed * Math.sin(angle);
    };

    controls.querySelector('.speed').addEventListener('input', updateVelocity);
    controls.querySelector('.direction').addEventListener('input', updateVelocity);

    controls.querySelector('.delete').addEventListener('click', () => {
        objects = objects.filter(o => o.id !== object.id);
        controls.remove();
    });

    document.getElementById('objectControls').appendChild(controls);
}

function calculatePerceivedFrequency(source, perceiver) {
    const toObserver = { x: perceiver.x - source.x, y: perceiver.y - source.y };
    const distance = Math.hypot(toObserver.x, toObserver.y);
    if(distance === 0) return source.frequency;
    
    const direction = { x: toObserver.x/distance, y: toObserver.y/distance };
    const vs = source.velocity.x * direction.x + source.velocity.y * direction.y;
    const vo = perceiver.velocity.x * direction.x + perceiver.velocity.y * direction.y;
    
    return source.frequency * (waveSpeed + vo) / (waveSpeed + vs);
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    
    for(let x = 0; x < canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for(let y = 0; y < canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawArrow(fromX, fromY, toX, toY, text) {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI/6), toY - headLength * Math.sin(angle - Math.PI/6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI/6), toY - headLength * Math.sin(angle + Math.PI/6));
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(text, toX + 10, toY + 5);
}

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    objects.forEach(obj => {
        obj.update(deltaTime);
        obj.waves.forEach(wave => {
            wave.radius = (Date.now() - wave.startTime) * (waveSpeed / 1000);
        });
        obj.waves = obj.waves.filter(wave => wave.radius < Math.max(canvas.width, canvas.height));
    });

    objects.forEach(obj => {
        if(obj.type === 'source') {
            obj.waves.forEach(wave => {
                ctx.beginPath();
                ctx.arc(wave.source.x, wave.source.y, wave.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 100, 100, ${1 - wave.radius/1000})`;
                ctx.stroke();
            });
        }
    });

    objects.forEach(obj => obj.draw());

    if(hoveredPerceiver) {
        objects.filter(o => o.type === 'source').forEach(source => {
            const perceivedFreq = calculatePerceivedFrequency(source, hoveredPerceiver);
            drawArrow(
                source.x, source.y,
                hoveredPerceiver.x, hoveredPerceiver.y,
                `${perceivedFreq.toFixed(1)}Hz`
            );
        });
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousemove', (e) => {
    if(isDraggingControls) {
        const dx = e.clientX - controlsStartPos.x;
        const dy = e.clientY - controlsStartPos.y;
        const controls = document.querySelector('.controls');
        controls.style.left = `${dx}px`;
        controls.style.top = `${dy}px`;
        return;
    }

    hoveredPerceiver = objects.find(obj => 
        obj.type === 'perceiver' &&
        Math.hypot(obj.x - e.clientX, obj.y - e.clientY) < obj.radius
    );
});

document.querySelector('.controls').addEventListener('mousedown', (e) => {
    isDraggingControls = true;
    controlsStartPos.x = e.clientX - parseInt(document.querySelector('.controls').style.left || 20);
    controlsStartPos.y = e.clientY - parseInt(document.querySelector('.controls').style.top || 20);
});

document.addEventListener('mouseup', () => {
    isDraggingControls = false;
});

canvas.addEventListener('mousedown', (e) => {
    selectedObject = objects.find(obj => 
        Math.hypot(obj.x - e.clientX, obj.y - e.clientY) < obj.radius
    );
});

canvas.addEventListener('mouseup', () => {
    selectedObject = null;
});

canvas.addEventListener('mousemove', (e) => {
    if(selectedObject) {
        selectedObject.x = e.clientX;
        selectedObject.y = e.clientY;
    }
});

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

// Start animation
requestAnimationFrame(animate);
