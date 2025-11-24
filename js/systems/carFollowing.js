import { Car, CarAI, Incident, Lane, RoadSegment } from '../components.js';
import { CarAIState, PARAMS } from '../constants.js';

export function carFollowingSystem(world, dt) {
  if (!world.laneCars) return;
  for (const [laneId, cars] of world.laneCars.entries()) {
    if (!cars || cars.length === 0) continue;
    const segment = Lane.segment[laneId];
    const speedLimit = RoadSegment.speedLimit[segment] * PARAMS.speedFactor;
    const segmentLength = RoadSegment.length[segment];
    const incidents = world.laneIncidents?.get(laneId) ?? [];

    for (let i = 0; i < cars.length; i++) {
      const id = cars[i];
      const baseDesired = Math.max(6, CarAI.desiredSpeed[id]);
      const stopLine = world.stopLines?.get(laneId) ?? null;
      const leaderInfo = pickLeader(id, i, cars, incidents, segmentLength, stopLine);
      // In traffic, cars should be much closer together - minimum gap of 2-3 units
      const desiredGap = Math.max(2, 3 + Car.speed[id] * 0.3);
      const gap = leaderInfo.position - Car.offset[id] - Car.length[id];

      let accel = (baseDesired - Car.speed[id]) * 0.6;
      if (gap < desiredGap) {
        const brakeFactor = Math.min(1, (desiredGap - gap) / desiredGap);
        accel = Math.min(accel, -Car.maxBrake[id] * brakeFactor);
        CarAI.state[id] = gap < 2 ? CarAIState.STOPPED : CarAIState.SLOWING;
      }
      accel = Math.min(Math.max(accel, -Car.maxBrake[id]), Car.maxAccel[id]);
      Car.speed[id] = Math.max(0, Car.speed[id] + accel * dt);
    }
  }
}

function pickLeader(id, index, cars, incidents, segmentLength, stopLine) {
  let leaderPosition = segmentLength + 50;
  if (index < cars.length - 1) {
    const ahead = cars[index + 1];
    leaderPosition = Math.min(leaderPosition, Car.offset[ahead] - Car.length[ahead] * 0.5);
  }
  const incidentAhead = incidents.find((inc) => Incident.offset[inc] > Car.offset[id]);
  if (incidentAhead) {
    leaderPosition = Math.min(leaderPosition, Incident.offset[incidentAhead]);
  }
  if (stopLine !== null && stopLine !== undefined && stopLine > Car.offset[id]) {
    leaderPosition = Math.min(leaderPosition, stopLine);
  }
  return { position: leaderPosition };
}
