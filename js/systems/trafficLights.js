import { TrafficLight } from '../components.js';

export function trafficLightSystem(world, dt) {
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!TrafficLight.has[e]) continue;
    TrafficLight.timer[e] += dt;
    const cycle = TrafficLight.cycleTime[e] || 1;
    if (TrafficLight.timer[e] > cycle) {
      TrafficLight.timer[e] -= cycle;
    }
    TrafficLight.state[e] = TrafficLight.timer[e] < TrafficLight.greenTime[e] ? 1 : 0;
  }
}
