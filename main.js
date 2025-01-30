const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const waveSpeed = 200; // Speed of sound in px/s

let objects = [];
let selectedObject = null;
let mousePos = { x: 0, y: 0 };
let hoveredPerceiver = null;
let lastTimestamp = 0;

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
        this.frequency = type === 'source' ? 440 : 0;
        this.waves = [];
        this.color = type === 'source' ? '#ff4444' : '#4444ff';
        this.radius = 15;
        this.lastWaveTime = 0;
    }

    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        if(this.type === 'source') {
            if(Date.now() - this.lastWaveTime > 1000/this.frequency) {
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

        // Draw velocity vector
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.velocity.x * 20, this.y + this.velocity.y * 20);
        ctx.strokeStyle = '#000';
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
                Frequency: <input type="range" min="100" max="1000" value="${object.frequency}" class="frequency">
                <span>${object.frequency}Hz</span>
            </div>
        ` : ''}
        <div class="slider-container">
            Speed: <input type="range" min="0" max="200" value="${Math.hypot(object.velocity.x, object.velocity.y)}" class="speed">
        </div>
        <div class="slider-container">
            Direction: <input type="range" min="0" max="360" value="${Math.atan2(object.velocity.y, object.velocity.x) * 180/Math.PI}" class="direction">
        </div>
        <button class="delete">Delete</button>
    `;

    if(object.type === 'source') {
        controls.querySelector('.frequency').addEventListener('input', (e) => {
            object.frequency = e.target.value;
            e.target.nextElementSibling.textContent = `${object.frequency}Hz`;
        });
    }

    controls.querySelector('.speed').addEventListener('input', (e) => {
        const speed = e.target.value;
        const angle = controls.querySelector('.direction').value * Math.PI/180;
        object.velocity.x = speed * Math.cos(angle);
        object.velocity.y = speed * Math.sin(angle);
    });

    controls.querySelector('.direction').addEventListener('input', (e) => {
        const angle = e.target.value * Math.PI/180;
        const speed = controls.querySelector('.speed').value;
        object.velocity.x = speed * Math.cos(angle);
        object.velocity.y = speed * Math.sin(angle);
    });

    controls.querySelector('.delete').addEventListener('click', () => {
        objects = objects.filter(o => o.id !== object.id);
        controls.remove();
    });

    document.getElementById('objectControls').appendChild(controls);
}

function calculatePerceivedFrequency(source, perceiver) {
    const toObserver = { x: perceiver.x - source.x, y: perceiver.y - source.y };
    const distance = Math.hypot(toObserver.x, toObserver.y);
    const direction = { x: toObserver.x/distance, y: toObserver.y/distance };
    
    const vs = source.velocity.x * direction.x + source.velocity.y * direction.y;
    const vo = perceiver.velocity.x * direction.x + perceiver.velocity.y * direction.y;
    
    return source.frequency * (waveSpeed + vo) / (waveSpeed + vs);
}

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    objects.forEach(obj => {
        obj.update(deltaTime);
        obj.waves.forEach(wave => {
            wave.radius = (Date.now() - wave.startTime) * (waveSpeed / 1000);
        });
        obj.waves = obj.waves.filter(wave => wave.radius < Math.max(canvas.width, canvas.height));
    });

    // Draw waves
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

    // Draw objects
    objects.forEach(obj => obj.draw());

    // Handle hover effect
    if(hoveredPerceiver) {
        objects.filter(o => o.type === 'source').forEach(source => {
            const perceivedFreq = calculatePerceivedFrequency(source, hoveredPerceiver);
            ctx.fillStyle = '#000';
            ctx.fillText(
                `${Math.round(perceivedFreq)}Hz`,
                hoveredPerceiver.x + 20,
                hoveredPerceiver.y + 20
            );
        });
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
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
