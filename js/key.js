'use strict';
class Key {
  constructor(position) {
    this.model = this.createKeyModel();
    this.model.position.set(
      position.x, position.y, position.z
    );
    this.originalY = position.y;
    this.offset = -4;
  }

  createKeyModel() {
    const keyMaterial = new THREE.MeshStandardMaterial( { color: 0xeebb44, metalness: 1, roughness: 0.4 } );
    const handle_geom = new THREE.BoxGeometry(0.1, 0.1, 0.2);
    const shaft_geom = new THREE.BoxGeometry(0.1, 0.1, 0.6);
    const tooth_geom = new THREE.BoxGeometry(0.1, 0.1, 0.1);

    const handle_top = new THREE.Mesh(handle_geom, keyMaterial);
    handle_top.position.set(0, 0.1, 0.25);

    const handle_bottom = new THREE.Mesh(handle_geom, keyMaterial);
    handle_bottom.position.set(0, -0.1, 0.25);

    const handle_back = new THREE.Mesh(handle_geom, keyMaterial);
    handle_back.rotation.x = Math.PI / 2;
    handle_back.position.set(0, 0, 0.4);
    handle_back.scale.z = 1.5;

    const shaft = new THREE.Mesh(shaft_geom, keyMaterial);
    shaft.position.set(0, 0, -0.05);

    const tooth1 = new THREE.Mesh(tooth_geom, keyMaterial);
    tooth1.position.set(0, -0.1, -0.3);

    const tooth2 = new THREE.Mesh(tooth_geom, keyMaterial);
    tooth2.position.set(0, -0.1, -0.15);

    const key = new THREE.Group();
    key.add(handle_top); key.add(handle_bottom);
    key.add(handle_back);
    key.add(shaft);
    key.add(tooth1); key.add(tooth2);
    return key;
  }

  animate(dtime, etime) {
    this.model.rotation.y += dtime * Math.PI;
    this.model.position.y = this.originalY + (Math.sin(etime) + 1) * 0.05 + this.offset;

    if(this.offset < 0) this.offset += dtime * 15;
    else this.offset = 0;
  }

  collide(player) {
    const dx = player.position.x - this.model.position.x;
    const dz = player.position.y - this.model.position.z;
    return dx * dx + dz * dz < 2;
  }

  getModel() { return this.model }
}
