import { Vector } from './Vector.js';

export class Circle {
  constructor(x, y, radius) {
    this.position = new Vector(x, y);
    this.radius = radius;
    this.velocity = new Vector().random().scale(0.02);
    
    this.density = 2700; 
    this.thickness = 0.01;
    this.area = this.radius * this.radius * Math.PI;
    this.mass = this.density * this.thickness * this.area;
    this.inverseMass = 1 / this.mass;
    
    this.restitution = 1;
    this.color = '#656565';
  }
}