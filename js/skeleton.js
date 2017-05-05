'use strict';

const skele_speed = 45;//32;
class Skeleton {
  // Initialize spooky variables
  constructor(position) {
    this.movement = { speed: 0, angle: 0 };
    this.position = new THREE.Vector2(position.x, position.z);

    this.model = this.createSkeletonModel();
    this.model.position.x = this.position.x;
    this.model.position.y = -5;
    this.model.position.z = this.position.y;
    this.rand = Math.random() * Math.PI * 2;

    this.collider = {
      id: this.model.id,
      type: "cylinder",
      source: "spooky",
      radius: 1,
      radius2: 1 * 1,
      height: 3,
      position: this.position,
      cell: {
        x: ~~(this.position.x / collider_cell_size) + (num_collider_cells >> 1),
        y: ~~(this.position.y / collider_cell_size) + (num_collider_cells >> 1)
      },
    };
    this.collisionCorrection = {
      x: 0,
      y: 0,
    };

    // So that the skeleton can randomly roam if it's too far from the player
    this.randWalkTarget = Math.random() * Math.PI * 2;
    this.randWalk = 0;

    this.speed = skele_speed + Math.random() * 10;
  }

  // Build a spooky skeleton
  createSkeletonModel() {
    const bone_width = 0.2;
    const arm_height = 0.45;
    const leg_height = 0.6;
    const hip_width  = 0.3;
    const spine_height = 1.0;

    const headGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const armGeometry = new THREE.BoxGeometry(bone_width, arm_height, bone_width);
    const legGeometry = new THREE.BoxGeometry(bone_width, leg_height, bone_width);
    const hipGeometry = new THREE.BoxGeometry(hip_width + bone_width * 2, bone_width, bone_width);
    const spineGeometry = new THREE.BoxGeometry(bone_width, spine_height, bone_width);

    const boneMaterial = new THREE.MeshPhongMaterial( { color: 0xbbbbbb, side: THREE.FrontSide, shininess: 0, reflectivity: 0 } );

    /* HEAD */
    const head    = new THREE.Mesh(headGeometry, boneMaterial);
    head.position.y = 2.9;
    /* ### ### */

    /* SHOULDERS */
    const shoulders = new THREE.Mesh(hipGeometry, boneMaterial);
    shoulders.position.y = leg_height * 2 + spine_height;
    /* ### ### */

    /* ### RIGHT ARM ### */
    const r_arm_u = new THREE.Mesh(armGeometry, boneMaterial);
    const r_arm_l = createAnchorWrapper(
                      new THREE.Mesh(armGeometry, boneMaterial),
                      {x: 0, y: arm_height / 2, z: 0}
                    );
    r_arm_l.position.y = -arm_height / 2;
    r_arm_u.add(r_arm_l);
    r_arm_u.position.y = -arm_height / 2;
    this.r_arm_l = r_arm_l;

    const r_arm = new THREE.Group();
    r_arm.position.y = leg_height * 2 + spine_height + bone_width / 4;
    r_arm.add(r_arm_u);
    r_arm.position.x = hip_width;
    this.r_arm = r_arm;
    /* ### ### */

    /* ### LEFT ARM ### */
    const l_arm_u = new THREE.Mesh(armGeometry, boneMaterial);
    const l_arm_l = createAnchorWrapper(
                      new THREE.Mesh(armGeometry, boneMaterial),
                      {x: 0, y: arm_height / 2, z: 0}
                    );
    l_arm_l.position.y = -arm_height / 2;
    l_arm_u.add(l_arm_l);
    l_arm_u.position.y = -arm_height / 2;
    this.l_arm_l = l_arm_l;

    const l_arm = new THREE.Group();
    l_arm.position.y = leg_height * 2 + spine_height + bone_width / 4;
    l_arm.add(l_arm_u);
    l_arm.position.x = -hip_width;
    this.l_arm = l_arm;
    /* ### ### */

    /* SPINE / TORSO */
    const spine = new THREE.Mesh(spineGeometry, boneMaterial);
    spine.position.y = leg_height * 2 + bone_width * 2;
    /* ### ### */

    /* HIP */
    const hip = new THREE.Mesh(hipGeometry, boneMaterial);
    hip.position.y = leg_height * 2;
    /* ### ### */

    /* ### RIGHT LEG ### */
    const r_leg_u = new THREE.Mesh(legGeometry, boneMaterial);
    const r_leg_l = createAnchorWrapper(
                      new THREE.Mesh(legGeometry, boneMaterial),
                      {x: 0, y: leg_height / 2, z: 0}
                    );
    r_leg_l.position.y = -leg_height / 2;
    r_leg_u.add(r_leg_l);
    r_leg_u.position.y = -leg_height / 2;
    this.r_leg_l = r_leg_l;

    const r_leg = new THREE.Group();
    r_leg.position.y = leg_height * 2;
    r_leg.add(r_leg_u);
    r_leg.position.x = hip_width;
    this.r_leg = r_leg;
    /* ### ### */

    /* ### LEFT LEG ### */
    const l_leg_u = new THREE.Mesh(legGeometry, boneMaterial);
    const l_leg_l = createAnchorWrapper(
                      new THREE.Mesh(legGeometry, boneMaterial),
                      {x: 0, y: leg_height / 2, z: 0}
                    );
    l_leg_l.position.y = -leg_height / 2;
    l_leg_u.add(l_leg_l);
    l_leg_u.position.y = -leg_height / 2;
    this.l_leg_l = l_leg_l;

    const l_leg = new THREE.Group();
    l_leg.position.y = leg_height * 2;
    l_leg.add(l_leg_u);
    l_leg.position.x = -hip_width;
    this.l_leg = l_leg;
    /* ### ### */

    // Put them all together...
    const group = new THREE.Group();
    group.add(head);
    group.add(shoulders);
    group.add(r_arm); group.add(l_arm);
    group.add(spine);
    group.add(hip);
    group.add(r_leg); group.add(l_leg);

    return group;
  }

  // Update the tracking on the player
  update(player) {
    const dy = this.position.y - player.y;
    const dx = this.position.x - player.x;
    if(dx * dx + dy * dy > 400) {
      this.movement.angle = undefined;
      return;
    }
    this.movement.angle = Math.atan2(dy, dx) - Math.PI / 2;
  }

  // Animate the spooky skeleton
  animate(dtime, etime, player) {
    this.update(player);

    if(this.model.position.y < 0) {
      this.model.position.y += 10 * dtime;
      return;
    } else {
      this.model.position.y = 0;
    }

    // Update the random walk
    if(this.movement.angle === undefined) {
      if(this.randWalkTarget > this.randWalk) {
        this.randWalk += 16 * dtime;
        if(this.randWalkTarget <= this.randWalk)
          this.randWalkTarget = Math.random() * Math.PI * 2;
      } else {
        this.randWalk -= 16 * dtime;
        if(this.randWalkTarget >= this.randWalk)
          this.randWalkTarget = Math.random() * Math.PI * 2;
      }
    }

    const angle = this.movement.angle !== undefined ? this.movement.angle : this.randWalk;

    const vx =  (Math.sin(angle) + this.collisionCorrection.x) * this.speed * dtime;
    const vy = -(Math.cos(angle) - this.collisionCorrection.y) * this.speed * dtime;
    if(this.position.x + vx - 1 > -room_size2
    && this.position.x + vx + 1 < room_size2)
      this.position.x += vx;
    else if(this.movement.angle === undefined) // Redirect to center
      this.randWalkTarget = Math.atan2(this.position.y, this.position.x) - Math.PI / 2;

    if(this.position.y + vy - 1 > -room_size2
    && this.position.y + vy + 1 < room_size2)
      this.position.y += vy;
    else if(this.movement.angle === undefined) // Redirect to center
      this.randWalkTarget = Math.atan2(this.position.y, this.position.x) - Math.PI / 2;

    this.model.position.x = this.position.x;
    this.model.position.z = this.position.y;

    this.model.rotation.y =  Math.PI - angle;

    const anim_speed = this.speed * 0.15;

    let sin1 = 0, sin2 = 0;
    if(anim_speed > 0) {
      sin1 = Math.sin(etime * anim_speed + this.rand);
      sin2 = Math.sin(etime * anim_speed + Math.PI + this.rand);
    }

    // Precalculate animation variables since they're used multiple times.
    const a1 = sin1 * PI4; const a2 = sin2 * PI4;
    const _a1 = (a1 + PI4) * 0.9; const _a2 = (a2 + PI4) * 0.9;

    this.model.rotation.z = sin1 * Math.PI / 64;

    this.r_leg.rotation.x = a1;
    this.r_leg_l.rotation.x = _a1;

    this.l_leg.rotation.x = a2;
    this.l_leg_l.rotation.x = _a2;

    this.r_arm.rotation.x = -a1;
    this.r_arm_l.rotation.x = -_a1;

    this.l_arm.rotation.x = -a2;
    this.l_arm_l.rotation.x = -_a2;

    this.collisionCorrection = {x: 0, y: 0};

    const collider_position = {
      x: ~~(this.position.x / collider_cell_size) + num_collider_cells >> 1,
      y: ~~(this.position.y / collider_cell_size) + num_collider_cells >> 1
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

  // Handle collision detection between this spooky's collider and other colliders
  collide(otherCollider) {
    if(this.model.position.y < 0) return false;

    const dx = this.collider.position.x - otherCollider.position.x;

    let collision;
    switch(otherCollider.type) {
      case "sphere":
      const dz = this.collider.position.y - otherCollider.position.z;
      const d_xz = dx * dx + dz * dz;
      collision = d_xz <= this.collider.radius2 * 0.7 + otherCollider.radius2
                   && otherCollider.position.y <= this.collider.height + otherCollider.radius;
      return collision;

      case "cylinder":
      const dy = this.collider.position.y - otherCollider.position.y;
      const d_xy = dx * dx + dy * dy;

      collision = d_xy < this.collider.radius2 + otherCollider.radius2;

      if(collision) {
        const max_d_2d = this.collider.radius2 + otherCollider.radius2;
        const cc_mag = max_d_2d - d_xy;
        const ccx = dx/d_xy * cc_mag + this.collisionCorrection.x;
        const ccy = dy/d_xy * cc_mag + this.collisionCorrection.y;
        this.collisionCorrection = {x: ccx, y: ccy};
      }

      return collision;

      default:
      return false;
    }
  }
}
