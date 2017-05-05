/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	this.dispose = function() {

		document.removeEventListener( 'mousemove', onMouseMove, false );

	};

	document.addEventListener( 'mousemove', onMouseMove, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();

};

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
function requestPointerLock(canvas, controls) {
	var havePointerLock = 'pointerLockElement' in document
										 || 'mozPointerLockElement' in document
										 || 'webkitPointerLockElement' in document;
	if (havePointerLock) {
		var element = document.body;

		var pointerlockchange = function ( event ) {
			if (document.pointerLockElement === element
				|| document.mozPointerLockElement === element
				|| document.webkitPointerLockElement === element) {
				controls.enabled = true;
			} else {
				controls.enabled = false;
			}
		};

		var pointerlockerror = function(event) { console.log("POINTER LOCK ERROR"); };

		// Hook pointer lock state change events
		document.addEventListener('pointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

		document.addEventListener('pointerlockerror', pointerlockerror, false);
		document.addEventListener('mozpointerlockerror', pointerlockerror, false);
		document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

		canvas.addEventListener('click', (event) => {
			if(player.dead) return;
			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock
															  || element.mozRequestPointerLock
																|| element.webkitRequestPointerLock;
			element.requestPointerLock();
		}, false);
	} else {
		console.log('Your browser doesn\'t seem to support Pointer Lock API');
	}
}
