'use strict';
let scene, camera, renderer, clock, stats, controls;
let spookies, lasers, lights, player, particle_effects, KEY;
let collider_cells;
let spookies_to_spawn = 32;
const max_spookies = 10;
let healthOverlay, winOverlay;
let loading;
let doorMaterial;

const door_textures = [
  new THREE.TextureLoader().load("imgs/door_closed.png"),
  new THREE.TextureLoader().load("imgs/door_open_2.png"),
];
for(var i = 0; i < door_textures.length; i++) {
  door_textures[i].minFilter = THREE.NearestFilter;
  door_textures[i].magFilter = THREE.NearestFilter;
}

window.onload = () => {
  init();
}

function init() {
  healthOverlay = document.getElementById("health");
  winOverlay = document.getElementById("win");


	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild(renderer.domElement);

  const room = new Room();
  scene.add(room.getModel());

  spookies = [];

  for(let i = 0; i < max_spookies; i++)
    spawnSpooky();

  lasers = [];
  particle_effects = [];

  lights = [
    new Torch({x:24, y:6, z:-24}),
    new Torch({x:-24, y:6, z:-24}),
    new Torch({x:24, y:6, z:24}),
    new Torch({x:-24, y:6, z:24}),
    new Torch({x:0, y:6, z:-room_size / 2 + 4}),
  ];

  for(let i = 0; i < lights.length; i++)
    scene.add(lights[i].getModel());

  clock = new THREE.Clock();

  controls = new THREE.PointerLockControls(camera);
  scene.add(controls.getObject());

  player = new Player({ x: 0, y: 3, z: 0 }, controls.getObject());

  doorMaterial = new THREE.MeshStandardMaterial( { side: THREE.FrontSide, metalness: 0, roughness: 1, map: door_textures[0] } );
  doorMaterial.transparent = true;
  const doorGeometry = new THREE.PlaneGeometry(room_height, room_height);
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, room_height / 2, -room_size / 2 + 0.05);
  scene.add(door);

  collider_cells = [];
  for(let _ = 0; _ < num_collider_cells * num_collider_cells; _++)
      collider_cells.push({});

  KEY = null;

  requestPointerLock(renderer.domElement, controls);
  setTimeout(() => {
    renderer.domElement.className = "opaque";
    loading = true;
    animate();
    setTimeout(() => {
      loading = false;
    }, 1000);
  }, 500);
}


function animate() {
  if(player.dead || player.winner) return;
  const deltaTime = clock.getDelta() / 8.;

  checkCollisions(deltaTime);

  player.animate(deltaTime);

  if(loading) {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    return;
  }

  for(let spooky in spookies)
    spookies[spooky].animate(deltaTime, clock.elapsedTime, player.getPosition());

  for(let light in lights) lights[light].animate(deltaTime, clock.elapsedTime);

  for(let i = 0; i < lasers.length; i++) {
    lasers[i].animate(deltaTime);
    if(lasers[i].isDead) {
      particle_effects.push(
        new ParticleEffect(lasers[i].getModel().position, lasers[i].getColor(), 0.1, 50)
      );
      scene.remove(lasers[i].getModel());
      removeCollider(lasers[i].getCollider().cell, lasers[i].getCollider().id);
      lasers.splice(i--, 1);
    }
  }

  for(let i = 0; i < particle_effects.length; i++) {
    particle_effects[i].animate(deltaTime);
    if(particle_effects[i].isDead()) particle_effects.splice(i--, 1);
  }

  if(KEY) KEY.animate(deltaTime, clock.elapsedTime);

	renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function spawnLaser(laser) {
  lasers.push(laser);
  scene.add(laser.getModel());
}

function updateColliderPosition(start, end, id, collider) {
  removeCollider(start, id, true);
  collider_cells[end.x + end.y * num_collider_cells][id] = collider;
}

function removeCollider(pos, id, update) {
  if(collider_cells[pos.x + pos.y * num_collider_cells][id])
    delete collider_cells[pos.x + pos.y * num_collider_cells][id];
}

function checkCollisions(dTime) {
  let playerSpooked = false;
  for(let i = 0; i < spookies.length; i++) {
    if(spookies[i].collide(player.getCollider())) playerSpooked = true;

    const thisCollider = spookies[i].getCollider();
    const collider_cell = thisCollider.cell;
    const other_colliders = [];
    for(let j = -1; j <= 1; j++) {
      for(let k = -1; k <= 1; k++) {
        const colliders = collider_cells[(collider_cell.x + j) + (collider_cell.y + k) * num_collider_cells];
        for(let key in colliders) other_colliders.push(colliders[key]);
      }
    }

    // Check neighboring colliders from current spooky
    for(let j = 0; j < other_colliders.length; j++) {
      if(other_colliders[j].id == thisCollider.id) continue;
      if(other_colliders[j].collided) continue;
      if(spookies[i].collide(other_colliders[j])
      && other_colliders[j].source == "laser") {
        other_colliders[j].collided = true;
        particle_effects.push(
          new ParticleEffect(other_colliders[j].position, 0xaaaa92, 0.5, 60, 2));

        scene.remove(spookies[i].getModel());
        removeCollider(thisCollider.cell, thisCollider.id);
        spookies.splice(i--, 1);

        player.heal();

        if(spookies_to_spawn == 0) {
            if(spookies.length == 0) spawnKey(thisCollider.position);
        } else {
          spawnSpooky();
        }

        break;
      }
    }
  }
  
  if(playerSpooked) player.hurt(dTime);

  // Player Equip Key
  if(KEY && KEY.collide(player.getCollider())) {
    scene.remove(KEY.getModel());
    KEY = null;
    player.equipKey();
  }
}

function spawnKey(position) {
  KEY = new Key({x: position.x, y: 2.5, z: position.y});
  scene.add(KEY.getModel());
}

function spawnSpooky() {
  const spooky = new Skeleton({x: (Math.random() - 0.5) * 0.9 * room_size, y: 0, z: (Math.random() - 0.5) * 0.9 * room_size});
  scene.add(spooky.getModel());
  spookies.push(spooky);
  spookies_to_spawn--;
}

window.onresize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
