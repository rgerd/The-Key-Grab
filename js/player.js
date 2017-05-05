'use strict';

class Player {
  constructor(position, head) {
    this.position = new THREE.Vector2(position.x, position.z);
    this.head = head;
    this.head.position.set(position.x, position.y, position.z);

    this.gun = this.createGunModel();
    this.head.add(this.gun);

    this.controls = {
      dx: 0,
      dz: 0,
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    this.collider = {
      type: "cylinder",
      source: "player",
      radius: 4.5,
      radius2: 4.5 * 4.5,
      height: 3,
      position: this.position
    };

    this.health = 100;

    document.addEventListener('keydown', (keyEvent) => this.onKeyDown(keyEvent), false );
    document.addEventListener('keyup', (keyEvent) => this.onKeyUp(keyEvent), false );
    document.addEventListener('mousedown', (mouseEvent) => this.onMouseDown(mouseEvent), false);
  }

  createGunModel() {
    const handleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const muzzleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.6);

    const metalMaterial = new THREE.MeshStandardMaterial( { color: 0x444444, metalness: 1, roughness: 0.4 } );

    const handle = new THREE.Mesh(handleGeometry, metalMaterial);
    const muzzle = new THREE.Mesh(muzzleGeometry, metalMaterial);

    muzzle.position.y = 0.2;
    handle.position.z = -0.2;

    const gun = new THREE.Group();
    gun.add(muzzle); gun.add(handle);

    gun.rotation.y = Math.PI;
    gun.position.x = 1;
    gun.position.y = -1;
    gun.position.z = -2;

    return gun;
  }

  onKeyDown(keyEvent) {
    const keyCode = keyEvent.keyCode;

    switch(keyCode) {
      case 87: // W
      this.controls.forward = true;
      this.controls.dz = -1;
      break;
      case 65: // A
      this.controls.left = true;
      this.controls.dx = -1;
      break;
      case 83: // S
      this.controls.backward = true;
      this.controls.dz = 1;
      break;
      case 68: // D
      this.controls.right = true;
      this.controls.dx = 1;
      break;
    }

    if((this.health == 0 || this.winner) && keyCode == 32) {
      location.reload();
    }
  }

  onKeyUp(keyEvent) {
    const keyCode = keyEvent.keyCode;
    switch(keyCode) {
      case 87: // W
      this.controls.forward = false;
      this.controls.dz = this.controls.backward ? 1 : 0;
      break;
      case 65: // A
      this.controls.left = false;
      this.controls.dx = this.controls.right ? 1 : 0;
      break;
      case 83: // S
      this.controls.backward = false;
      this.controls.dz = this.controls.forword ? -1 : 0;
      break;
      case 68: // D
      this.controls.right = false;
      this.controls.dx = this.controls.left ? -1 : 0;
      break;
    }
  }

  onMouseDown(mouseEvent) {
    if(loading) return;

    const button = mouseEvent.button;
    const roty = this.head.rotation.y;

    const _roty = roty + -0.46364760900080611; // Angle to gun (atan(1/-2))
    const dist = 2.2360679775; // Dist to gun (sqrt(5))

    const _dx = this.controls.dx;
    const _dz = this.controls.dz;
    const _sin = Math.sin(roty);
    const _cos = Math.cos(roty);

    const vx = _dx * _cos + _dz * _sin; // Account for player momentum
    const vy = _dz * _cos + _dx * -_sin;

    const muzzlePosition = {
      x: this.position.x - dist * Math.sin(_roty) - 1 * _sin + vx * 0.05,
      y: 2.2,
      z: this.position.y - dist * Math.cos(_roty) - 1 * _cos + vy * 0.05,
    };
    this.gun.rotation.x = Math.PI / 4;
    spawnLaser(new Laser(muzzlePosition, { x: 0, y: roty, z: 0 }));
  }

  animate(dtime) {
    const player_speed = 60;
    let _dx = this.controls.dx * dtime * player_speed;
    let _dz = this.controls.dz * dtime * player_speed;

    if(_dx != 0 && _dz != 0) {
      _dx /= sqrt2;
      _dz /= sqrt2;
    }

    const _sin = Math.sin(this.head.rotation.y);
    const _cos = Math.cos(this.head.rotation.y);

    const vx = _dx * _cos + _dz * _sin;
    const vy = _dz * _cos + _dx * -_sin;
    if(this.position.x + vx - 1.6 > -room_size2
    && this.position.x + vx + 1.6 < room_size2)
      this.position.x += vx;

    if(this.position.y + vy - 1.6 > -room_size2
    && this.position.y + vy + 1.6 < room_size2)
      this.position.y += vy;

    this.head.position.x = this.position.x;
    this.head.position.z = this.position.y;

    if(this.gun.rotation.x > 0)
      this.gun.rotation.x -= Math.PI * 12 * dtime;
    else this.gun.rotation.x = 0;

    if(!this.hasKey) return;
    var door_dx = this.position.x;
    var door_dz = this.position.y - (-room_size2);
    if(door_dx * door_dx + door_dz * door_dz < 50) {
      this.head.remove(this.key.getModel());
      doorMaterial.map = door_textures[1];
      setTimeout(() => {
        player.winner = true;
        winOverlay.className = "winner";
      }, 1000);
    }
  }

  getPosition() { return this.position }
  getCollider() { return this.collider }

  equipKey() {
    this.key = new Key({x:-1, y: -0.7, z: -2});
    this.head.add(this.key.getModel());
    this.hasKey = true;
  }

  hurt(amt) {
    this.health -= 150 * amt;
    this.health = this.health < 0 ? 0 : this.health;
    healthOverlay.style.opacity = 1.0 - (this.health / 100.0);
    if(this.health == 0) {
      this.dead = true;
      healthOverlay.className = "darkness";
    }
  }

  heal() {
    this.health += Math.random() * 10 + 5;
    this.health = this.health > 100 ? 100 : this.health;
    healthOverlay.style.opacity = 1.0 - (this.health / 100.0);
  }

  isDead() { this.dead }
}
