import { Car, CarAI, Lane, Node, RoadSegment, TrafficLight } from '../components.js';
import { CarAIState, LaneDirection, NodeType } from '../constants.js';

export function intersectionSystem(world) {
  world.stopLines = new Map();
  const signals = new Map();
  for (let e = 1; e < world.nextEntityId; e++) {
    if (!TrafficLight.has[e]) continue;
    signals.set(TrafficLight.node[e], TrafficLight.state[e]);
  }

  for (let car = 1; car < world.nextEntityId; car++) {
    if (!Car.has[car]) continue;
    const lane = Car.lane[car];
    const segment = Lane.segment[lane];
    const destNode = Lane.direction[lane] === LaneDirection.FORWARD
      ? RoadSegment.endNode[segment]
      : RoadSegment.startNode[segment];
    const distanceToEnd = RoadSegment.length[segment] - Car.offset[car];
    const nodeType = Node.type[destNode];
    if (nodeType === NodeType.SIGNAL) {
      const green = signals.get(destNode) === 1;
      if (!green && distanceToEnd < 180) {
        world.stopLines.set(lane, RoadSegment.length[segment] - 4);
        if (distanceToEnd < 30) {
          CarAI.state[car] = CarAIState.STOPPED;
        }
      }
    } else if (nodeType === NodeType.STOP_SIGN && distanceToEnd < 120) {
      world.stopLines.set(lane, RoadSegment.length[segment] - 6);
    }
  }
}
