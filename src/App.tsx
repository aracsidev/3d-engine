// Hook, type, etc.. imports
import React from "react";
// Static imports
import "./index.css";
import { Camera, Engine, Mesh, MeshConfig, Vec3d, drawMethod, useFile } from "./lib/Engine.tsx";

function App() {

    // Camera
    const camera  = new Camera(
        new Vec3d(0, -2, -5),                           // The location of the camera in world coordinates
        new Vec3d(-10, 0, 0)                            // The rotation of the camera in degrees.
    );

    // Mesh
    // To test with different objects, see: public/objects
    const mesh    = new Mesh(
        Date.now(),                                     // Used to get a unique number.
        useFile("objects/cube.obj"),                    // Returns an array of triangles, from a file in the public folder. -- You can use a hand-written Triangle[] as well.
        new MeshConfig({                                // Takes in an object. If none given uses default values.
            position:           new Vec3d(0, 0, 0),     // The location of the mesh in world coordinates
            initialRotation:    new Vec3d(0, 0, 180),   // The initial rotation of object. Happens even if rotationEnabled is false.
            rotationEnabled:    true,                   // Start continuously rotating the mesh.
            culling:            true,                   // Enable culling.
            rotationSpeed:      .5,                     // Set speed (Angle to rotate by per frame). Use a low number like: [.25, 2]
            rotationAxisList:   ["y"],                  // Can be: "x", "y", "z", "-x", "-y", "-z", only 3 at a time.
            color:              "#e0e0e0",              // Full length hex color code.
            draw:               drawMethod.SHADED,      // Can be VERTEX, CROSSES, WIRE or SHADED - To use shaded you should turn on culling and add a lightSource.
            lightSource:        new Vec3d(0, 0, -1)     // Directional light represnted by a vector. These values will be normalized, so use numbers between [-1, 1] (There is no difference between (0,0,1) and (0,0,30))
        })
    );

    // An infinite loop is used for the render, this behaviour will be changed at some point.
    return (
        <main>
            <p>Edit App.tsx to change.</p>
            <Engine camera={camera} list={[mesh]} showWorldOrigin={false}></Engine>
        </main>
    )
}

export default App;