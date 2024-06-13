# 3d engine (a portfolio project)

The project was made with react, typescript (and jsdoc). It currently only exists as a part of this template (not a package), as I’m still working on it. It handles the rendering of a 3d mesh, rotation and position of the meshes and cameras, culling, directional lighting, 4 methods for drawing to the canvas and loading meshes from specific .obj files (triangulated, mesh only, single mesh). The 3d objects rendered on this site were all exported from Blender.

## Using your own .obj files

### Format

The engine goes through the file and looks for lines like these:

- Vertices      `v coord coord coord`
- Triangles     `f index index index`

No more data can exist in these lines, an Error will be thrown. Other lines can exist, they just won't be used.

### Blender

The simplest method is to import them to Blender then export them, then you just have make sure that:

- During the export select these and nothing else:
    - Selected mesh only
    - Triangluted mesh

## Using the engine

See example in: `./src/App.tsx`

## How to run:

In the project directory, you can run:

### `npm i`

Installs all dependecies.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
