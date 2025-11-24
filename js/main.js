import { addSystem, createWorld, stepWorld } from './ecs.js';
import { Car } from './components.js';
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

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let lastTime = performance.now();
let fpsSmoother = 0;

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
requestAnimationFrame(loop);

function loop(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
  lastTime = timestamp;
  stepWorld(world, dt);
  render(world, ctx, canvas);
  updateStats(dt);
  requestAnimationFrame(loop);
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resize);

function setupUI() {
  const carSlider = document.getElementById('carCount');
  const carLabel = document.getElementById('carCountValue');
  const speedSlider = document.getElementById('speedFactor');
  const speedLabel = document.getElementById('speedFactorValue');
  const incidentSlider = document.getElementById('incidentRate');
  const incidentLabel = document.getElementById('incidentRateValue');
  const debugToggle = document.getElementById('debugToggle');

  carSlider.addEventListener('input', () => {
    carLabel.textContent = carSlider.value;
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

  carLabel.textContent = carSlider.value;
  speedLabel.textContent = `${(Number(speedSlider.value) / 100).toFixed(2)}x`;
  incidentLabel.textContent = incidentDescriptor(Number(incidentSlider.value) / 100);
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
