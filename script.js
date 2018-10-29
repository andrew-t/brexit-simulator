document.addEventListener('DOMContentLoaded', e => {
	let w, h;
	function size() {
		w = window.innerWidth;
		h = window.innerHeight;
	}
	window.addEventListener('resize', size);
	size();

	const starContainer = document.getElementById('stars'),
		stars = [];
	for (let i = 0; i < 12; ++i) {
		const star = document.createElement('div');
		stars.push(star);
		starContainer.appendChild(star);
	}

	function frame() {

		return;

		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
});
