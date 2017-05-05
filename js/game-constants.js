'use strict';
const room_size = 50;
const room_size2 = room_size >> 1;
const room_height = 8;
const collider_cell_size = 0.5;
const num_collider_cells = ~~Math.ceil(room_size / collider_cell_size);
const sqrt2 = Math.sqrt(2);
const PI4 = Math.PI / 4.;
