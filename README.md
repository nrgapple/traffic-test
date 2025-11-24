# Vector Traffic Simulation

A lightweight, vanilla JS top-down traffic simulation with a home-grown ECS backed by typed arrays. Rendering uses a minimal neon vector style on a black canvas and supports hundreds of moving cars, traffic lights, and random incidents.

## Running the demo

### Quick preview

- Open `index.html` in any modern browser. No build step or external dependencies are required.
- Or run a tiny local server for a reliable preview:

  ```bash
  npm install --ignore-scripts # no dependencies; installs a local lockfile if you want one
  npm start                    # serves at http://localhost:4173
  ```

  You can also set a custom port with `PORT=5000 npm start`.

### Controls

- **Cars**: adjust population from 20 to 400 vehicles.
- **Speed factor**: scale the global speed limits.
- **Incident rate**: increase how often crashes and stops spawn.
- **Debug overlays**: toggle extra visualization hooks for future use.

Live stats in the sidebar show FPS, cars currently alive, and active incidents.
