'use strict';

function createParticle(color, size) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshBasicMaterial({color});
  return new THREE.Mesh(geometry, material);
}

const particle_speed = 100;
const gravity = -20;
class ParticleEffect {
  // whoosh is a multiplier on the particle velocities
  constructor(position, color, size, amount, whoosh=1) {
    this.particles = [];
    for(let i = 0; i < amount; i++) {
      const particle = createParticle(color, size);
      particle.position.set(position.x, position.y, position.z);
      this.particles.push({
        model: particle,
        velocity: {
            x: (Math.random() - 0.5) * whoosh,
            y: (Math.random() - 0.2) * whoosh,
            z: (Math.random() - 0.5) * whoosh,
        },
        size: size,
      });
      scene.add(particle);
    }
  }

  animate(dtime) {
    const dp = dtime * particle_speed;
    const dg = gravity * dtime;

    for(let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const model = particle.model; const vel = particle.velocity;
      const psize2 = particle.size / 2;

      model.position.x += vel.x * dp;
      model.position.y += vel.y * dp;
      model.position.z += vel.z * dp;

      vel.y += dg;
      if(model.position.y < psize2) {
        model.position.y = psize2;
        vel.y *= -0.5;
        const newScale = model.scale.x * 0.6;
        model.scale.set(newScale, newScale, newScale);
        if(vel.y <= 0.01 || newScale <= 0.01) {
          scene.remove(model);
          this.particles.splice(i--, 1);
        }
      } else if(model.position.y >= 8 - psize2) {
        model.position.y = 8 - psize2;
        vel.y *= -0.8; // Multiply by -0.8 to simulate lost kinetic energy on bounce
      }

      if(model.position.x - psize2 <= -room_size2) {
        model.position.x = -room_size2 + psize2;
        vel.x *= -0.8;
      } else if(model.position.x + psize2 >= room_size2) {
        model.position.x = room_size2 - psize2;
        vel.x *= -0.8;
      }

      if(model.position.z - psize2 <= -room_size2) {
        model.position.z = -room_size2 + psize2;
        vel.z *= -0.8;
      } else if(model.position.z + psize2 >= room_size2) {
        model.position.z = room_size2 - psize2;
        vel.z *= -0.8;
      }
    }
  }

  isDead() { return this.particles.length === 0 }
}
