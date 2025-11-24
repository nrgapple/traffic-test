import { Car, CarAI, Lane, RoadSegment } from '../components.js';
import { CarAIState, PARAMS } from '../constants.js';

export function desiredSpeedSystem() {
  for (let e = 1; e < Car.has.length; e++) {
    if (!Car.has[e]) continue;
    const lane = Car.lane[e];
    const segment = Lane.segment[lane];
    const speedLimit = RoadSegment.speedLimit[segment];
    CarAI.desiredSpeed[e] = speedLimit * PARAMS.speedFactor;
    CarAI.state[e] = CarAIState.DRIVING;
  }
}
