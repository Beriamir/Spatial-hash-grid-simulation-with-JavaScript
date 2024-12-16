# Spatial Hash Grid Simulation

A simple implementation of a spatial hash grid to handle collision detection efficiently for thousands of circular bodies on an HTML canvas.

## Features

- **Spatial Hash Grid:** Divides the canvas into cells for optimized collision detection.
- **Efficient Physics:** Handles collisions and boundary constraints for thousands of objects.
- **Interactive Pointer:** Highlights nearby circles based on pointer position.
- **Debug Tools:** Optional grid visualization and active cell highlighting.

## Usage

1. Clone or copy the project files.
2. Include the following scripts in your project:
   - `SpatialGrid.js` - Implements the spatial hash grid.
   - `Vector.js` - Provides vector math utilities.
   - `Circle.js` - Defines circle bodies with properties like position, radius, etc.
3. Open `index.html` in a browser to run the simulation.

## Customization

- Adjust `numCircles` in the `main()` function to set the number of circles.
- Change `cellSize` for grid resolution.
- Modify `subSteps` to balance simulation accuracy and performance.

## Debug Options

- Uncomment `drawGrid()` and `highlightActiveCells()` in the `update()` function to visualize the grid and active cells.

## License

This project is open-source under the MIT License.
