# Portal-inspired handheld frame

This is an adapted **DualSense controller model with a new large-screen carrier**.
It is not an official Sony model or a dimensionally verified PlayStation Portal
CAD reproduction.

## Original model

- **PS5 Controller** by **Taohid Animation**.
- Original creator: <https://sketchfab.com/taohidanimation>.
- Original model: <https://sketchfab.com/3d-models/ps5-controller-b7bb9c5102a04cb0b1966c6d02bad7d6>.
- License: **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
- License terms: <https://creativecommons.org/licenses/by/4.0/>.

## Prepared source

- Semantic component preparation by **Safa Elmali**:
  <https://github.com/SafaElmali/dualsense-studio>.
- Source asset:
  <https://github.com/SafaElmali/dualsense-studio/blob/cbae4342498d4d9395aa79ec11a1569ce0977d00/controller/dualsense.glb>.
- Source attribution:
  <https://github.com/SafaElmali/dualsense-studio/blob/cbae4342498d4d9395aa79ec11a1569ce0977d00/controller/ATTRIBUTION.md>.
- Reviewed source SHA-256:
  `e55e172f3a6704769818954970fda2d29038a31f85ba7358a36d0549df4f9d30`.

Safa's prepared source split the connected parts into named controls and baked
node transforms while preserving the original geometry, UVs and textures.

## Changes for MARC ISLAND

The curved left and right white grip surfaces, button caps, D-pad components,
joysticks, wells and triggers are retained from the attributed source geometry.
The central touchpad, speaker assembly and center-mounted controls are removed.
The black front and rear shells are trimmed at their inner sides and capped.
The two grip assemblies are moved apart, their depth is adapted to the page's
front-facing camera, and a new beveled black screen carrier with a real opening
is added between them. The game opening remains **660 × 371.25 logical pixels**
at `[270, 50]` on the common 1200 × 500 plane.

Controls have centered origins for movement. Cross maps to `button-j`; Circle
maps to `button-k`; Create and Options map to the project's Info and Index
shortcuts. The prepared GLB includes an earlier recessed volume channel; the current runtime removes it and places the volume controls in the page header.
Physical material parameters are adjusted. The original texture maps and symbol
decals are removed. Cross, Circle, Square, Triangle and directional arrows are
new molded 3D geometry that follows each curved key surface and moves with it.
The key caps are split into a milky center and narrow reflective rim without
changing the source surface. Their molded symbols are smaller and pale gray.
The new carrier uses a narrow bevel and independent face normals; thin blue
light-guide geometry follows the white/black shell seam outside the screen.
The entire adapted GLB uses geometry and physical material parameters; no shell
photograph, rendered shell screenshot or baked lighting image is used as the body.

The adapted asset remains available under **CC BY 4.0**. Preserve this attribution
and identify further modifications when redistributing it. The license does not
grant trademark rights or imply endorsement by Sony or PlayStation.

## Reproduction

From the repository root, run the standard-library-only conversion script:

```sh
python3 scripts/prepare-portal-model.py \
  --source /path/to/reviewed/dualsense.glb
```

The source can optionally be downloaded from the pinned revision with
`--download-source`. The script checks its SHA-256 before processing it and
never executes code from the source repository.

Further runtime refinements add independent cap-pressure and stick-tilt feedback, soften black polymer reflections and use a brighter side fill and background halo for visual separation. The shared game aperture is preserved. The current runtime replaces the donor white front shells and diagonal seam guides with custom extruded, curved Portal-inspired face panels and a blue seam following the analog wells. It slightly reshapes the upper black neck into the screen carrier, adds the two screen-side detail keys and molded marks, replaces the upper shoulders, uses solid directional triangles, and enlarges the four right-side caps and their symbols. Donor black rear/inner grip geometry, stick geometry and the original cap surfaces are retained, with controls reseated above the new front skin. These runtime changes are implemented in src/shell/portalHardwareDetails.ts; the pinned GLB remains reproducible with the conversion script above.
