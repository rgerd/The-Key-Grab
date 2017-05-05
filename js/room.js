'use strict';

class Room {
  constructor() {
    this.model = this.createRoomModel();
  }

  createRoomModel() {
    const floorGeometry = new THREE.PlaneGeometry(room_size, room_size, 25);
    const wallGeometry  = new THREE.PlaneGeometry(room_size, room_height, 25);

    const texture_floor = new THREE.TextureLoader().load("imgs/dungeon.jpg");
    texture_floor.wrapS = THREE.RepeatWrapping;
    texture_floor.wrapT = THREE.RepeatWrapping;
    texture_floor.repeat.set(32, 32);

    const texture_floor_bump = new THREE.TextureLoader().load("imgs/dungeon_bump.png");
    texture_floor_bump.wrapS = THREE.RepeatWrapping;
    texture_floor_bump.wrapT = THREE.RepeatWrapping;
    texture_floor_bump.repeat.set(32, 32);

    const texture_wall = new THREE.TextureLoader().load("imgs/dungeon.jpg");
    texture_wall.wrapS = THREE.RepeatWrapping;
    texture_wall.wrapT = THREE.RepeatWrapping;
    texture_wall.repeat.set(32, 4);

    const texture_wall_bump = new THREE.TextureLoader().load("imgs/dungeon_bump.png");
    texture_wall_bump.wrapS = THREE.RepeatWrapping;
    texture_wall_bump.wrapT = THREE.RepeatWrapping;
    texture_wall_bump.repeat.set(32, 4);

    const floorMaterial = new THREE.MeshStandardMaterial( { side: THREE.FrontSide, metalness: 0, roughness: 1, map: texture_floor, bumpMap: texture_floor_bump } );
    const wallMaterial  = new THREE.MeshStandardMaterial( { side: THREE.FrontSide, metalness: 0, roughness: 1, map: texture_wall, bumpMap: texture_wall_bump } );

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotateX(-Math.PI / 2);

    const ciel = new THREE.Mesh(floorGeometry, floorMaterial);
    ciel.rotateX(Math.PI / 2);
    ciel.position.set(0, room_height, 0);

    const wall_n = new THREE.Mesh(wallGeometry, wallMaterial);
    wall_n.position.set(0, room_height / 2, -room_size / 2);

    const wall_e = new THREE.Mesh(wallGeometry, wallMaterial);
    wall_e.rotateY(-Math.PI / 2);
    wall_e.position.set(room_size / 2, room_height / 2, 0);

    const wall_w = new THREE.Mesh(wallGeometry, wallMaterial);
    wall_w.rotateY(-Math.PI / 2);
    wall_w.rotateY(Math.PI);
    wall_w.position.set(-room_size / 2, room_height / 2, 0);

    const wall_s = new THREE.Mesh(wallGeometry, wallMaterial);
    wall_s.rotateY(Math.PI);
    wall_s.position.set(0, room_height / 2, room_size / 2);

    const group = new THREE.Group();
    group.add(floor); group.add(ciel);
    group.add(wall_n); group.add(wall_s);
    group.add(wall_e); group.add(wall_w);

    return group;
  }

  getModel() {
    return this.model;
  }
}
