#!/usr/bin/env python3
"""Prepare a Portal-inspired frame from the attributed DualSense geometry.

Uses Python's standard library only. The original model is a DualSense, not
dimensionally verified Portal CAD. Its curved grips and physical controls are
retained; a new screen carrier joins the trimmed halves without reducing the
game's 660 x 371.25 opening. Source assets are never executed.
"""

import argparse
import copy
import hashlib
import json
import math
from pathlib import Path
import struct
import urllib.request

SOURCE_SHA = "e55e172f3a6704769818954970fda2d29038a31f85ba7358a36d0549df4f9d30"
SOURCE_COMMIT = "cbae4342498d4d9395aa79ec11a1569ce0977d00"
SOURCE_URL = ("https://raw.githubusercontent.com/SafaElmali/dualsense-studio/"
              + SOURCE_COMMIT + "/controller/dualsense.glb")
SCREEN = [270, 50, 660, 371.25]
XY_SCALE, Z_SCALE, Z_OFFSET = 119.0, 39.0, -12.0
CUT = 0.4


def normal(v):
    length = math.sqrt(sum(x * x for x in v))
    return [x / length for x in v] if length else [0, 0, 1]


def load_glb(path):
    blob = path.read_bytes()
    if hashlib.sha256(blob).hexdigest() != SOURCE_SHA:
        raise ValueError("Source GLB hash differs from the reviewed CC BY asset")
    magic, version, length = struct.unpack_from("<4sII", blob)
    if (magic, version, length) != (b"glTF", 2, len(blob)):
        raise ValueError("Invalid GLB header")
    json_length, json_type = struct.unpack_from("<II", blob, 12)
    if json_type != 0x4E4F534A:
        raise ValueError("Missing JSON chunk")
    source = json.loads(blob[20:20 + json_length])
    start = 20 + json_length
    binary_length, binary_type = struct.unpack_from("<II", blob, start)
    if binary_type != 0x004E4942:
        raise ValueError("Missing binary chunk")
    return source, blob[start + 8:start + 8 + binary_length]


def read_accessor(source, binary, index):
    accessor = source["accessors"][index]
    view = source["bufferViews"][accessor["bufferView"]]
    code, width = {5121: ("B", 1), 5123: ("H", 2),
                   5125: ("I", 4), 5126: ("f", 4)}[accessor["componentType"]]
    size = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[accessor["type"]]
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    stride = view.get("byteStride", width * size)
    return [list(struct.unpack_from("<" + code * size, binary, offset + i * stride))
            for i in range(accessor["count"])]


def interpolate(a, b, t):
    return {key: [x + (y - x) * t for x, y in zip(a[key], b[key])]
            for key in a}


def clip_triangle(vertices, side):
    """Clip a triangle to one grip and preserve every retained attribute."""
    plane = side * CUT
    result, crossings = [], []
    for previous, current in zip(vertices[-1:] + vertices[:-1], vertices):
        prev_in = side * previous["POSITION"][0] >= CUT - 1e-9
        curr_in = side * current["POSITION"][0] >= CUT - 1e-9
        if prev_in != curr_in:
            t = (plane - previous["POSITION"][0]) / (current["POSITION"][0] - previous["POSITION"][0])
            crossing = interpolate(previous, current, t)
            crossing["POSITION"][0] = plane
            result.append(crossing)
            crossings.append(crossing["POSITION"])
        if curr_in:
            result.append(current)
    return result, crossings


def transform_position(position, side):
    x, y, z = position
    return [(x - side * CUT) * XY_SCALE + side * 330,
            y * XY_SCALE, z * Z_SCALE + Z_OFFSET]


def prepare_geometry(source, binary, primitive, side, clipped=False):
    # All source materials use UV set zero. Unused duplicate UV sets are omitted.
    attributes = {key: read_accessor(source, binary, index)
                  for key, index in primitive["attributes"].items()
                  if key in ("POSITION", "NORMAL", "TANGENT", "TEXCOORD_0")}
    indices = [x[0] for x in read_accessor(source, binary, primitive["indices"])]
    output = {key: [] for key in attributes}
    output_indices, weld, segments = [], {}, []

    def append(vertex):
        vertex = copy.deepcopy(vertex)
        vertex["POSITION"] = transform_position(vertex["POSITION"], side)
        if "NORMAL" in vertex:
            vertex["NORMAL"] = normal([vertex["NORMAL"][0] / XY_SCALE,
                                       vertex["NORMAL"][1] / XY_SCALE,
                                       vertex["NORMAL"][2] / Z_SCALE])
        if "TANGENT" in vertex:
            tangent = vertex["TANGENT"]
            vertex["TANGENT"] = normal([tangent[0] * XY_SCALE,
                                        tangent[1] * XY_SCALE,
                                        tangent[2] * Z_SCALE]) + [tangent[3]]
        key = tuple(round(number, 7) for name in sorted(vertex) for number in vertex[name])
        if key not in weld:
            weld[key] = len(output["POSITION"])
            for name in output:
                output[name].append(vertex[name])
        return weld[key]

    for i in range(0, len(indices), 3):
        triangle = [{key: values[index] for key, values in attributes.items()}
                    for index in indices[i:i + 3]]
        polygon, crossings = clip_triangle(triangle, side) if clipped else (triangle, [])
        if len(crossings) == 2:
            segments.append([transform_position(point, side) for point in crossings])
        if len(polygon) < 3:
            continue
        anchor = append(polygon[0])
        for step in range(1, len(polygon) - 1):
            output_indices.extend([anchor, append(polygon[step]), append(polygon[step + 1])])
    return output, output_indices, segments


def cap_geometry(segments, side):
    """Close the new inside edge; never alter the original curved outer grip."""
    points, adjacency, edges = {}, {}, set()
    for a, b in segments:
        ka, kb = tuple(round(v, 5) for v in a), tuple(round(v, 5) for v in b)
        if ka == kb:
            continue
        points[ka], points[kb] = a, b
        adjacency.setdefault(ka, set()).add(kb)
        adjacency.setdefault(kb, set()).add(ka)
        edges.add(frozenset((ka, kb)))
    loops = []
    while edges:
        # The source shells are open surfaces, so cuts can produce a chain rather
        # than a closed loop. Start at an endpoint and close that inside face too.
        endpoint = next((point for point in adjacency
                         if sum(frozenset((point, q)) in edges for q in adjacency[point]) == 1), None)
        first = endpoint if endpoint is not None else next(iter(next(iter(edges))))
        previous, current = None, first
        loop = [first]
        while True:
            candidates = [point for point in adjacency[current]
                          if frozenset((current, point)) in edges]
            if not candidates:
                break
            following = next((point for point in candidates if point != previous), candidates[0])
            edges.remove(frozenset((current, following)))
            previous, current = current, following
            loop.append(current)
            if current == first:
                break
        if len(loop) >= 3:
            if loop[-1] == first:
                loop.pop()
            loops.append([points[key] for key in loop])
    positions, indices = [], []
    for loop in loops:
        base = len(positions)
        positions.extend(loop)
        center = [sum(point[axis] for point in loop) / len(loop) for axis in range(3)]
        positions.append(center)
        center_index = len(positions) - 1
        for i in range(len(loop)):
            triangle = [center_index, base + i, base + (i + 1) % len(loop)]
            a, b, c = [positions[index] for index in triangle]
            cross_x = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1])
            if cross_x * -side < 0:
                triangle[1], triangle[2] = triangle[2], triangle[1]
            indices.extend(triangle)
    return {"POSITION": positions, "NORMAL": [[-side, 0, 0] for _ in positions]}, indices


def rounded_rect(x, y, width, height, radius, segments=12):
    result = []
    for cx, cy, start in [(x + width - radius, y + radius, -90),
                           (x + width - radius, y + height - radius, 0),
                           (x + radius, y + height - radius, 90),
                           (x + radius, y + radius, 180)]:
        for step in range(segments):
            angle = math.radians(start + 90 * step / segments)
            result.append([cx + radius * math.cos(angle), cy + radius * math.sin(angle)])
    return result


def screen_carrier():
    """A beveled physical carrier with a real hole, not a dark screen plane."""
    outer = rounded_rect(252, 32, 696, 420, 16)
    # Opening exceeds the HTML screen by one pixel each side, never clipping it.
    inner = rounded_rect(269, 49, 662, 373.25, 1)
    top_outer = rounded_rect(253.5, 33.5, 693, 417, 14.5)
    top_inner = rounded_rect(268, 48, 664, 375.25, 2)
    # Keep a narrow 1.5-unit manufactured chamfer. The broad front surface has
    # its own flat normal rather than being averaged into the rounded sides;
    # that averaging made the old black frame look like soft foam.
    rings = [([[x - 600, 250 - y, depth] for x, y in contour])
             for contour, depth in [(outer, -13), (outer, 19), (top_outer, 20.5),
                                     (top_inner, 20.5), (inner, 19), (inner, -13)]]
    positions, normals, indices, lens_indices = [], [], [], []
    size = len(outer)
    for first, second in [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 0)]:
        band_positions = rings[first] + rings[second]
        band_indices = []
        for i in range(size):
            a, b = i, (i + 1) % size
            c, d = size + i, size + (i + 1) % size
            # The UI contours become clockwise when the Y axis is converted.
            # Reverse winding so the carrier's visible face points toward +Z.
            band_indices.extend([a, c, b, b, c, d])
        band, _ = smooth_geometry(band_positions, band_indices)
        offset = len(positions)
        positions.extend(band_positions)
        normals.extend(band["NORMAL"])
        target = lens_indices if (first, second) in [(3, 4), (4, 5)] else indices
        target.extend(index + offset for index in band_indices)
    attributes = {"POSITION": positions, "NORMAL": normals}
    return attributes, indices, lens_indices


def smooth_geometry(positions, indices):
    normals = [[0, 0, 0] for _ in positions]
    for step in range(0, len(indices), 3):
        ia, ib, ic = indices[step:step + 3]
        a, b, c = positions[ia], positions[ib], positions[ic]
        ab, ac = [b[j] - a[j] for j in range(3)], [c[j] - a[j] for j in range(3)]
        cross = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2],
                 ab[0] * ac[1] - ab[1] * ac[0]]
        for index in (ia, ib, ic):
            normals[index] = [normals[index][j] + cross[j] for j in range(3)]
    return {"POSITION": positions, "NORMAL": [normal(v) for v in normals]}, indices


def volume_channel():
    # A small inset on the bottom edge lines up with the existing on-body slider.
    contour = rounded_rect(524, 436.5, 152, 15.5, 4, 8)
    positions = [[x - 600, 250 - y, 20.58] for x, y in contour]
    positions.append([0, 250 - 444.25, 20.58])
    indices = []
    for i in range(len(contour)):
        indices.extend([len(contour), (i + 1) % len(contour), i])
    return {"POSITION": positions, "NORMAL": [[0, 0, 1] for _ in positions]}, indices


def convex_hull_xy(positions):
    """The cap silhouette is convex, including each rounded D-pad direction."""
    points = sorted(set((round(p[0], 6), round(p[1], 6)) for p in positions))

    def turn(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

    lower, upper = [], []
    for target, sequence in [(lower, points), (upper, reversed(points))]:
        for point in sequence:
            while len(target) >= 2 and turn(target[-2], target[-1], point) <= 1e-8:
                target.pop()
            target.append(point)
    return lower[:-1] + upper[:-1]


def cap_bevel(mesh, width=0.8):
    """Split the original curved cap into an ivory center and a narrow rim.

    Half-plane clipping follows the actual projected outline, rather than
    adding a black circular stroke or flattening the original key geometry.
    The same silhouette and control footprint are retained exactly.
    """
    attributes = mesh["attributes"]
    hull = convex_hull_xy(attributes["POSITION"])
    output = [{name: [] for name in attributes} for _ in range(2)]
    indices, welds = [[], []], [{}, {}]

    def append_polygon(polygon, destination):
        if len(polygon) < 3:
            return
        polygon_indices = []
        for vertex in polygon:
            vertex = copy.deepcopy(vertex)
            if "NORMAL" in vertex:
                vertex["NORMAL"] = normal(vertex["NORMAL"])
            if "TANGENT" in vertex:
                vertex["TANGENT"] = normal(vertex["TANGENT"][:3]) + vertex["TANGENT"][3:]
            key = tuple(round(v, 7) for name in sorted(vertex) for v in vertex[name])
            if key not in welds[destination]:
                welds[destination][key] = len(output[destination]["POSITION"])
                for name in attributes:
                    output[destination][name].append(vertex[name])
            polygon_indices.append(welds[destination][key])
        for i in range(1, len(polygon_indices) - 1):
            tri = [polygon_indices[0], polygon_indices[i], polygon_indices[i + 1]]
            a, b, c = [output[destination]["POSITION"][n] for n in tri]
            ab, ac = [b[j] - a[j] for j in range(3)], [c[j] - a[j] for j in range(3)]
            cross = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2],
                     ab[0] * ac[1] - ab[1] * ac[0]]
            if sum(v * v for v in cross) > 1e-14:
                indices[destination].extend(tri)

    for i in range(0, len(mesh["indices"]), 3):
        remaining = [{key: values[index] for key, values in attributes.items()}
                     for index in mesh["indices"][i:i + 3]]
        for a, b in zip(hull, hull[1:] + hull[:1]):
            edge = [b[0] - a[0], b[1] - a[1]]
            length = math.hypot(*edge)

            def distance(vertex):
                p = vertex["POSITION"]
                return (edge[0] * (p[1] - a[1]) - edge[1] * (p[0] - a[0])) / length - width

            inside, outside = [], []
            for previous, current in zip(remaining[-1:] + remaining[:-1], remaining):
                dp, dc = distance(previous), distance(current)
                if (dp >= 0) != (dc >= 0):
                    crossing = interpolate(previous, current, dp / (dp - dc))
                    inside.append(crossing)
                    outside.append(crossing)
                (inside if dc >= 0 else outside).append(current)
            append_polygon(outside, 1)
            remaining = inside
            if not remaining:
                break
        append_polygon(remaining, 0)
    return [(output[destination], indices[destination]) for destination in range(2)]


def grip_light_guide(mesh, side, radius=0.48):
    """Follow the original white/black front seam with a small physical tube.

    The main white-shell boundary also contains its rear/outer silhouette.
    Starting at the inner-most point and walking only to the first upper Y
    extremum and a lower grip cutoff selects the actual front seam, excluding
    all of those outer edges and the smaller button-hole boundary loops.
    """
    vertices, edges = {}, {}
    for i in range(0, len(mesh["indices"]), 3):
        triangle = [mesh["attributes"]["POSITION"][index]
                    for index in mesh["indices"][i:i + 3]]
        keys = [tuple(round(number, 5) for number in p) for p in triangle]
        for key, position in zip(keys, triangle):
            vertices[key] = position
        for a, b in zip(keys, keys[1:] + keys[:1]):
            if a != b:
                edge = tuple(sorted((a, b)))
                edges[edge] = edges.get(edge, 0) + 1
    adjacency = {}
    for (a, b), count in edges.items():
        if count == 1:
            adjacency.setdefault(a, set()).add(b)
            adjacency.setdefault(b, set()).add(a)
    remaining, components = set(adjacency), []
    while remaining:
        queue, component = [min(remaining)], set()
        while queue:
            point = queue.pop()
            if point in component:
                continue
            component.add(point)
            queue.extend(adjacency[point] - component)
        remaining -= component
        components.append(component)
    boundary = max(components, key=len)
    if any(len(adjacency[point]) != 2 for point in boundary):
        raise ValueError("Expected a closed two-neighbor white-shell boundary")
    seed = min(boundary, key=lambda point: (abs(point[0]), point))
    neighbors = sorted(adjacency[seed], key=lambda point: (point[1], point))

    def walk(first, upwards):
        previous, current = seed, first
        line = [vertices[seed]]
        while len(line) <= len(boundary):
            if not upwards and current[1] < -150:
                a, b = line[-1], vertices[current]
                t = (-150 - a[1]) / (b[1] - a[1])
                line.append([a[axis] + (b[axis] - a[axis]) * t for axis in range(3)])
                break
            line.append(vertices[current])
            following = next(point for point in adjacency[current] if point != previous)
            if upwards and following[1] <= current[1]:
                break
            if current == seed:
                raise ValueError("Failed to isolate the inner white-shell seam")
            previous, current = current, following
        return line

    above = walk(neighbors[-1], True)
    below = walk(neighbors[0], False)
    line = list(reversed(above)) + below[1:]
    # Sit within the seam on the black side, slightly forward of its surface.
    line = [[p[0] - side * 0.7, p[1], p[2] + 0.38] for p in line]
    positions, indices = [], []
    for i, point in enumerate(line):
        previous, following = line[max(0, i - 1)], line[min(len(line) - 1, i + 1)]
        tangent = normal([following[axis] - previous[axis] for axis in range(3)])
        transverse = normal([-tangent[1], tangent[0], 0])
        second = normal([tangent[1] * transverse[2] - tangent[2] * transverse[1],
                         tangent[2] * transverse[0] - tangent[0] * transverse[2],
                         tangent[0] * transverse[1] - tangent[1] * transverse[0]])
        for segment in range(8):
            angle = segment * math.pi / 4
            positions.append([point[axis] + radius * (transverse[axis] * math.cos(angle)
                                                       + second[axis] * math.sin(angle))
                              for axis in range(3)])
    for i in range(len(line) - 1):
        for segment in range(8):
            a, b = i * 8 + segment, i * 8 + (segment + 1) % 8
            c, d = (i + 1) * 8 + segment, (i + 1) * 8 + (segment + 1) % 8
            indices.extend([a, b, c, b, d, c])
    for end, sign in [(0, -1), (len(line) - 1, 1)]:
        center_index = len(positions)
        positions.append(line[end])
        for segment in range(8):
            a, b = end * 8 + segment, end * 8 + (segment + 1) % 8
            indices.extend([center_index, b, a] if sign == -1 else [center_index, a, b])
    return smooth_geometry(positions, indices)


def glyph_geometry(cap, strokes, radius=0.42):
    """Create molded 3D lines directly on the original curved button surface."""
    cap_positions = cap["attributes"]["POSITION"]
    cap_indices = cap["indices"]
    center = [(min(p[i] for p in cap_positions) + max(p[i] for p in cap_positions)) / 2
              for i in range(3)]

    def surface_z(x, y):
        result = None
        for i in range(0, len(cap_indices), 3):
            a, b, c = [cap_positions[index] for index in cap_indices[i:i + 3]]
            divisor = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
            if abs(divisor) < 1e-9:
                continue
            wa = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / divisor
            wb = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / divisor
            wc = 1 - wa - wb
            if min(wa, wb, wc) >= -1e-6:
                z = wa * a[2] + wb * b[2] + wc * c[2]
                result = z if result is None else max(result, z)
        return (result if result is not None else max(p[2] for p in cap_positions)) + 0.1

    positions, indices = [], []
    for stroke in strokes:
        line = []
        for a, b in zip(stroke[:-1], stroke[1:]):
            steps = max(1, math.ceil(math.hypot(b[0] - a[0], b[1] - a[1]) / 2))
            line.extend([[a[0] + (b[0] - a[0]) * s / steps,
                          a[1] + (b[1] - a[1]) * s / steps] for s in range(steps)])
        line.append(stroke[-1])
        base = len(positions)
        for i, point in enumerate(line):
            previous, following = line[max(0, i - 1)], line[min(len(line) - 1, i + 1)]
            direction = normal([following[0] - previous[0], following[1] - previous[1], 0])
            perpendicular = [-direction[1], direction[0]]
            x, y = center[0] + point[0], center[1] + point[1]
            z = surface_z(x, y)
            for segment in range(8):
                angle = segment * 2 * math.pi / 8
                positions.append([x + perpendicular[0] * radius * math.cos(angle),
                                  y + perpendicular[1] * radius * math.cos(angle),
                                  z + radius * math.sin(angle)])
        for i in range(len(line) - 1):
            for segment in range(8):
                a = base + i * 8 + segment
                b = base + i * 8 + (segment + 1) % 8
                c = base + (i + 1) * 8 + segment
                d = base + (i + 1) * 8 + (segment + 1) % 8
                indices.extend([a, b, c, b, d, c])
    return smooth_geometry(positions, indices)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path,
                        default=Path("public/assets/hardware/ps-portal/portal.glb"))
    parser.add_argument("--download-source", action="store_true")
    args = parser.parse_args()
    if args.download_source:
        args.source.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(SOURCE_URL, timeout=40) as response:
            args.source.write_bytes(response.read())
    source, binary = load_glb(args.source)
    document = {"asset": {"version": "2.0", "generator": "prepare-portal-model.py",
                 "extras": {"author": "Taohid Animation; prepared by Safa Elmali",
                 "license": "CC-BY-4.0", "source": SOURCE_URL,
                 "title": "Portal-inspired large-screen frame adapted from DualSense",
                 "modifications": "Retained curved grips and controls; clipped and capped central shells; added narrow-chamfer screen carrier, independently finished key rims, molded symbols and seam light guides; repositioned two grips; adapted depth; centered control origins."}},
                "scene": 0, "scenes": [{"nodes": [0]}],
                "nodes": [{"name": "PS_Portal_Adapted", "children": [],
                           "extras": {"screenUI": SCREEN, "volumeUI": [525, 438, 150, 13],
                                      "sourceXYScale": XY_SCALE, "sourceZScale": Z_SCALE}}],
                "meshes": [], "materials": [], "accessors": [], "bufferViews": [],
                "buffers": [{"byteLength": 0}], "images": [],
                "textures": [], "samplers": []}
    data = bytearray()

    def view(blob, target=None):
        while len(data) % 4:
            data.append(0)
        result = {"buffer": 0, "byteOffset": len(data), "byteLength": len(blob)}
        if target:
            result["target"] = target
        document["bufferViews"].append(result)
        data.extend(blob)
        return len(document["bufferViews"]) - 1

    def accessor(values, key=None):
        is_index = key is None
        size = 1 if is_index else len(values[0])
        blob = b"".join(struct.pack("<" + ("I" if is_index else "f") * size,
                                    *([value] if is_index else value)) for value in values)
        result = {"bufferView": view(blob, 34963 if is_index else 34962),
                  "componentType": 5125 if is_index else 5126, "count": len(values),
                  "type": {1: "SCALAR", 2: "VEC2", 3: "VEC3", 4: "VEC4"}[size]}
        if key == "POSITION":
            result["min"] = [min(value[axis] for value in values) for axis in range(3)]
            result["max"] = [max(value[axis] for value in values) for axis in range(3)]
        document["accessors"].append(result)
        return len(document["accessors"]) - 1

    material_roles = {0: "buttons-body", 1: "plastic-black-rear", 2: "plastic-black-detail",
                      3: "buttons-glyph", 4: "plastic-white", 5: "plastic-black",
                      6: "rubber-well", 7: "rubber", 8: "plastic-black-detail",
                      9: "buttons-glyph", 10: "plastic-black-detail", 11: "lights",
                      12: "buttons-dark", 13: "buttons-dark", 14: "buttons",
                      15: "buttons-trigger", 16: "buttons-dark", 17: "buttons",
                      18: "buttons-body", 19: "buttons-glyph-overlay"}
    for index, source_material in enumerate(source["materials"]):
        material = copy.deepcopy(source_material)
        material["name"] = material_roles[index]
        material.pop("normalTexture", None)
        material.pop("occlusionTexture", None)
        pbr = material["pbrMetallicRoughness"]
        pbr.pop("baseColorTexture", None)
        pbr.pop("metallicRoughnessTexture", None)
        pbr["metallicFactor"] = 0
        pbr["roughnessFactor"] = (0.78 if material["name"].startswith("rubber") else
                                  0.52 if material["name"].startswith("plastic") else 0.42)
        if index == 1:
            # Former back shell becomes the inside of the separated grip. A
            # neutral dark polymer avoids the original large checker normal map.
            pbr["baseColorFactor"] = [0.004, 0.0045, 0.0055, 1]
            pbr["roughnessFactor"] = 0.67
        if index == 7:
            pbr["baseColorFactor"] = [0.012, 0.012, 0.014, 1]
        document["materials"].append(material)
    document["materials"].append({"name": "lens", "doubleSided": False,
                                  "pbrMetallicRoughness": {"baseColorFactor": [0.005, 0.008, 0.012, 1],
                                                           "metallicFactor": 0, "roughnessFactor": 0.34}})
    lens_material = len(document["materials"]) - 1
    document["materials"].append({"name": "plastic-black-carrier", "doubleSided": False,
                                  "pbrMetallicRoughness": {"baseColorFactor": [0.003, 0.004, 0.006, 1],
                                                           "metallicFactor": 0, "roughnessFactor": 0.64}})
    carrier_material = len(document["materials"]) - 1
    document["materials"].append({"name": "plastic-black-volume", "doubleSided": True,
                                  "pbrMetallicRoughness": {"baseColorFactor": [0.001, 0.001, 0.001, 1],
                                                           "metallicFactor": 0, "roughnessFactor": 0.85}})
    volume_material = len(document["materials"]) - 1
    document["materials"].append({"name": "buttons-glyph-molded", "doubleSided": True,
                                  "pbrMetallicRoughness": {"baseColorFactor": [0.32, 0.35, 0.39, 1],
                                                           "metallicFactor": 0, "roughnessFactor": 0.58}})
    glyph_material = len(document["materials"]) - 1
    document["materials"].append({"name": "buttons-center", "doubleSided": False,
                                  "pbrMetallicRoughness": {"baseColorFactor": [0.79, 0.80, 0.81, 1],
                                                           "metallicFactor": 0, "roughnessFactor": 0.43}})
    button_center_material = len(document["materials"]) - 1
    document["materials"].append({"name": "buttons-rim", "doubleSided": False,
                                  "pbrMetallicRoughness": {"baseColorFactor": [0.60, 0.64, 0.68, 1],
                                                           "metallicFactor": 0, "roughnessFactor": 0.26}})
    button_rim_material = len(document["materials"]) - 1
    document["materials"].append({"name": "lights-blue-guide", "doubleSided": False,
                                  "emissiveFactor": [0.012, 0.065, 0.6],
                                  "pbrMetallicRoughness": {"baseColorFactor": [0.015, 0.08, 0.47, 1],
                                                           "metallicFactor": 0, "roughnessFactor": 0.32}})
    light_material = len(document["materials"]) - 1

    raw_meshes = []
    split_shells = {"back-shell", "black-front-shell"}
    keep_parts = {"white-shell-left", "white-shell-right", "left-stick-well", "right-stick-well",
                  "left-stick-well-ring-decal", "right-stick-well-ring-decal"}
    controls = {"left", "right", "up", "down", "cross", "circle", "square", "triangle",
                "left-stick", "right-stick", "l1", "r1", "l2", "r2", "create", "options"}
    names = {"up": "button-up", "down": "button-down", "left": "button-left",
             "right": "button-right", "cross": "button-j", "circle": "button-k",
             "create": "button-info", "options": "button-index"}
    for node in source["nodes"]:
        if "mesh" not in node:
            continue
        extras = node.get("extras", {})
        part, control = extras.get("part"), extras.get("control")
        if part and "decal" in part:
            continue
        if part not in keep_parts and part not in split_shells and control not in controls:
            continue
        primitive = source["meshes"][node["mesh"]]["primitives"][0]
        positions = source["accessors"][primitive["attributes"]["POSITION"]]
        side = -1 if (positions["min"][0] + positions["max"][0]) < 0 else 1
        for grip_side in [-1, 1] if part in split_shells else [side]:
            attributes, indices, segments = prepare_geometry(source, binary, primitive, grip_side, part in split_shells)
            label = ("left" if grip_side == -1 else "right") + "-" + node["name"]
            group = names.get(control, "control-" + control) if control else "grip-" + ("left" if grip_side == -1 else "right")
            raw_meshes.append({"name": label, "group": group, "attributes": attributes,
                               "indices": indices, "material": primitive["material"], "extras": extras})
            if segments:
                cap_attributes, cap_indices = cap_geometry(segments, grip_side)
                if cap_indices:
                    raw_meshes.append({"name": label + "-closed-inner-edge", "group": group,
                                       "attributes": cap_attributes, "indices": cap_indices,
                                       "material": primitive["material"], "extras": {"part": "new-cut-cap"}})
    glyphs = {
        "cross": [[[-7, -7], [7, 7]], [[-7, 7], [7, -7]]],
        "square": [[[-7, -7], [-7, 7], [7, 7], [7, -7], [-7, -7]]],
        "triangle": [[[-8, -6], [0, 8], [8, -6], [-8, -6]]],
        "circle": [[[8 * math.cos(s * math.pi / 20), 8 * math.sin(s * math.pi / 20)]
                     for s in range(41)]],
        "up": [[[-4, -1], [0, 3], [4, -1]]],
        "down": [[[-4, 1], [0, -3], [4, 1]]],
        "left": [[[1, -4], [-3, 0], [1, 4]]],
        "right": [[[-1, -4], [3, 0], [-1, 4]]],
    }
    for control, strokes in glyphs.items():
        cap = next(mesh for mesh in raw_meshes if mesh["extras"].get("control") == control
                   and mesh["extras"].get("part") == "cap")
        # Molded symbols are deliberately small and low-relief, not black ink.
        strokes = [[[coordinate * 0.85 for coordinate in point] for point in stroke]
                   for stroke in strokes]
        attributes, indices = glyph_geometry(cap, strokes, 0.42 if control in {"cross", "circle", "square", "triangle"} else 0.29)
        raw_meshes.append({"name": "molded-ps-" + control, "group": cap["group"],
                           "attributes": attributes, "indices": indices, "material": glyph_material,
                           "extras": {"control": control, "part": "new-molded-symbol"}})

    for cap in list(raw_meshes):
        if cap["extras"].get("part") != "cap" or cap["extras"].get("control") not in glyphs:
            continue
        (center_attributes, center_indices), (rim_attributes, rim_indices) = cap_bevel(cap)
        cap.update({"attributes": center_attributes, "indices": center_indices,
                    "material": button_center_material})
        raw_meshes.append({"name": cap["name"] + "-acrylic-rim", "group": cap["group"],
                           "attributes": rim_attributes, "indices": rim_indices,
                           "material": button_rim_material,
                           "extras": {"control": cap["extras"]["control"], "part": "new-cap-bevel", "width": 0.8}})
    for side, part in [(-1, "white-shell-left"), (1, "white-shell-right")]:
        shell = next(mesh for mesh in raw_meshes if mesh["extras"].get("part") == part)
        guide_attributes, guide_indices = grip_light_guide(shell, side)
        raw_meshes.append({"name": "seam-light-guide-" + ("left" if side == -1 else "right"),
                           "group": shell["group"], "attributes": guide_attributes, "indices": guide_indices,
                           "material": light_material,
                           "extras": {"part": "new-seam-light-guide", "diameter": 0.96}})

    carrier_attributes, carrier_indices, carrier_lens_indices = screen_carrier()
    raw_meshes.append({"name": "portal-screen-carrier", "group": "carrier",
                       "attributes": carrier_attributes, "indices": carrier_indices,
                       "material": carrier_material, "extras": {"screenUI": SCREEN}})
    raw_meshes.append({"name": "portal-screen-inner-lip", "group": "carrier",
                       "attributes": copy.deepcopy(carrier_attributes), "indices": carrier_lens_indices,
                       "material": lens_material, "extras": {"screenUI": SCREEN}})
    channel_attributes, channel_indices = volume_channel()
    raw_meshes.append({"name": "volume-channel", "group": "carrier", "attributes": channel_attributes,
                       "indices": channel_indices, "material": volume_material,
                       "extras": {"volumeUI": [525, 438, 150, 13]}})

    groups, control_boxes = {}, {}
    for mesh in raw_meshes:
        groups.setdefault(mesh["group"], []).append(mesh)
    for name, meshes in groups.items():
        positions = [position for mesh in meshes for position in mesh["attributes"]["POSITION"]]
        minimum = [min(value[axis] for value in positions) for axis in range(3)]
        maximum = [max(value[axis] for value in positions) for axis in range(3)]
        center = [(minimum[axis] + maximum[axis]) / 2 for axis in range(3)] if name.startswith(("button-", "control-")) else [0, 0, 0]
        group_node = {"name": name, "children": [], "translation": center,
                      "extras": {"bounds": {"min": minimum, "max": maximum}}}
        if name.startswith("button-"):
            bounds = [minimum[0] + 600, 250 - maximum[1], maximum[0] - minimum[0], maximum[1] - minimum[1]]
            group_node["extras"]["hotspotUI"] = [round(value, 3) for value in bounds]
            control_boxes[name[7:]] = group_node["extras"]["hotspotUI"]
        document["nodes"].append(group_node)
        group_index = len(document["nodes"]) - 1
        document["nodes"][0]["children"].append(group_index)
        for mesh in meshes:
            mesh["attributes"]["POSITION"] = [[value[axis] - center[axis] for axis in range(3)]
                                              for value in mesh["attributes"]["POSITION"]]
            primitive = {"attributes": {key: accessor(values, key) for key, values in mesh["attributes"].items()},
                         "indices": accessor(mesh["indices"]), "material": mesh["material"], "mode": 4}
            document["meshes"].append({"name": mesh["name"], "primitives": [primitive]})
            document["nodes"].append({"name": mesh["name"], "mesh": len(document["meshes"]) - 1,
                                      "extras": mesh["extras"]})
            group_node["children"].append(len(document["nodes"]) - 1)
    while len(data) % 4:
        data.append(0)
    document["buffers"][0]["byteLength"] = len(data)
    encoded = json.dumps(document, separators=(",", ":")).encode("utf-8")
    encoded += b" " * ((-len(encoded)) % 4)
    output = (struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(encoded) + 8 + len(data))
              + struct.pack("<II", len(encoded), 0x4E4F534A) + encoded
              + struct.pack("<II", len(data), 0x004E4942) + data)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(output)
    report = {"sourceCommit": SOURCE_COMMIT, "sourceSHA256": SOURCE_SHA,
              "modelSHA256": hashlib.sha256(output).hexdigest(), "bytes": len(output),
              "meshes": len(raw_meshes), "triangles": sum(len(mesh["indices"]) // 3 for mesh in raw_meshes),
              "refinements": {"carrierChamfer": 1.5, "glassLipWidth": 1.0,
                              "capRimWidth": 0.8, "lightGuideDiameter": 0.96,
                              "lightGuideSource": "original white-shell boundary geometry"},
              "screenUI": SCREEN, "hotspotsUI": control_boxes, "volumeUI": [525, 438, 150, 13]}
    args.output.with_name("model-metadata.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
