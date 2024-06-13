// @ts-check

/**
 * @module Geometry
 * @fileoverview This file contains the classes that represent geometric shapes and calculations for the projects.
 * @author aracsidev
 * @version 1.0.0
 */

import { Matrix2x2, Matrix4x4, Vertex, drawMethod } from "./types.ts";
import { Renderer } from "./visuals.ts";

/**
 * Represents a two dimensional vector.
 * @class
 * @implements {Vertex}
 * @property {number} x - public
 * @property {number} y - public
 */
export class Vec2d implements Vertex {
    public x: number;
    public y: number;

    /**
     * Creates the vector.
     * @constructor
     * @param {number} x
     * @param {number} y
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Represents a three dimensional vector.
 * @class
 * @implements {Vertex}
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */
export class Vec3d implements Vertex {
    /** @public */
    public x: number;
    /** @public */
    public y: number;
    /** @public */
    public z: number;

    /**
     * Creates the vector.
     * @constructor
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Rotates the vector by a given rotation vector.
     * @method
     * @public
     * @param {Vec3d} vector The rotation vector.
     * @returns {void}
     */
    public rotate(vector: Vec3d): void {

        // Defining the matricies
        const rotationMatricies: {x: Matrix2x2, y: Matrix2x2, z: Matrix2x2} = {
            x: [
                [Math.cos(vector.x * Math.PI / 180), -Math.sin(vector.x * Math.PI / 180)],
                [Math.sin(vector.x * Math.PI / 180),  Math.cos(vector.x * Math.PI / 180)]
            ],
            y: [
                [Math.cos(vector.y * Math.PI / 180), -Math.sin(vector.y * Math.PI / 180)],
                [Math.sin(vector.y * Math.PI / 180),  Math.cos(vector.y * Math.PI / 180)]
            ],
            z: [
                [Math.cos(vector.z * Math.PI / 180), -Math.sin(vector.z * Math.PI / 180)],
                [Math.sin(vector.z * Math.PI / 180),  Math.cos(vector.z * Math.PI / 180)]
            ]
        }

        // Temporary variables
        let tempVec_1       = new Vec3d(0, 0, 0);
        let tempVec_2       = new Vec3d(0, 0, 0);
        
        // Rotating the vector
        tempVec_1.x = this.x
        tempVec_1.y = rotationMatricies.x[0][0] * this.y + rotationMatricies.x[1][0] * this.z
        tempVec_1.z = rotationMatricies.x[0][1] * this.y + rotationMatricies.x[1][1] * this.z

        tempVec_2.x = rotationMatricies.y[0][0] * tempVec_1.x + rotationMatricies.y[1][0] * tempVec_1.z
        tempVec_2.y = tempVec_1.y
        tempVec_2.z = rotationMatricies.y[0][1] * tempVec_1.x + rotationMatricies.y[1][1] * tempVec_1.z

        this.x = rotationMatricies.z[0][0] * tempVec_2.x + rotationMatricies.z[1][0] * tempVec_2.y
        this.y = rotationMatricies.z[0][1] * tempVec_2.x + rotationMatricies.z[1][1] * tempVec_2.y
        this.z = tempVec_2.z
    }

    /**
     * Multiplies the vector by a given projection matrix.
     * @method
     * @public
     * @param {Matrix4x4} matrix The projection matrix.
     * @returns {void}
     */
    public multiplyByMatrix(matrix: Matrix4x4): void {
        this.x = this.x * matrix[0][0] + this.y * matrix[1][0] + this.z * matrix[2][0] + matrix[3][0]
        this.y = this.x * matrix[0][1] + this.y * matrix[1][1] + this.z * matrix[2][1] + matrix[3][1]
        this.z = this.x * matrix[0][2] + this.y * matrix[1][2] + this.z * matrix[2][2] + matrix[3][2]
    
        const w = this.x * matrix[0][3] + this.y * matrix[1][3] + this.z * matrix[2][3] + matrix[3][3]

        if (w !== 0) {
            this.x /= w
            this.y /= w
            this.z /= w
        }
    }

    /**
     * Calculates the DOT product of this vector and another vector. Used to check how similar two vectors are.
     * @param {Vec3d} vector
     * @returns {number} dot product
     */
    public dot(vector: Vec3d): number {
        return (vector.x * this.x) + (vector.y * this.y) + (vector.z * this.z);
    }

    /**
     * Normalizes this vector
     * @method
     * @public
     * @returns {void}
     */
    public normalize(): void {
        const length = Math.sqrt((this.x*this.x) + (this.y*this.y) + (this.z*this.z));
        this.x /= length;
        this.y /= length;
        this.z /= length;
    }

    /**
     * Updates this vector with x and y properties which
     * are the pixel coordinates to be used for drawing to the screen.
     * 
     * The z property is unused from here on.
     * 
     * @method
     * @public
     * @param {Renderer} renderer   The renderer used for projection.
     * @returns {void}
     */
    public project(renderer: Renderer): void {
        // Position
        this.x -= renderer.camera.position.x;
        this.y -= renderer.camera.position.y;
        this.z -= renderer.camera.position.z;
        
        // Rotation
        this.rotate(renderer.camera.rotation);
        
        // Projection to 2d
        this.multiplyByMatrix(renderer.projectionMatrix);
        
        // Scaling to screen size
        this.x += 1;
        this.y += 1;
        this.x *= .5 * renderer.width;
        this.y *= .5 * renderer.height;
    }
}

/**
 * Represents a triangle
 * @class
 * @property {Vec3d}  A
 * @property {Vec3d}  B
 * @property {Vec3d}  C
 * @property {Vec3d}  normal
 * @property {Vec3d}  center
 * @property {string} color
 */
export class Triangle {
    /** @public */
    public A:      Vec3d;
    /** @public */
    public B:      Vec3d;
    /** @public */
    public C:      Vec3d;
    /** @public */
    public normal:  Vec3d;
    /** @public */
    public center:  Vec3d;
    /** @public */
    public color: string;

    /**
     * Creates the triangle
     * @constructor
     * @param {Vec3d} A
     * @param {Vec3d} B
     * @param {Vec3d} C
     */
    constructor(A: Vec3d, B: Vec3d, C: Vec3d) {
        this.A = A;
        this.B = B;
        this.C = C;

        // Creating the normal and center.
        this.recalculateNormals();
        this.recalculateCenter();
    }

    /**
     * Calculates the normal vector of this triangle
     * @method
     * @public
     * @returns {void}
     */
    public recalculateNormals(): void {
        // Calculating normal vector
        this.normal = new Vec3d(
            (this.B.y - this.A.y) * (this.C.z - this.A.z) - (this.B.z - this.A.z) * (this.C.y - this.A.y),
            (this.B.z - this.A.z) * (this.C.x - this.A.x) - (this.B.x - this.A.x) * (this.C.z - this.A.z),
            (this.B.x - this.A.x) * (this.C.y - this.A.y) - (this.B.y - this.A.y) * (this.C.x - this.A.x)
        );

        // Normalizing it
        this.normal.normalize();
    }

    /**
     * Calculates the center of this triangle
     * @method
     * @public
     * @returns {void}
     */
    public recalculateCenter(): void {
        // Triangle center
        this.center = new Vec3d(
            (this.A.x + this.B.x + this.C.x) / 3,
            (this.A.y + this.B.y + this.C.y) / 3,
            (this.A.z + this.B.z + this.C.z) / 3
        );
    }

    /** 
     * Updates the position of the triangle by adding a position vector to it's vertices.
     * @method
     * @public
     * @param {Vertex} position The position that's added to each vertex of the triangle.
     */
    public setLocation(position: Vec3d): void {
        for (const Vertex of [this.A, this.B, this.C]) {
            Vertex.x += position.x;
            Vertex.y += position.y;
            Vertex.z += position.z;
        }

        this.recalculateCenter();
    }

    /**
     * Projects this triangle's vertices.
     * @method
     * @public
     * @param {Renderer} renderer The renderer used for the projection.
     * @returns {void}
     */
    public project(renderer: Renderer): void {
        for (const Vertex of [this.A, this.B, this.C]) {
            Vertex.project(renderer);
        }
    }

    /**
     * Mutates this triangle by rotating each of it's vertices by a rotation vector.
     * @method
     * @public
     * @param {Vec3d} vector The rotation vector
     * @returns {void}
     */
    public rotate(vector: Vec3d): void {
        for (const Vertex of [this.A, this.B, this.C]) {
            Vertex.rotate(vector);
        }
        this.recalculateNormals();
        this.recalculateCenter();
    }
}

/**
 * Used for configuring the mesh
 * @class
 * @property {Vec3d} [position]                                 - default: new Vec3d(0, 0, 0)
 * @property {Vec3d} [initialRotation]                          - default: new Vec3d(0, 0, 0)
 * @property {Boolean} [rotationEnabled]                        - default: false
 * @property {Boolean} [culling]                                - default: false
 * @property {string} [color]                                   - default: "#FFFFFF"
 * @property {drawMethod} [draw]                                - default: drawMethod.WIRE
 * @property {number} [rotationSpeed]                           - default: 0.5
 * @property {[string, string?, string?]} [rotationAxisList]    - default: ["y"]
 * @property {Vec3d} [lightSource]                              - default: new Vec3d(0, 0, -1)
 */
export class MeshConfig {
    /** @public */
    public position:              Vec3d;
    /** @public */
    public initialRotation:       Vec3d;
    /** @public */
    public rotationEnabled:       Boolean;
    /** @public */
    public culling:               Boolean;
    /** @public */
    public color:                 string;
    /** @public */
    public draw:                  drawMethod;
    /** @public */
    public rotationSpeed:         number;
    /** @public */
    public rotationAxisList:      [string, string?, string?];
    /** @public */
    public lightSource:           Vec3d;

    /**
     * Creates MeshConfig
     * @constructor
     * @param {{}} config The configuration object.
     * @property {Vec3d} [position]                                 - default: new Vec3d(0, 0, 0)
     * @property {Vec3d} [initialRotation]                          - default: new Vec3d(0, 0, 0)
     * @property {Boolean} [rotationEnabled]                        - default: false
     * @property {Boolean} [culling]                                - default: false
     * @property {string} [color]                                   - default: "#FFFFFF"
     * @property {drawMethod} [draw]                                - default: drawMethod.WIRE
     * @property {number} [rotationSpeed]                           - default: 0.5
     * @property {[string, string?, string?]} [rotationAxisList]    - default: ["y"]
     * @property {Vec3d} [lightSource]                              - default: new Vec3d(0, 0, -1)
     */
    constructor(config?: {position?: Vec3d, initialRotation?: Vec3d, rotationEnabled?: Boolean, culling?: Boolean, color?: string, draw?: drawMethod, rotationSpeed?: number, rotationAxisList?: [string, string?, string?], lightSource?: Vec3d}) {
        // Checking if a configuration object was provided.
        config = config ? config : {};
        // Populating the properties where needed.
        this.position            = config.position          ? config.position          : new Vec3d(0, 0, 0);
        this.initialRotation     = config.initialRotation   ? config.initialRotation   : new Vec3d(0, 0, 0);
        this.culling             = config.culling           ? config.culling           : false;
        this.color               = config.color             ? config.color             : "#FFFFFF";
        this.draw                = config.draw              ? config.draw              : drawMethod.WIRE;
        this.rotationEnabled     = config.rotationEnabled   ? config.rotationEnabled   : false;
        this.rotationSpeed       = config.rotationSpeed     ? config.rotationSpeed     : 0.5;
        this.rotationAxisList    = config.rotationAxisList  ? config.rotationAxisList  : ["y"];
        this.lightSource         = config.lightSource       ? config.lightSource       : new Vec3d(0, 0, -1);

        if (!/^#?([0-9A-Fa-f]{6})$/.test(this.color)) {
            console.error("Invalid color code provided, defaulting to white! Must be a full length hex color code! Example: #12C4e6");
            this.color = "#FFFFFF";
        }

        this.lightSource.normalize();
    }
}

/**
 * Represents a mesh.
 * @class
 * @property {number}       id
 * @property {MeshConfig}   [config]
 * @property {Triangle[]}   initialTriangles Immutable used to initalize processedTriangles
 * @property {Triangle[]}   processedTriangles Mutated for rendering, reinitialized on every re-render.
 * @property {Vec3d}        currentRotation Mutated for rendering, initally this.config.initialRotation.
 */
export class Mesh {
    /** @public */
    public id:                              number;
    /** @public */
    public config:                          MeshConfig;
    /** @private @readonly */
    private readonly initialTriangles:      Triangle[];
    /** @private */
    private processedTriangles:             Triangle[];
    /** @private */
    private currentRotation:                Vec3d;

    /**
     * Creates the mesh.
     * @constructor
     * @param {number}      id Recommend using Date.now() as a way of getting a unique identifier.
     * @param {Triangle[]}  triangles Array of triangles. Like the contents of a .obj file read by the useFile() hook.
     * @param {MeshConfig}  [config] Optional MeshConfig object.
     */
    constructor(id: number, triangles: Triangle[], config?: MeshConfig) {

        this.id                = id;
        this.initialTriangles  = triangles;

        // Check if a MeshConfig was provided.
        this.config = config ? config : new MeshConfig();

        // Initalizing the current rotation (Only done once).
        this.currentRotation = this.config.initialRotation;

        /*
            Populating the processedTriangles property with the inital ones.

            We could do this by mutating the inital triangles, but that would mean
            having to parse a file and/or read from a file on each re-render.
        */
       this.processedTriangles = [];
        for (const unprocessedTriangle of this.initialTriangles) {
            this.processedTriangles.push(new Triangle(
                new Vec3d(unprocessedTriangle.A.x, unprocessedTriangle.A.y, unprocessedTriangle.A.z),
                new Vec3d(unprocessedTriangle.B.x, unprocessedTriangle.B.y, unprocessedTriangle.B.z),
                new Vec3d(unprocessedTriangle.C.x, unprocessedTriangle.C.y, unprocessedTriangle.C.z)
            ));
        }
    }

    /**
     * Sorts it's own triangles based on their center's z property, then calls the project() method on all triangles if they are visible.
     * @method
     * @public
     * @param {Renderer} renderer
     */
    public project(renderer: Renderer): void {

        // Reordering the list of triangles in order of depth
        this.processedTriangles.sort((a: Triangle, b: Triangle): number => a.center.z < b.center.z ? 1 : -1);

        // Here the processedTriangles are the rotated triangles.
        for (const triangle of this.processedTriangles) {
            // Culling check
            const isVisible: Boolean = renderer.camera.getDifference(triangle) < 0;
            if (this.config.culling && !isVisible) {
                continue;
            }

            // Projection
            triangle.project(renderer);
        }
    }

    /**
     * Resets the processed triangle array to the unprocessed one.
     * @method
     * @public
     * @returns {void}
     */
    public reset(): void {
        this.processedTriangles = [];
        for (const unprocessedTriangle of this.initialTriangles) {
            this.processedTriangles.push(new Triangle(
                new Vec3d(unprocessedTriangle.A.x, unprocessedTriangle.A.y, unprocessedTriangle.A.z),
                new Vec3d(unprocessedTriangle.B.x, unprocessedTriangle.B.y, unprocessedTriangle.B.z),
                new Vec3d(unprocessedTriangle.C.x, unprocessedTriangle.C.y, unprocessedTriangle.C.z)
            ));
        }
    }

    /**
     * Rotates the mesh based on provided config.
     * @method
     * @public
     * @returns {void}
     */
    public rotate(): void {

        if (this.config.rotationEnabled) {
            for (const axis of this.config.rotationAxisList) {
                for (const possible of ["x", "y", "z", "-x", "-y", "-z"]) {
                    if (axis === possible && axis[0] === "-") {
                        this.currentRotation[axis[1]] -= this.config.rotationSpeed;
                        if (this.currentRotation[axis[1]] <= -360) {this.currentRotation[axis[1]] = 0}
                        continue;
                    } else if (axis === possible) {
                        this.currentRotation[axis] += this.config.rotationSpeed;
                        if (this.currentRotation[axis] >= 360) {this.currentRotation[axis] = 0}
                        continue;
                    }
                }
            }
        }

        // console.log(this.currentRotation);

        // Here the processedTriangles are the intial triangles.
        for (const triangle of this.processedTriangles) {
            triangle.rotate(this.currentRotation);
            triangle.setLocation(this.config.position);
        }
    }

    /**
     * Draws the mesh to the screen.
     * @method
     * @public
     * @param {Renderer} renderer
     */
    public draw(context: CanvasRenderingContext2D): void {

        // Here the processedTriangles are the rotated then projected triangles.
        for (const triangle of this.processedTriangles) {

            // Selecting the appropriate draw method
            switch (this.config.draw) {
                case drawMethod.VERTEX:
                    this.drawVertex(context, triangle, this.config.color);
                    break;
                case drawMethod.CROSSES:
                    this.drawCrosses(context, triangle, this.config.color);
                    break;
                case drawMethod.WIRE:
                    this.drawWire(context, triangle, this.config.color);
                    break;
                case drawMethod.SHADED:
                    this.drawShaded(context, triangle);
                    break;
            }

        }
    }

    /**
     * Draws the wireframe of a triangle on the screen
     * @method
     * @private
     * @param {CanvasRenderingContext2D}    context
     * @param {Triangle}                    triangle
     * @param {string}                      color
     */
    private drawWire(context: CanvasRenderingContext2D, triangle: Triangle, color: string): void {
        const lineWidth = 1;
        context.beginPath();
        context.moveTo(triangle.A.x, triangle.A.y);
        context.lineTo(triangle.B.x, triangle.B.y);
        context.lineTo(triangle.C.x, triangle.C.y);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.closePath();
        context.stroke();
    }

    /**
     * Draws the vertices of a triangle on the screen as pixels.
     * @method
     * @private
     * @param {CanvasRenderingContext2D}    context
     * @param {Triangle}                    triangle
     * @param {string}                      color
     */
    private drawVertex(context: CanvasRenderingContext2D, triangle: Triangle, color: string): void {
        context.fillStyle = color;
        context.fillRect(triangle.A.x, triangle.A.y, 1, 1);
        context.fillRect(triangle.B.x, triangle.B.y, 1, 1);
        context.fillRect(triangle.C.x, triangle.C.y, 1, 1);
    }

    /**
     * Draws the vertices of a triangle on the screen as crosses.
     * @method
     * @private
     * @param {CanvasRenderingContext2D}    context
     * @param {Triangle}                    triangle
     * @param {string}                      color
     */
    private drawCrosses(context: CanvasRenderingContext2D, triangle: Triangle, color: string): void {
        context.fillStyle = color;
        context.fillRect(triangle.A.x, triangle.A.y - 5, 1, 11);
        context.fillRect(triangle.B.x, triangle.B.y - 5, 1, 11);
        context.fillRect(triangle.C.x, triangle.C.y - 5, 1, 11);

        context.fillRect(triangle.A.x - 5, triangle.A.y, 11, 1);
        context.fillRect(triangle.B.x - 5, triangle.B.y, 11, 1);
        context.fillRect(triangle.C.x - 5, triangle.C.y, 11, 1);
    }

    /**
     * Draws a shaded triangle on the screen.
     * @method
     * @private
     * @param {CanvasRenderingContext2D}    context
     * @param {Triangle}                    triangle
     * @param {string}                      color
     */
    private drawShaded(context: CanvasRenderingContext2D, triangle: Triangle): void {

        // Initial color values (Maximums)
        let R: number = parseInt(`0x${this.config.color.slice(1, 3)}`);
        let G: number = parseInt(`0x${this.config.color.slice(3, 5)}`);
        let B: number = parseInt(`0x${this.config.color.slice(5, 7)}`);

        const lightIntensity: number = ((this.config.lightSource.dot(triangle.normal)+1)/2);

        // R, G, B [0-255] * lightIntensity [0-1]
        R = Math.floor(R * lightIntensity);
        G = Math.floor(G * lightIntensity);
        B = Math.floor(B * lightIntensity);

        // R, G, B [00-FF]
        const red   = R.toString(16).length < 2 ? `0${R.toString(16)}` : `${R.toString(16)}` ;
        const green = G.toString(16).length < 2 ? `0${G.toString(16)}` : `${G.toString(16)}` ;
        const blue  = B.toString(16).length < 2 ? `0${B.toString(16)}` : `${B.toString(16)}` ;

        triangle.color = `#${red}${green}${blue}`;

        context.beginPath();
        context.moveTo(triangle.A.x, triangle.A.y);
        context.lineTo(triangle.B.x, triangle.B.y);
        context.lineTo(triangle.C.x, triangle.C.y);
        context.strokeStyle = triangle.color;
        context.fillStyle = triangle.color;
        context.closePath();
        context.stroke();
        context.fill();
    }
}