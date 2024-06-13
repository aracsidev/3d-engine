// @ts-check

/**
 * @module Types
 * @fileoverview This file contains the type declarations for the project.
 * @author aracsidev
 * @version 1.0.0
 */

/**
 * Represents a 4x4 matrix
 * @type
 */
export type Matrix4x4 = [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
]

/**
 * Represents a 2x2 matrix
 * @type
 */
export type Matrix2x2 = [
    [number, number],
    [number, number]
]

/**
 * Represents a one to three dimensional vertex.
 * @type
 * @property {number}            x
 * @property {number|undefined} [y]
 * @property {number|undefined} [z]
 */
export type Vertex = {
    x:  number;
    y?: number|undefined;
    z?: number|undefined;
}

/**
 * Types of ways you can render a mesh
 * [ VERTEX | CROSSES | WIRE | SHADED ]
 * @enum
 */
export enum drawMethod {
    VERTEX  = 1,
    CROSSES = 2,
    WIRE    = 3,
    SHADED  = 4
}