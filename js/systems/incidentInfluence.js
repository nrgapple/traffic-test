import { Car, CarAI, Incident, Lane } from '../components.js';
import { CarAIState } from '../constants.js';

export function incidentInfluenceSystem(world) {
  world.laneIncidents = new Map();
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!Incident.has[e] || !Incident.active[e]) continue;
    const lane = Incident.lane[e];
    if (!world.laneIncidents.has(lane)) world.laneIncidents.set(lane, []);
    world.laneIncidents.get(lane).push(e);
  }
  for (const [, list] of world.laneIncidents) {
    list.sort((a, b) => Incident.offset[a] - Incident.offset[b]);
  }

  if (!world.laneCars) return;
  for (const [laneId, cars] of world.laneCars.entries()) {
    const incidents = world.laneIncidents.get(laneId);
    if (!incidents || incidents.length === 0) continue;
    for (const carId of cars) {
      const incident = incidents.find((inc) => Incident.offset[inc] > Car.offset[carId]);
      if (!incident) continue;
      const distance = Incident.offset[incident] - Car.offset[carId];
      const severity = Incident.severity[incident];
      if (distance < 30) {
        CarAI.desiredSpeed[carId] = 0;
        CarAI.state[carId] = CarAIState.INCIDENT;
      } else if (distance < 120) {
        const factor = Math.max(0.2, (distance / 120) * (1 - severity * 0.5));
        CarAI.desiredSpeed[carId] *= factor;
        CarAI.state[carId] = CarAIState.SLOWING;
      }
    }
  }
}
