import { addSystem, createWorld, stepWorld } from './ecs.js';
import { Car, Components, Node } from './components.js';
import { PARAMS } from './constants.js';
import { setupWorld, addRandomCars } from './world-setup.js';
import { trafficLightSystem } from './systems/trafficLights.js';
import { incidentSystem } from './systems/incidents.js';
import { laneIndexSystem } from './systems/laneIndex.js';
import { desiredSpeedSystem } from './systems/desiredSpeed.js';
import { intersectionSystem } from './systems/intersections.js';
import { incidentInfluenceSystem } from './systems/incidentInfluence.js';
import { carFollowingSystem } from './systems/carFollowing.js';
import { integrationSystem } from './systems/integration.js';
import { render } from './systems/render.js';
import { PRESETS, DEFAULT_ROAD_CONFIG, getPresetByName } from './road-config.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let lastTime = performance.now();
let fpsSmoother = 0;

// Camera/zoom system
const camera = {
  x: 0,
  y: 0,
  zoom: 1,
  minZoom: 0.3,
  maxZoom: 3,
};

const world = createWorld();
setupWorld(world);

addSystem(world, trafficLightSystem);
addSystem(world, incidentSystem);
addSystem(world, laneIndexSystem);
addSystem(world, desiredSpeedSystem);
addSystem(world, intersectionSystem);
addSystem(world, incidentInfluenceSystem);
addSystem(world, carFollowingSystem);
addSystem(world, integrationSystem);

setupUI();
resize();
// Center camera on initial world
if (world.nodes && world.nodes.length > 0) {
  let sumX = 0, sumY = 0;
  for (let nodeId of world.nodes) {
    if (Node.has[nodeId]) {
      sumX += Node.x[nodeId];
      sumY += Node.y[nodeId];
    }
  }
  camera.x = sumX / world.nodes.length;
  camera.y = sumY / world.nodes.length;
}
updateCameraTransform();
requestAnimationFrame(loop);

function loop(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
  lastTime = timestamp;
  stepWorld(world, dt);
  updateCameraTransform();
  render(world, ctx, canvas);
  updateStats(dt);
  requestAnimationFrame(loop);
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  updateCameraTransform();
}

function updateCameraTransform() {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  ctx.setTransform(
    dpr * camera.zoom, 0, 0, dpr * camera.zoom,
    dpr * (width / 2 - camera.x * camera.zoom),
    dpr * (height / 2 - camera.y * camera.zoom)
  );
}

// Zoom and pan handlers
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom * zoomFactor));
  
  // Zoom towards mouse position
  const worldX = (mouseX - rect.width / 2) / camera.zoom + camera.x;
  const worldY = (mouseY - rect.height / 2) / camera.zoom + camera.y;
  
  camera.zoom = newZoom;
  camera.x = worldX - (mouseX - rect.width / 2) / camera.zoom;
  camera.y = worldY - (mouseY - rect.height / 2) / camera.zoom;
  
  updateCameraTransform();
});

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) { // Left mouse button
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const dx = (e.clientX - lastMouseX) / camera.zoom;
    const dy = (e.clientY - lastMouseY) / camera.zoom;
    camera.x -= dx;
    camera.y -= dy;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    updateCameraTransform();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'default';
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  canvas.style.cursor = 'default';
});

window.addEventListener('resize', resize);

function setupUI() {
  const carSlider = document.getElementById('carCount');
  const carLabel = document.getElementById('carCountValue');
  const speedSlider = document.getElementById('speedFactor');
  const speedLabel = document.getElementById('speedFactorValue');
  const incidentSlider = document.getElementById('incidentRate');
  const incidentLabel = document.getElementById('incidentRateValue');
  const debugToggle = document.getElementById('debugToggle');
  const presetSelect = document.getElementById('presetSelect');
  const presetDescription = document.getElementById('presetDescription');
  const resetPreset = document.getElementById('resetPreset');

  // Populate preset selector
  PRESETS.forEach(preset => {
    const option = document.createElement('option');
    option.value = preset.name;
    option.textContent = preset.name;
    if (preset.name === DEFAULT_ROAD_CONFIG.name) {
      option.selected = true;
      presetDescription.textContent = preset.description;
    }
    presetSelect.appendChild(option);
  });

  presetSelect.addEventListener('change', () => {
    const selectedPreset = getPresetByName(presetSelect.value);
    presetDescription.textContent = selectedPreset.description;
    loadPreset(selectedPreset);
  });

  resetPreset.addEventListener('click', () => {
    presetSelect.value = DEFAULT_ROAD_CONFIG.name;
    presetDescription.textContent = DEFAULT_ROAD_CONFIG.description;
    loadPreset(DEFAULT_ROAD_CONFIG);
  });

  carSlider.addEventListener('input', () => {
    const value = Number(carSlider.value);
    carLabel.textContent = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
  });
  carSlider.addEventListener('change', () => {
    const desired = Number(carSlider.value);
    adjustCarCount(desired);
  });

  speedSlider.addEventListener('input', () => {
    PARAMS.speedFactor = Number(speedSlider.value) / 100;
    speedLabel.textContent = `${PARAMS.speedFactor.toFixed(2)}x`;
  });

  incidentSlider.addEventListener('input', () => {
    PARAMS.incidentRate = Number(incidentSlider.value) / 100;
    incidentLabel.textContent = incidentDescriptor(PARAMS.incidentRate);
  });

  debugToggle.addEventListener('change', () => {
    PARAMS.debug = debugToggle.checked;
  });

  const initialCarValue = Number(carSlider.value);
  carLabel.textContent = initialCarValue >= 1000 ? `${(initialCarValue / 1000).toFixed(1)}k` : initialCarValue;
  speedLabel.textContent = `${(Number(speedSlider.value) / 100).toFixed(2)}x`;
  incidentLabel.textContent = incidentDescriptor(Number(incidentSlider.value) / 100);
}

function loadPreset(config) {
  // Clear all existing entities and components
  for (let e = 1; e < world.nextEntityId; e++) {
    world.alive[e] = 0;
    Components.forEach(comp => {
      if (comp.has && comp.has[e]) comp.has[e] = 0;
    });
  }
  
  // Reset world state
  world.nextEntityId = 1;
  world.routes = new Map();
  world.curveControlPoints = new Map();
  world.laneCars = new Map();
  
  // Setup world with new config
  setupWorld(world, config);
  
  // Center camera on the road network
  if (world.nodes && world.nodes.length > 0) {
    let sumX = 0, sumY = 0;
    for (let nodeId of world.nodes) {
      if (Node.has[nodeId]) {
        sumX += Node.x[nodeId];
        sumY += Node.y[nodeId];
      }
    }
    camera.x = sumX / world.nodes.length;
    camera.y = sumY / world.nodes.length;
    camera.zoom = 1;
    updateCameraTransform();
  }
  
  // Restore car count to current slider value
  const carSlider = document.getElementById('carCount');
  const desired = Number(carSlider.value);
  adjustCarCount(desired);
}

function adjustCarCount(desired) {
  const current = currentCarCount();
  if (desired > current) {
    addRandomCars(world, desired - current);
  } else if (desired < current) {
    removeCars(world, current - desired);
  }
  PARAMS.carCount = desired;
}

function removeCars(world, count) {
  let removed = 0;
  for (let e = world.nextEntityId - 1; e >= 1 && removed < count; e--) {
    if (!Car.has[e]) continue;
    Car.has[e] = 0;
    world.alive[e] = 0;
    removed++;
  }
}

function updateStats(dt) {
  const fpsLabel = document.getElementById('fps');
  const carLabel = document.getElementById('carTotal');
  const incidentLabel = document.getElementById('incidentTotal');
  fpsSmoother = fpsSmoother * 0.9 + (1 / dt) * 0.1;
  fpsLabel.textContent = fpsSmoother.toFixed(0);
  carLabel.textContent = world.stats.cars;
  incidentLabel.textContent = world.stats.incidents;
}

function currentCarCount() {
  let total = 0;
  for (let e = 1; e < world.nextEntityId; e++) {
    if (Car.has[e]) total++;
  }
  return total;
}

function incidentDescriptor(rate) {
  if (rate < 0.1) return 'Low';
  if (rate < 0.3) return 'Medium';
  if (rate < 0.6) return 'High';
  return 'Chaos';
}
