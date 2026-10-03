"""Adapt wallmasterr's CC BY 4.0 Steam Deck glTF to the common game aperture.

Usage: python3 scripts/prepare-steam-deck-model.py /path/to/original/steam-deck
Reads scene.gltf + scene.bin, emits one self-contained geometry-only GLB.
No downloaded code is executed and no image atlas or original game UI is retained.
"""
import collections
import hashlib
import json
import math
from pathlib import Path
import struct
import sys

SOURCE = Path(sys.argv[1])
TARGET = Path(__file__).resolve().parents[1] / 'public/assets/hardware/steam-deck/deck.glb'
SOURCE_TOP, SOURCE_BOTTOM, SOURCE_HALF = 1.73579, -1.06648, 2.26226
SY = 371.25 / (SOURCE_TOP - SOURCE_BOTTOM)
SX_CENTER = 330 / SOURCE_HALF
SX_WING = 260 / (4.45679 - SOURCE_HALF)

document = json.loads((SOURCE / 'scene.gltf').read_text())
binary = (SOURCE / 'scene.bin').read_bytes()
expected = {'scene.gltf': '62dbba2a94a6204d379250fc8b8ec8a8e00c093c256cdee8129e92c43ff5063e',
            'scene.bin': '59814171fb932a5af47eb807cf0083982eec9aaad9056445759356ff3a531119'}
for filename, digest in expected.items():
    if hashlib.sha256((SOURCE / filename).read_bytes()).hexdigest() != digest:
        raise ValueError(f'{filename} differs from the reviewed CC BY 4.0 source')

def read_accessor(index):
    accessor = document['accessors'][index]
    view = document['bufferViews'][accessor['bufferView']]
    width = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[accessor['type']]
    fmt = {5126: 'f', 5125: 'I', 5123: 'H'}[accessor['componentType']]
    unit = struct.calcsize(fmt)
    offset = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
    stride = view.get('byteStride', width * unit)
    return [struct.unpack_from('<' + fmt * width, binary, offset + i * stride)
            for i in range(accessor['count'])]

def mapped_vertex(position, normal):
    x, depth, up = position
    outer = abs(x) > SOURCE_HALF
    wx = math.copysign(330 + (abs(x) - SOURCE_HALF) * SX_WING, x) if outer else x * SX_CENTER
    result = [wx, 200 + (up - SOURCE_TOP) * SY, (-depth - 1.05275) * 50]
    nx, ny, nz = normal
    mapped = [nx / (SX_WING if outer else SX_CENTER), nz / SY, -ny / 50]
    length = math.sqrt(sum(n * n for n in mapped)) or 1
    return result + [n / length for n in mapped]

def clip(poly, axis, boundary, less):
    """Clip a polygon, interpolating its original smooth vertex normals."""
    out = []
    for a, b in zip(poly, poly[1:] + poly[:1]):
        ain = a[axis] <= boundary if less else a[axis] >= boundary
        bin = b[axis] <= boundary if less else b[axis] >= boundary
        if ain:
            out.append(a)
        if ain != bin:
            t = (boundary - a[axis]) / (b[axis] - a[axis])
            out.append([a[d] + (b[d] - a[d]) * t for d in range(6)])
    return out

def outside_aperture(triangle):
    # Subtract the complete rectangle even from rear surfaces. The GLB genuinely
    # has a through-hole; the game is never painted onto the model's LCD texture.
    if any(all((v[axis] <= limit if less else v[axis] >= limit) for v in triangle)
           for axis, limit, less in [(0, -330, True), (0, 330, False), (1, 200, False), (1, -171.25, True)]):
        return [triangle]
    pieces, remaining = [], triangle
    for axis, boundary, less in [(0, -330, True), (0, 330, False), (1, 200, False), (1, -171.25, True)]:
        if len(remaining) < 3:
            break
        outside = clip(remaining, axis, boundary, less)
        if len(outside) >= 3:
            pieces.append(outside)
        remaining = clip(remaining, axis, boundary, not less)
    return pieces

def face_cross(vertices):
    a, b, c = vertices
    first = [b[d] - a[d] for d in range(3)]
    second = [c[d] - a[d] for d in range(3)]
    return [first[1] * second[2] - first[2] * second[1],
            first[2] * second[0] - first[0] * second[2],
            first[0] * second[1] - first[1] * second[0]]

def clean_front_faces(polygons, repair_case_normals):
    """Remove clipped zero-area faces and repair only shallow case front normals.

    The original skin's front normals blend into the internal panel side walls.
    Equal-position UV splits are pooled within the near-planar front surface only,
    preventing the thin panel's underside from tilting its visible front normals.
    The curved case perimeter, controls and all vertex positions remain authored.
    """
    valid, seen, discarded = [], set(), 0
    front_sums = collections.defaultdict(lambda: [0., 0., 0.])
    for triangle in polygons:
        cross = face_cross(triangle)
        length = math.sqrt(sum(value * value for value in cross))
        # Clipping at a nearly equal source screen edge can leave micrometer-
        # wide slivers which collapse when POSITION is encoded as float32.
        encoded = [[struct.unpack('<f', struct.pack('<f', vertex[d]))[0] for d in range(3)] for vertex in triangle]
        encoded_cross = face_cross(encoded)
        encoded_length = math.sqrt(sum(value * value for value in encoded_cross))
        position_key = tuple(sorted(tuple(round(vertex[d], 7) for d in range(3)) for vertex in triangle))
        if length <= 1e-6 or encoded_length <= 1e-6 or position_key in seen:
            discarded += 1
            continue
        seen.add(position_key)
        front = repair_case_normals and cross[2] / length > .995 and sum(v[2] for v in triangle) / 3 > -4
        valid.append((triangle, front))
        if front:
            for vertex in triangle:
                key = tuple(round(vertex[d], 5) for d in range(3))
                for axis in range(3):
                    front_sums[key][axis] += cross[axis]
    result, repaired = [], 0
    for triangle, front in valid:
        if front:
            repaired += 1
            cleaned = []
            for vertex in triangle:
                total = front_sums[tuple(round(vertex[d], 5) for d in range(3))]
                length = math.sqrt(sum(value * value for value in total)) or 1
                cleaned.append(vertex[:3] + [value / length for value in total])
            result.append(cleaned)
        else:
            result.append(triangle)
    return result, discarded, repaired

out = {'asset': {'version': '2.0', 'generator': 'MARC Island geometry adaptation',
                 'extras': dict(document['asset']['extras'], modifications='Open 16:9 aperture; wing fit; separate controls; remove original texture atlas; remove zero-area and duplicate clipped faces; area-weighted shallow case-front normals; physically lit materials')},
       'scene': 0, 'scenes': [{'nodes': [0]}],
       'nodes': [{'name': 'physical-steam-deck', 'children': [],
                  'extras': {'screenRect': [270, 50, 660, 371.25], 'modelSource': 'wallmasterr CC BY 4.0'}}],
       'meshes': [], 'materials': [], 'accessors': [], 'bufferViews': [], 'buffers': []}
data = bytearray()
material_ids = {}

def material(name, color, roughness):
    if name in material_ids:
        return material_ids[name]
    index = len(out['materials'])
    # The source's modeled seams and thin panels use two-sided surfaces.
    out['materials'].append({'name': name, 'doubleSided': True, 'pbrMetallicRoughness': {'baseColorFactor': color + [1], 'metallicFactor': 0, 'roughnessFactor': roughness}})
    material_ids[name] = index
    return index

def accessor(rows, components, component_type, target):
    while len(data) % 4:
        data.append(0)
    start = len(data)
    fmt = 'f' if component_type == 5126 else 'I'
    for row in rows:
        data.extend(struct.pack('<' + fmt * components, *row))
    view = len(out['bufferViews'])
    out['bufferViews'].append({'buffer': 0, 'byteOffset': start, 'byteLength': len(data) - start, 'target': target})
    index = len(out['accessors'])
    item = {'bufferView': view, 'componentType': component_type, 'count': len(rows), 'type': {1: 'SCALAR', 3: 'VEC3'}[components]}
    if components == 3:
        item['min'] = [min(row[d] for row in rows) for d in range(3)]
        item['max'] = [max(row[d] for row in rows) for d in range(3)]
    out['accessors'].append(item)
    return index

parts = []
for mesh_index, mesh in enumerate(document['meshes']):
    if mesh_index == 3:  # Discard the original LCD and its baked Steam library.
        continue
    primitive = mesh['primitives'][0]
    positions = read_accessor(primitive['attributes']['POSITION'])
    normals = read_accessor(primitive['attributes']['NORMAL'])
    indices = [row[0] for row in read_accessor(primitive['indices'])]
    parents = list(range(len(positions)))

    def find(i):
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i

    def union(a, b):
        parents[find(a)] = find(b)

    welded = {}
    for i, position in enumerate(positions):
        key = tuple(round(v, 5) for v in position)
        if key in welded:
            union(i, welded[key])
        else:
            welded[key] = i
    for a, b, c in zip(indices[::3], indices[1::3], indices[2::3]):
        union(a, b)
        union(b, c)
    groups = collections.defaultdict(list)
    for a, b, c in zip(indices[::3], indices[1::3], indices[2::3]):
        groups[find(a)].append((a, b, c))
    # Sort by descending triangle count then source root, matching the inspection.
    groups = sorted(groups.items(), key=lambda pair: (-len(pair[1]), pair[0]))
    for component_index, (_, triangles) in enumerate(groups):
        component_id = f'{mesh_index}-0-{component_index}'
        name = f'deck-part-{component_id}'
        role, color, roughness = 'plastic-black', [.028, .031, .036], .75
        if mesh_index == 1:
            name, role, color, roughness = 'direction-cross', 'buttons', [.045, .049, .055], .57
        elif component_id in ['0-0-4', '0-0-5', '0-0-6', '0-0-7']:
            # Front photograph confirms A bottom, B right, X left, Y top.
            name = {'0-0-4': 'face-X', '0-0-5': 'button-k', '0-0-6': 'face-Y', '0-0-7': 'button-j'}[component_id]
            role, color, roughness = 'buttons', [.028, .031, .036], .42
        elif component_id == '0-0-15':
            name, role, color, roughness = 'screen-lens-surround', 'lens', [.004, .005, .006], .2
        elif component_id in ['2-0-7', '2-0-8', '2-0-13', '2-0-14']:
            role, color, roughness = 'rubber', [.017, .020, .023], .84
        elif component_id in ['2-0-15', '2-0-16']:
            role, color, roughness = 'trackpad', [.022, .025, .028], .63
        clipped_triangles = []
        for triangle in triangles:
            transformed = [mapped_vertex(positions[i], normals[i]) for i in triangle]
            for polygon in outside_aperture(transformed):
                for k in range(1, len(polygon) - 1):
                    clipped_triangles.append([polygon[0], polygon[k], polygon[k + 1]])
        clipped_triangles, removed_faces, repaired_front = clean_front_faces(
            clipped_triangles, component_id in ['2-0-0', '2-0-1', '2-0-2'])
        vertices, faces, lookup = [], [], {}
        for triangle in clipped_triangles:
            for vertex in triangle:
                key = tuple(round(value, 7) for value in vertex)
                if key not in lookup:
                    lookup[key] = len(vertices)
                    vertices.append(vertex)
                faces.append((lookup[key],))
        if not vertices or not faces:
            continue
        center = [(max(v[d] for v in vertices) + min(v[d] for v in vertices)) / 2 for d in range(3)]
        pos = [[v[d] - center[d] for d in range(3)] for v in vertices]
        norm = []
        for v in vertices:
            length = math.sqrt(sum(n * n for n in v[3:])) or 1
            norm.append([n / length for n in v[3:]])
        mesh_id = len(out['meshes'])
        out['meshes'].append({'name': name, 'primitives': [{'attributes': {'POSITION': accessor(pos, 3, 5126, 34962), 'NORMAL': accessor(norm, 3, 5126, 34962)}, 'indices': accessor(faces, 1, 5125, 34963), 'material': material(role, color, roughness)}]})
        node_id = len(out['nodes'])
        extras = {'sourceComponent': component_id}
        if name == 'direction-cross':
            extras.update(rocker=True, pressDepth=.8)
        if name.startswith('button-'):
            extras.update(pressDepth=1.4)
        out['nodes'].append({'name': name, 'mesh': mesh_id, 'translation': center, 'extras': extras})
        out['nodes'][0]['children'].append(node_id)
        parts.append({'name': name, 'source': component_id, 'uiCenter': [center[0] + 600, 250 - center[1]], 'triangles': len(faces) // 3,
                      'removedDegenerateOrDuplicateFaces': removed_faces, 'repairedFrontNormalTriangles': repaired_front})

out['buffers'] = [{'byteLength': len(data)}]
text = json.dumps(out, separators=(',', ':')).encode()
text += b' ' * ((-len(text)) % 4)
data.extend(b'\0' * ((-len(data)) % 4))
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(text) + 8 + len(data)) + struct.pack('<II', len(text), 0x4E4F534A) + text + struct.pack('<II', len(data), 0x004E4942) + data
TARGET.parent.mkdir(parents=True, exist_ok=True)
TARGET.write_bytes(glb)
(SOURCE / 'adapted-components.json').write_text(json.dumps(parts, indent=2))
print(f'Wrote {TARGET}: {len(glb):,} bytes, {len(parts)} independently lit parts')
for item in parts:
    if item['name'] in ['direction-cross', 'button-j', 'button-k'] or item['source'] in ['0-0-10', '0-0-12']:
        print(item)
