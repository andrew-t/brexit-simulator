document.addEventListener('DOMContentLoaded', e => {

	// set up the required dom elements
	const starContainer = document.getElementById('stars'),
		uk = document.getElementById('uk'),
		eire = document.getElementById('eire'),
		intro = document.getElementById('intro'),
		stars = [];
	for (let i = 0; i < 12; ++i) {
		const star = document.createElement('div');
		stars.push(star);
		starContainer.appendChild(star);
	}

	// extract what we know about the regions
	const regions = [ ...document.getElementsByTagName('path') ].map(path => {
		const coords = [];
		let command = null, lastCommand = null;
		for (const c of path.getAttribute('d').split(' '))
			if (c == 'z') {
				// do nothing
			} else if (/^[a-z]$/i.test(c)) {
				// if (command) throw new Error('double command: ' + command + ', ' + c);
				command = c;
			} else if (c) {
				if (!/^-?\d+(\.\d+)?(e-?\d+)?(,-?\d+(\.\d+)?(e-?\d+)?)?$/.test(c))
					throw new Error('expected numbers, got ' + c);
				const [ x, y ] = c.split(',').map(parseFloat),
					xy = y == undefined ? null : new Vector(x, y),
					last = coords[coords.length - 1]
						|| new Vector(0, 0);
				// if (isNaN(x + y)) throw new Error('Unparsable coordinates: ' + c)
				switch (command) {
					case 'm':
						if (lastCommand == 'm') coords.pop();
					case 'l': case 'c': case null:
						coords.push(last.clone().add(xy)); break;
					case 'h':
						if (y != undefined) throw new Error('y on h');
						coords.push(new Vector(last.x, last.y + x)); break;
					case 'v': 
						if (y != undefined) throw new Error('y on v');
						coords.push(new Vector(last.x + x, last.y)); break;
					default: throw new Error('unexpected command: ' + command);
				}
				// command = null;	
			}
		return {
			coords: coords.map(coord =>
				coord.clone()
					.subtract(new Vector(500, 920))
					//.add(new Vector(248, 5.249756))
					.multiply(2 / 3000)),
			name: path.getAttribute('data-name') 
				|| (path.children[0] ? path.children[0].innerHTML : null),
			path
		};
	});

	// generate some spare uks because let's face it, we're going to need them
	function cloneDom(dom) {
		const testTube = document.createElement('div');
		testTube.innerHTML = dom.outerHTML;
		return testTube.children[0];
	}
	const ukClone = cloneDom(uk);
	for (const region of [ ...ukClone.querySelectorAll('path') ])
		region.parentElement.removeChild(region);
	function spareUk(region) {
		const spareUk = cloneDom(ukClone);
		spareUk.classList.add('map');
		spareUk.style.transform = uk.style.transform;
		spareUk.style.width = uk.style.width;
		spareUk.style.height = uk.style.height;
		spareUk.style.left = uk.style.left;
		spareUk.style.top = uk.style.top;
		spareUk.querySelector('#layer1').appendChild(region);
		return spareUk;
	}

	// sizing and positioning
	let w, h, x0, y0, r;
	function size() {
		w = window.innerWidth;
		h = window.innerHeight;
		x0 = w / 2;
		y0 = h / 2;
		// the real flag is 27x18 and the circle has radius 6, so:
		r = Math.min(w, h) / 3;
		// the stars have radius 1, so:
		const theta = Math.PI / 6;
		starContainer.style.width = `${ 7 * r / 3 }px`;
		starContainer.style.height = `${ 7 * r / 3 }px`;
		starContainer.style.top = `${ y0 - 7 * r / 6 }px`;
		starContainer.style.left = `${ x0 - 7 * r / 6 }px`;
		for (let i = 0; i < 12; ++i) {
			const star = stars[i];
			star.style.width = `${ r / 3 }px`;
			star.style.height = `${ r / 3 }px`;
			star.style.top = `${ r + r * Math.cos(i * theta) }px`;
			star.style.left = `${ r + r * Math.sin(i * theta) }px`;
		}
		const mapHeight = 4 * r / 3,
			mapWidth = mapHeight / 1.84;
		for (const map of [ ...document.getElementsByClassName('map') ]) {
			map.style.height = `${mapHeight}px`;
			map.style.width = `${mapWidth}px`;
			map.style.left = `${x0 - mapWidth / 2}px`;
			map.style.top = `${y0 - mapHeight / 2}px`;
		}
	}
	window.addEventListener('resize', size);
	size();

	let t = 0, lastFrame = Date.now(),
		starAngle = 0, flagAngle = 0,
		starSpeed = 0, flagSpeed = 0,
		dragging = null,
		ukPosition = new Vector(0, 0),
		ukAngle = 0,
		paused = false;
	function frame() {
		if (paused) { requestAnimationFrame(frame); return; }

		const now = Date.now(),
			delay = Math.min(now - lastFrame, 100),
			lastT = t;
		t += delay;
		lastFrame = now;

		// countdown
		for (let i = 0; i <= 3; ++i) {
			const end = 7000 - i * 1000,
				start = end - 1000;
			if (t > end && lastT <= end)
				document.getElementById('countdown-' + i).classList.add('gone');
			if (t > end && lastT <= end) {
				const el = document.getElementById('countdown-' + i);
				el.classList.remove('gone');
				setTimeout(() => el.classList.add('hidden'))
			}
		}

		// spin up the buzzsaw
		if (t > 1000) {
			if (starSpeed < 8) starSpeed += 0.00001 * t;
			starAngle += starSpeed;
			for (const star of stars) star.style.transform = `rotate(${ starAngle }deg)`;
			if (t > 5000 && flagSpeed < 8) flagSpeed += 0.000005 * t;
			flagAngle += flagSpeed;
			starContainer.style.transform = `rotate(${ flagAngle }deg)`;
		}

		requestAnimationFrame(frame);
	}

	function normalisedClientCoords(e) {
		return new Vector(e.clientX - x0, e.clientY - y0).divide(r);
	}
	const comOffset = new Vector(1 / 9, 1.84 / 9);
	function currentCentreOfMassCoords() {
		return comOffset
			.clone()
			.rotate(ukAngle)
			.add(ukPosition);
	}

	uk.addEventListener('mousedown', e => startDrag(e, e));
	window.addEventListener('mousemove', e => moveDrag(e, e));
	window.addEventListener('mouseup', e => endDrag(e));
	uk.addEventListener('touchstart', e => {
		if (e.touches.length == 1)
			startDrag(e, e.touches[0]);
		dragging.touchId = e.touches[0].identifier;
	});
	window.addEventListener('touchmove', e => {
		if (!dragging) return;
		const pointer = [ ...e.touches ]
			.find(t => t.identifier == dragging.touchId);
		if (pointer) moveDrag(e, pointer);
	});
	window.addEventListener('touchend', e => {
		if (dragging && ![ ...e.touches ].some(t => t.identifier == dragging.touchId))
			endDrag(e);
	});

	function startDrag(e, pointer) {
		e.preventDefault();
		if (t < 7000) return;
		const xy = normalisedClientCoords(pointer);
		dragging = {
			last: xy,
			comDistance: xy.clone()
				.subtract(currentCentreOfMassCoords())
				.length()
		};
		console.log(currentCentreOfMassCoords(), dragging);
	}

	function moveDrag(e, pointer) {
		if (dragging) {
			const xy = normalisedClientCoords(pointer),
				com = currentCentreOfMassCoords();
			// adjust the angle by assuming the centre of mass doesn't move
			ukAngle += xy.clone().subtract(com).angle()
				- dragging.last.clone().subtract(com).angle();
			// move the centre of mass
			com.subtract(xy).normalise().multiply(dragging.comDistance).add(xy);
			// move the uk based on that
			ukPosition = com.clone().subtract(
				comOffset.clone().rotate(ukAngle));
			// store for next time
			dragging.last = xy;
			uk.style.transform = `
				translate(${ukPosition.x * r}px, ${ukPosition.y * r}px)
				rotate(${ukAngle}rad)`;
			for (const region of regions) if (!region.gone) {
				let xy;
				for (const coord of region.coords) {
					xy = coord.clone().rotate(ukAngle).add(ukPosition);
					if (xy.lengthSquared() > 0.9) {
						region.gone = true;
						break;
					}
				}
				if (region.gone) {
					console.log('Bye bye,', region.name, region.path.id);
					region.path.parentElement.removeChild(region.path);
					const shard = spareUk(region.path);
					document.body.appendChild(shard);
					const direction = xy.angle() + Math.PI / 2 + Math.random() * 0.5 - 0.25;
					shard.style.transition = 'transform 1500ms';
					setTimeout(() => shard.style.transform = `
						translate(
							${Math.cos(direction) * (window.innerWidth + window.innerHeight)}px,
							${Math.sin(direction) * (window.innerWidth + window.innerHeight)}px)
						rotate(400deg)`);
					if (region.name == 'Cornwall'
					&& regions.every(r => (r.name == 'Cornwall') == !!r.gone)) {
						const o = document.getElementById('cornwall');
						o.classList.remove('hidden');
						paused = true; dragging = null;
						window.addEventListener('click', clear);
						function clear(e) {
							e.preventDefault();
							paused = false;
							o.classList.add('hidden');
							dragging = null;
							window.removeEventListener('mousedown', clear);
						}
					}
				}
			}
			if (regions.every(r => r.gone))
				document.getElementById('game-over').classList.remove('hidden');
			e.preventDefault();
		}
	}

	function endDrag(e) {
		if (dragging) {
			e.preventDefault();
			dragging = null;
		}
	}

	intro.addEventListener('click', e => {
		intro.classList.add('hidden');
		setTimeout(() => intro.classList.add('gone'), 300);
		requestAnimationFrame(frame);
	});

});
