/* styles.css */
body {
    margin: 0;
    overflow: hidden;
    font-family: Arial, sans-serif;
    background: #111;
}

canvas {
    position: fixed;
    top: 0;
    left: 0;
    background: 
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
}

.controls {
    position: fixed;
    left: 20px;
    top: 20px;
    background: rgba(0, 0, 0, 0.9);
    padding: 15px;
    border-radius: 8px;
    color: white;
    z-index: 1000;
    min-width: 300px;
}

button {
    margin: 5px;
    padding: 8px 15px;
    background: #222;
    color: white;
    border: 1px solid #444;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #333;
}

.object-control {
    margin: 10px 0;
    padding: 15px;
    background: #1a1a1a;
    border-radius: 6px;
    border: 1px solid #333;
}

.slider-container {
    margin: 10px 0;
}

.slider-container label {
    display: block;
    margin-bottom: 5px;
}

.frequency-display {
    position: absolute;
    background: rgba(0,0,0,0.8);
    padding: 8px;
    border-radius: 4px;
    pointer-events: none;
}
