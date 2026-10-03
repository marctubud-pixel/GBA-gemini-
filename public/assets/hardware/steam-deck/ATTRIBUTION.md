# Steam Deck shell

Based on **Steam Deck console** by **wallmasterr**.

- Original model: https://sketchfab.com/3d-models/steam-deck-console-46e0c05675a7442dbe73f261436e6819
- Author: https://sketchfab.com/wallmasterr
- License: **Creative Commons Attribution 4.0 International** — https://creativecommons.org/licenses/by/4.0/
- GitHub source: https://github.com/people-climbing/website/tree/33ba12bb6b23d5013be3493df08d8f2dd96ef7e4/public/models/steamdeck

MARC Island modifications: separated connected controls, adapted the central aperture and side wings to a shared 16:9 game viewport, removed the original LCD and complete texture atlas, removed zero-area and duplicate clipped faces, rebuilt shallow case-front normals with front-only area weighting, added geometric button markings, speaker inserts, and assigned realtime physical materials with microscopic surface grain. This adapted display shell does not retain the original model's dimensional proportions.

Reviewed adapted asset: `deck.glb`, 1,249,944 bytes, 45,645 triangles, SHA-256 `b47038793933351f13849ae1f88a835f1d7b1eb0268a39795aa846527bb37fa4`.

The original mesh is independent artwork, not an official Valve CAD asset. No Valve endorsement is implied. The original model and this adapted GLB retain the CC BY 4.0 attribution requirement; this license does not change the license of the application code.

Further runtime calibration: rebuilt both analog sockets and concave caps as circular 96-segment revolved geometry without the housing's nonuniform XY scale; aligned the D-pad and ABXY diamond, replaced all four face caps with smaller consistent round geometry and geometric letters, widened their spacing and separated the analogs from adjacent keys; added surface-seated lower-grip joints following the authored curved boundary, with a dark recessed seam, narrow inner shoulder and subtly darker grip material; added pressure/tilt/rebound feedback. The volume interface is now in the page header, outside the handheld. The prepared GLB above remains unchanged.
