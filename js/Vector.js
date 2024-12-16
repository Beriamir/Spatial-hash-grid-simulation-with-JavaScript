export class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  random() {
    this.x = Math.random() - 0.5;
    this.y = Math.random() - 0.5;
    return this;
  }
  
  add(vector, scalar = 1) {
    this.x += vector.x * scalar;
    this.y += vector.y * scalar;
    return this;
  }
  
  scale(scalar = 1) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  
  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }
  
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  static scale(vector, scalar = 1) {
    return new Vector(vector.x * scalar, vector.y * scalar);
  }
  
  static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }
}
