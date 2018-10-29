document.addEventListener('DOMContentLoaded', e => {

	// set up the required dom elements
	const starContainer = document.getElementById('stars'),
		stars = [];
	for (let i = 0; i < 12; ++i) {
		const star = document.createElement('div');
		stars.push(star);
		starContainer.appendChild(star);
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
	}
	window.addEventListener('resize', size);
	size();

	let t = 0, lastFrame = Date.now(),
		starAngle = 0, flagAngle = 0,
		starSpeed = 0, flagSpeed = 0;
	function frame() {
		const now = Date.now(),
			delay = Math.min(now - lastFrame, 100);
		t += delay;
		lastFrame = now;

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
	requestAnimationFrame(frame);
});
