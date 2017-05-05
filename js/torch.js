'use strict';

class Torch {
  constructor(position) {
    this.model = this.createTorchModel();
    this.model.position.set(position.x, position.y, position.z);
  }

  createTorchModel() {
    const light = new THREE.PointLight(0xffeecc, 2, 50);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(0xffffff)
    );

    this.cube = cube;
    light.add(cube);
    this.light = light;
    
    return light;
  }

  animate(dtime, etime) {
    const scale = ((Math.sin(etime * 2) + 1) / 2 + 4) / 5;
    this.cube.scale.set(scale, scale, scale);
  }

  getModel() { return this.model }
}
