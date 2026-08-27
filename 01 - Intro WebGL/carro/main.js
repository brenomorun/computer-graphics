const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

const vertices = new Float32Array([
    // Teto (trapézio)
    -0.35, 0.00,
     0.35, 0.00,
     0.20, 0.30,

    -0.35, 0.00,
     0.20, 0.30,
    -0.20, 0.30,

    // Carroceria
    -0.60, -0.30,
     0.60, -0.30,
     0.60,  0.00,

    -0.60, -0.30,
     0.60,  0.00,
    -0.60,  0.00,

    // Janela
    -0.16, 0.04,
     0.16, 0.04,
     0.16, 0.24,

    -0.16, 0.04,
     0.16, 0.24,
    -0.16, 0.24,

    // Roda esquerda
    -0.44, -0.58,
    -0.20, -0.58,
    -0.20, -0.30,

    -0.44, -0.58,
    -0.20, -0.30,
    -0.44, -0.30,

    // Roda direita
     0.20, -0.58,
     0.44, -0.58,
     0.44, -0.30,

     0.20, -0.58,
     0.44, -0.30,
     0.20, -0.30,

    // Farol
    0.50, -0.22,
    0.60, -0.22,
    0.60, -0.10,

    0.50, -0.22,
    0.60, -0.10,
    0.50, -0.10,



]);

// --------------------------------------------------
// 1. CORES
// --------------------------------------------------

const colors = new Float32Array([

        // Teto - vermelho escuro
    0.62, 0.10, 0.10,
    0.62, 0.10, 0.10,
    0.62, 0.10, 0.10,

    0.62, 0.10, 0.10,
    0.62, 0.10, 0.10,
    0.62, 0.10, 0.10,

    // Carroceria - vermelho
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,

    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,

    // Janela - azul claro
    0.65, 0.88, 0.95,
    0.65, 0.88, 0.95,
    0.65, 0.88, 0.95,

    0.65, 0.88, 0.95,
    0.65, 0.88, 0.95,
    0.65, 0.88, 0.95,

    // Roda esquerda - preto
    0.08, 0.08, 0.10,
    0.08, 0.08, 0.10,
    0.08, 0.08, 0.10,

    0.08, 0.08, 0.10,
    0.08, 0.08, 0.10,
    0.08, 0.08, 0.10,

    // Roda direita - preto
    0.08, 0.08, 0.10,
    0.08, 0.08, 0.10,
    0.08, 0.08, 0.10,

    0.08, 0.08, 0.10,
    0.08, 0.08, 0.10,
    0.08, 0.08, 0.10,

    // Farol - amarelo
    1.00, 0.90, 0.35,
    1.00, 0.90, 0.35,
    1.00, 0.90, 0.35,

    1.00, 0.90, 0.35,
    1.00, 0.90, 0.35,
    1.00, 0.90, 0.35,

]);

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const colorsBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);


// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );


// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.enableVertexAttribArray(colorLocation);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);


// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.55, 0.80, 0.95, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl.useProgram(program);

const numComponents = 2;

gl.drawArrays(
    gl.TRIANGLES,
    0,
    vertices.length / numComponents
);