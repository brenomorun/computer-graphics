const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

let vertices = new Float32Array([0.0, 0.0]);
let colors = new Float32Array([0.0, 0.0, 1.0]);
let pointSizes = new Float32Array([10.0]);

let p1 = { x: 300, y: 300 };
let p2 = { x: 300, y: 300 };
let proximoClique = 1;

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const colorsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

const pointSizesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;
in float aPointSize;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
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

const pointSizeLocation =
    gl.getAttribLocation(
        program,
        "aPointSize"
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

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.enableVertexAttribArray(pointSizeLocation);

gl.vertexAttribPointer(
    pointSizeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
);


// BRESENHAM

function bresenham(x0, y0, x1, y1) {

    const pixels = [];

    const sx = Math.sign(x1 - x0);
    const sy = Math.sign(y1 - y0);

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);

    let troca = false;

    if (dy > dx) {
        const aux = dx;
        dx = dy;
        dy = aux;
        troca = true;
    }

    let x = x0;
    let y = y0;

    let p = 2 * dy - dx;
    const incInf = 2 * dy;
    const incSup = 2 * (dy - dx);

    pixels.push([x, y]);

    for (let i = 0; i < dx; i++) {
        if (p < 0){
            p = p + incInf;
        } else {
            p = p + incSup;
            if (troca) { x += sx; } else { y += sy; }
        }

        if (troca) {
             y += sy;
        }
        else {
             x += sx;
        }

        pixels.push([x, y]);
    }

    return pixels;
}

// TRAÇAR LINHA

function tracarLinha(x0, y0, x1, y1) {

    const pixels = bresenham(x0, y0, x1, y1);

    // cor atual (os 3 primeiros valores de colors)
    const r = colors[0];
    const g = colors[1];
    const b = colors[2];

    const posicoes = [];
    const cores = [];
    const tamanhos = [];

    for (let i = 0; i < pixels.length; i++) {

        const px = pixels[i][0];
        const py = pixels[i][1];

        const webglX = (px / canvas.width) * 2 - 1;
        const webglY = -((py / canvas.height) * 2 - 1);

        posicoes.push(webglX, webglY);
        cores.push(r, g, b);
        tamanhos.push(1.0);
    }

    vertices = new Float32Array(posicoes);
    colors = new Float32Array(cores);
    pointSizes = new Float32Array(tamanhos);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);

    drawScene();
}

// --------------------------------------------------
// 9. INTERAÇÃO COM O MOUSE
// --------------------------------------------------

canvas.addEventListener("mousedown",mouseClick,false);
  
function mouseClick(event) {

    const x = Math.floor(event.offsetX);
    const y = Math.floor(event.offsetY);

    if (proximoClique === 1) {
        p1 = { x: x, y: y };
        p2 = { x: x, y: y };
        proximoClique = 2;
    } else {
        p2 = { x: x, y: y };
        proximoClique = 1;
    }

    tracarLinha(p1.x, p1.y, p2.x, p2.y);
}

// --------------------------------------------------
// 10. INTERAÇÃO COM O TECLADO
// --------------------------------------------------

document.addEventListener(
  "keydown",
  keyboardClick,
  false
);

function keyboardClick(event) {

  switch(event.key) {
      case "0":
          colors = new Float32Array([
              1.0, 1.0, 1.0
          ]);
          break;

      case "1":
          colors = new Float32Array([
              1.0, 0.0, 0.0
          ]);
          break;

      case "2":
          colors = new Float32Array([
              0.0, 1.0, 0.0
          ]);
          break;

      case "3":
          colors = new Float32Array([
              0.0, 0.0, 1.0
          ]);
          break;

      case "4":
          colors = new Float32Array([
              1.0, 1.0, 0.0
          ]);
          break;

      case "5":
          colors = new Float32Array([
              1.0, 0.0, 1.0
          ]);
          break;

      case "6":
          colors = new Float32Array([
              0.0, 1.0, 1.0
          ]);
          break;

      case "7":
          colors = new Float32Array([
              1.0, 0.5, 0.0
          ]);
          break;

      case "8":
          colors = new Float32Array([
              0.5, 0.0, 1.0
          ]);
          break;

      case "9":
          colors = new Float32Array([
              1.0, 0.4, 0.7
          ]);
          break;

      default:
          return;
  }

    tracarLinha(p1.x, p1.y, p2.x, p2.y);

}

// --------------------------------------------------
// 11. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

// DESENHAR

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
}

tracarLinha(p1.x, p1.y, p2.x, p2.y);