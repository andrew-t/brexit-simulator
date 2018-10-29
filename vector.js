class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.validate();
	}
	add(v) {
		this.x += v.x;
		this.y += v.y;
		this.validate();
		return this;
	}
	subtract(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.validate();
		return this;
	}
	multiply(n) {
		this.x *= n;
		this.y *= n;
		this.validate();
		return this;
	}
	divide(n) {
		this.x /= n;
		this.y /= n;
		this.validate();
		return this;
	}
	rotate(t) {
		const s = Math.sin(t), c = Math.cos(t);
		[ this.y, this.x ] = [
			c * this.y + s * this.x,
			c * this.x - s * this.y
		];
		this.validate();
		return this;
	}
	clone(n) { return new Vector(this.x, this.y); }
	length() { return Math.sqrt(this.lengthSquared()); }
	lengthSquared() { return this.x * this.x + this.y * this.y; }
	angle() { return Math.atan2(this.y, this.x); }
	normalise() { return this.divide(this.length()); }
	validate() {
		if (isNaN(this.x + this.y))
			throw new Error('NaN in Vector');
		return this;
	}
}
