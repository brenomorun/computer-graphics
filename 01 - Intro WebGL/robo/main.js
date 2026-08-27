const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

const vertices = new Float32Array([
    // Cabeça
    -0.30, 0.28,
     0.30, 0.28,
     0.30, 0.80,

    -0.30, 0.28,
     0.30, 0.80,
    -0.30, 0.80,

    // Corpo
    -0.32, -0.28,
     0.32, -0.28,
     0.32,  0.28,

    -0.32, -0.28,
     0.32,  0.28,
    -0.32,  0.28,

    // Olho esquerdo
    -0.20, 0.55,
    -0.08, 0.55,
    -0.08, 0.68,

    -0.20, 0.55,
    -0.08, 0.68,
    -0.20, 0.68,

    // Olho direito
    0.08, 0.55,
    0.20, 0.55,
    0.20, 0.68,

    0.08, 0.55,
    0.20, 0.68,
    0.08, 0.68,

    // Boca
    -0.15, 0.38,
     0.15, 0.38,
     0.15, 0.44,

    -0.15, 0.38,
     0.15, 0.44,
    -0.15, 0.44,

    // Braço esquerdo
    -0.46, -0.20,
    -0.32, -0.20,
    -0.32,  0.20,

    -0.46, -0.20,
    -0.32,  0.20,
    -0.46,  0.20,

    // Braço direito
     0.32, -0.20,
     0.46, -0.20,
     0.46,  0.20,

     0.32, -0.20,
     0.46,  0.20,
     0.32,  0.20,

    // Perna esquerda
    -0.20, -0.72,
    -0.06, -0.72,
    -0.06, -0.20,

    -0.20, -0.72,
    -0.06, -0.20,
    -0.20, -0.20,

    // Perna direita
     0.06, -0.72,
     0.20, -0.72,
     0.20, -0.20,

     0.06, -0.72,
     0.20, -0.20,
     0.06, -0.20,

    // Antena
    -0.03, 0.80,
     0.03, 0.80,
     0.03, 0.95,

    -0.03, 0.80,
     0.03, 0.95,
    -0.03, 0.95,



]);

// --------------------------------------------------
// 1. CORES
// --------------------------------------------------

const colors = new Float32Array([

    // Cabeça - cinza claro
    0.62, 0.68, 0.75,
    0.62, 0.68, 0.75,
    0.62, 0.68, 0.75,

    0.62, 0.68, 0.75,
    0.62, 0.68, 0.75,
    0.62, 0.68, 0.75,

    // Corpo - azul
    0.25, 0.55, 0.85,
    0.25, 0.55, 0.85,
    0.25, 0.55, 0.85,

    0.25, 0.55, 0.85,
    0.25, 0.55, 0.85,
    0.25, 0.55, 0.85,

    // Olho esquerdo - preto
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,

    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,

    // Olho direito - preto
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,

    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,

    // Boca - preto
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,

    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,
    0.05, 0.05, 0.08,

    // Braço esquerdo - cinza escuro
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    // Braço direito - cinza escuro
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    // Perna esquerda - cinza escuro
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    // Perna direita - cinza escuro
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    // Antena - cinza escuro
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,
    0.42, 0.48, 0.56,

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

gl.clearColor(0.1, 0.1, 0.1, 1.0);

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