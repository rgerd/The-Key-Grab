'use strict';

function createAnchorWrapper(mesh, anchor) {
  const wrapper = new THREE.Object3D();
  mesh.position.x -= anchor.x;
  mesh.position.y -= anchor.y;
  mesh.position.z -= anchor.z;
  wrapper.add(mesh);
  wrapper.position.x = anchor.x;
  wrapper.position.y = anchor.y;
  wrapper.position.z = anchor.z;
  return wrapper;
}

function normalize2d(vec2d) {
  const mag = Math.sqrt(vec2d.x * vec2d.x + vec2d.y * vec2d.y);
  if(mag == 0) return { x: 0, y: 0, };
  return {
    x: vec2d.x / mag,
    y: vec2d.y / mag
  };
}
