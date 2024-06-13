// @ts-check

/**
 * @module Engine
 * @fileoverview This file contains the hook for processing .obj files and the Engine component. Exports at the bottom.
 * @author János Aracsi
 * @version 1.0.0
 */

// Imports
import React, { useEffect, useState } from "react";
import { useRef } from "react"
import { Camera, Renderer } from "./modules/visuals.ts";
import { Mesh, Triangle, MeshConfig, Vec3d } from "./modules/geometry.ts";
import { drawMethod } from "./modules/types.ts";

/**
 * A react component responsible for rendering 3d objects.
 * The height, width and background of the canvas is to be specified in CSS.
 * @param {Camera} camera The camera used for rendering.
 * @param {Mesh[]} list A list meshes to be rendered.
 * @param {Boolean} showWorldOrigin Whether or not to render a point at the origin.
 * @returns {React.JSX.Element} A canvas element.
 */
const Engine = ({ camera, list, showWorldOrigin }: { camera: Camera, list: Mesh[], showWorldOrigin?: Boolean }): React.JSX.Element => {

    // The ref is initially null! Defined once the element has loaded.
    const canvasRef = useRef<HTMLCanvasElement|null>(null);

    // Infinite main loop.
    useMainLoop(() => {
        // Rendering once the element has loaded.
        if (canvasRef && canvasRef.current) {
            // Canvas Setup
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            canvas.height = canvasRef.current.getBoundingClientRect().height;
            canvas.width = canvasRef.current.getBoundingClientRect().width
            // Rendering
            const renderer = new Renderer(canvas.height, canvas.width, camera, list);
            // @ts-expect-error
            // The context cannot be null here. See this scope's if statement.
            renderer.render(canvas.getContext("2d"), showWorldOrigin);
        }
    });

    return (
        <canvas id="canvas" ref={canvasRef}></canvas>
    )
}

/**
 * Main animation loop.
 * @function
 * @param {Function} callback - Function used for rendering. See Renderer.render()
 * @returns {void}
 */
function useMainLoop(callback: Function): void {

    // Storing the frame Id in a useRef.
    const requestId = useRef<number>(0);

    // Infinite loop
    const loop = () => {
        callback(); // This renders the objects.
        requestId.current = requestAnimationFrame(loop);
    }

    // On mount this will start the loop.
    useEffect(() => {
        requestId.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestId.current);
    }, [loop]);
}

/**
 * Returns an array of triangles read from the provided file path within the public directory. The file must be a .obj and must contain triangluted faces!
 * @param {string} path The path to the .obj file. MUST be in the public directory!
 * @returns {Triangle[]} The mesh information (or an empty Triangle[] Because of the async fetch).
 */
const useFile = (path: string): Triangle[] => {

    if (!/^.*\.obj$/.test(path)) {
        throw new Error("The file path specified does not point to a .obj file.");
    }

    const [file, setFile] = useState<string|undefined>();

    // Fetching the file
    useEffect(() => {
        async function func() {
            path = path[0] === "/" ? `${process.env.PUBLIC_URL}${path}` : `${process.env.PUBLIC_URL}/${path}`;
            const data = await fetch(path);

            // Error handling.
            if (!data.ok && data.status === 404) {
                console.error("File not found. Make sure the path provided is valid and in the public directory! You only need to specify the path relative to the public directory.");
                throw data;
            } else if (!data.ok) {
                throw data;
            }

            // Saving the recieved string.
            setFile(await data.text());
        }
        func();
    }, []);

    if (file !== undefined) {

        /* 
            The triangles array is an array of a mock triangle type.
            Because in .obj files faces are written as a list of indices
            indicating which vertices make up that face, like this:

            f vertex1 vertex2 vertex3 ...

            For examples check the files under public/objects/
        */

        let outputTriangles: Triangle[]                             = [];
        let vertices:        Vec3d[]                                = [];
        let triangles:       {A: number, B: number, C: number}[]    = []; // Could have used a Vec3d[] but this is nicer.

        // Using regex to select the data.
        const vertex_matches   = file.match(/^v( -?\d+(\.\d+)?){3}$/gm);
        const triangle_matches = file.match(/^f( -?\d+(\.\d+)?){3}$/gm);

        if (triangle_matches === null) {
            throw new Error("The provided .obj file either has no faces, has faces constisting of more than 3 vertices or has faces that contain more information than just vertices.");
        }

        if (vertex_matches === null) {
            throw new Error("The provided .obj file has no vertices.");
        }

        // Saving vertices
        for (const vertex of vertex_matches) {
            vertices.push(new Vec3d(
                Number(vertex.split(" ")[1]),
                Number(vertex.split(" ")[2]),
                Number(vertex.split(" ")[3])
            ));
        }

        // Grouping vertex indices by faces
        for (const triangle of triangle_matches) {
            triangles.push({
                A: Number(triangle.split(" ")[1]),
                B: Number(triangle.split(" ")[2]),
                C: Number(triangle.split(" ")[3])
            });
        }

        // Selecting the correct vertices for the output triangle.
        for (const triangle of triangles) {
            outputTriangles.push(new Triangle(
                vertices[triangle.A - 1],
                vertices[triangle.B - 1],
                vertices[triangle.C - 1]
            ));
        }

        return outputTriangles;
    }

    return [];
}

// Exports
export {Mesh, MeshConfig, Vec3d, Camera, drawMethod, Triangle, useFile, Engine};