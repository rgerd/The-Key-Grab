'use strict';
const laser_speed = 300;
class Laser {
  constructor(position, rotation) {
    this.model = this.createLaserModel();
    this.position = position;
    this.model.position.set(this.position.x, this.position.y, this.position.z);
    this.model.rotation.y = rotation.y;
    this.rotation = rotation;
    this.isDead = false;

    // Rotation never changes, just cache velocity
    this.vx = Math.sin(this.rotation.y) * laser_speed;
    this.vz = Math.cos(this.rotation.y) * laser_speed;

    this.collider = {
      id: this.model.id,
      type: "sphere",
      source: "laser",
      position: this.position,
      radius: 0.5,
      radius2: 0.5 * 0.5,
      cell: {
        x: ~~(this.position.x / collider_cell_size) + (num_collider_cells >> 1),
        y: ~~(this.position.z / collider_cell_size) + (num_collider_cells >> 1)
      },
    };
  }

  createLaserModel() {
    const color = ~~(Math.random() * 0xffffff);
    this.color = color;
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 1.0);
    const material = new THREE.MeshBasicMaterial({color});
    const mesh = new THREE.Mesh(geometry, material);
    const anchor = new THREE.Object3D();
    mesh.position.z = 0.35;
    anchor.add(mesh);
    return anchor;
  }

  animate(dtime) {
    this.position.x -= this.vx * dtime;
    this.position.z -= this.vz * dtime;
    this.model.position.set(this.position.x, this.position.y, this.position.z);

    this.isDead = this.position.x <= -room_size2
               || this.position.x >= room_size2
               || this.position.z <= -room_size2
               || this.position.z >= room_size2
               || this.collider.collided;

     const collider_position = {
       x: ~~(this.position.x / collider_cell_size) + num_collider_cells >> 1,
       y: ~~(this.position.z / collider_cell_size) + num_collider_cells >> 1
     };
     if(collider_position.x != this.collider.cell.x
     || collider_position.y != this.collider.cell.y) {
       updateColliderPosition(this.collider.cell, collider_position, this.collider.id, this.collider);
       this.collider.cell.x = collider_position.x;
       this.collider.cell.y = collider_position.y;
     }
  }

  getModel() { return this.model }
  getCollider() { return this.collider }
  getColor() { return this.color }
}
