// @ts-check

/**
 * @module Visuals
 * @fileoverview This file contains the classes responsible for creating visual representations of the data.
 * @author János Aracsi
 * @version 1.0.0
 */

import { Triangle, Vec3d, Mesh, Vec2d } from "./geometry.ts";
import { Matrix4x4 } from "./types.ts";

/**
 * Represents a Camera.
 * @class
 * @property {Vec3d} position       - Position of the camera, by default (0, 0, 0)
 * @property {Vec3d} rotation       - Rotation of the camera, by default (0, 0, 0)
 * @property {number} fieldOfView   - Number between 60-180, by default: 90
 * @property {number} nearPlane     - Small number, by default: 0.1
 * @property {number} farPlane      - Large number, by default: 1000
 */
export class Camera {

    /** @public */
    public position: Vec3d;
    /** @public */
    public rotation: Vec3d;

    /** Stored in radians @private */
    private fieldOfView: number;
    /** @private */
    private nearPlane: number;
    /** @private */
    private farPlane: number;

    /**
     * Creates the camera.
     * @constructor
     * @param {Vec3d|undefined} [position]       Position of the camera, by default (0, 0, 0)
     * @param {Vec3d|undefined} [rotation]       Rotation of the camera, by default (0, 0, 0)
     * @param {number|undefined} [fieldOfView]   Number (representing an angle) between 60-120 degrees, by default: 90
     * @param {number|undefined} [nearPlane]     Small number, by default: 0.1
     * @param {number|undefined} [farPlane]      Large number, by default: 1000
     */
    constructor(position?: Vec3d, rotation?: Vec3d, fieldOfView?: number, nearPlane?: number, farPlane?: number) {
        this.position       = position      === undefined ? new Vec3d(0, 0, 0)  : position;
        this.rotation       = rotation      === undefined ? new Vec3d(0, 0, 0)  : rotation;
        this.nearPlane      = nearPlane     === undefined ? .1                  : nearPlane;
        this.farPlane       = farPlane      === undefined ? 1000                : farPlane;
        this.fieldOfView    = fieldOfView   === undefined ? this.toRadian(90)   : this.toRadian(fieldOfView);

        // Enforcing minimum and maximum field of views
        this.fieldOfView = this.fieldOfView <= this.toRadian(60)  ? this.toRadian(60)  : this.fieldOfView;
        this.fieldOfView = this.fieldOfView >= this.toRadian(120) ? this.toRadian(120) : this.fieldOfView;
    }

    /**
     * Calculates the dot product a specified triangle's normal vector and a vector drawn from this camera to the center of that triangle.
     * @method
     * @param {Triangle} triangle
     * @returns {number} difference
     */
    public getDifference(triangle: Triangle): number {

        // Vector from camera to the center of the triangle
        var cameraToTriangleVector: Vec3d = new Vec3d(
            triangle.center.x - this.position.x,
            triangle.center.y - this.position.y,
            triangle.center.z - this.position.z
        );

        // Returning DOT product
        return triangle.normal.dot(cameraToTriangleVector);
    }

    /**
     * Calculates the projection matrix used for this camera
     * @param {number} aspectRatio      Screen aspect ratio
     * @returns {Matrix4x4}             Projection matrix
     */
    public getProjectionMatrix(aspectRatio: number): Matrix4x4 {
        // Empty matrix
        var matrix: Matrix4x4 = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]

        matrix[1][1] = 1 / Math.tan(this.fieldOfView / 2);
        matrix[0][0] = aspectRatio * matrix[1][1];
        matrix[2][2] = this.farPlane / this.farPlane - this.nearPlane;
        matrix[2][3] = 1;
        matrix[3][2] = (-this.farPlane * this.nearPlane) / (this.farPlane - this.nearPlane);

        return matrix;
    }

    /**
     * Returns the specified angle in radians.
     * @param {number} angle
     * @returns {number} The angle in radians.
     */
    private toRadian(angle: number): number {
        return angle / 180 * Math.PI;
    }
}

/**
 * Represents the screen (canvas). Uses a single camera.
 * @class
 * @property {number}                   height              - public
 * @property {number}                   width               - public
 * @property {number}                   aspectRatio         - public
 * @property {Camera}                   camera              - public
 * @property {Matrix4x4}                projectionMatrix    - public
 * @property {Mesh[]}                   meshList            - public
 */
export class Renderer {
    /** @public */
    public height:              number;
    /** @public */
    public width:               number;
    /** @public */
    public aspectRatio:         number;
    /** @public */
    public camera:              Camera;
    /** @public */
    public projectionMatrix:    Matrix4x4;
    /** @public */
    public meshList:            Mesh[];

    /**
     * Creates the renderer.
     * @constructor
     * @param {number}                      height
     * @param {number}                      width
     * @param {Camera}                      camera
     * @param {Mesh[]}                      meshList
     */
    constructor(height: number, width: number, camera: Camera, meshList: Mesh[]) {
        // Defined
        this.height     = height;
        this.width      = width;
        this.camera     = camera;
        this.meshList   = meshList
        // Calculated
        this.aspectRatio        = this.height/this.width;
        this.projectionMatrix   = this.camera.getProjectionMatrix(this.aspectRatio);
    }

    /**
     * Renders the meshes to the canvas.
     * @method
     * @public
     * @returns {void}
     */
    public render(context: CanvasRenderingContext2D, showWorldOrigin?: Boolean): void {
        // useMainLoop calls this function on every frame.
        for (const mesh of this.meshList) {
            mesh.rotate();
            mesh.project(this);
            mesh.draw(context);
            mesh.reset();
        }

        if (showWorldOrigin) {
            this.drawPoint(context, new Vec3d(0, 0, 0));
        }
    }

    /**
     * Draws a point at the given coordinates
     * @param {CanvasRenderingContext2D} context
     * @param {Vec3d} point
     * @returns {void}
     */
    public drawPoint(context: CanvasRenderingContext2D, point: Vec3d): void {

        const cross: [Vec3d, Vec3d, Vec3d] = [
            new Vec3d(point.x+.5, point.y,    point.z   ), // X axis
            new Vec3d(point.x,    point.y+.5, point.z   ), // Y axis
            new Vec3d(point.x,    point.y,    point.z+.5)  // Z axis
        ];

        point.project(this);

        for (let i = 0; i < cross.length; i++) {
            cross[i].project(this);
            context.beginPath();
            i === 0 ? context.strokeStyle = "#ff0000" : i === 1 ? context.strokeStyle = "#00ff00" : context.strokeStyle = "#0000ff";
            context.moveTo(point.x, point.y);
            context.lineTo(cross[i].x, cross[i].y);
            context.stroke();
            context.lineWidth = 2;
            context.closePath();
        }
    }
}