const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {

    vec3 position =
        u_viewTransform *
        u_modelTransform *
        vec3(aPosition, 1.0);

    gl_Position =
        vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {

    outColor =
        vec4(uColor, 1.0);
}
`;

function createShader(gl, type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {

        const error =
            gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}

function createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
) {

    const vertexShader =
        createShader(
            gl,
            gl.VERTEX_SHADER,
            vertexShaderSource
        );

    const fragmentShader =
        createShader(
            gl,
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

    const program =
        gl.createProgram();

    gl.attachShader(
        program,
        vertexShader
    );

    gl.attachShader(
        program,
        fragmentShader
    );

    gl.linkProgram(program);

    if (
        !gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        )
    ) {

        throw new Error(
            gl.getProgramInfoLog(program)
        );
    }

    return program;
}


const program =
    createProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
    );


// ==================================================
// CLASSE RENDERER
// ==================================================

class Renderer {

    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.positionLocation =
            gl.getAttribLocation(
                program,
                "aPosition"
            );

        this.colorLocation =
            gl.getUniformLocation(
                program,
                "uColor"
            );

        this.viewTransformLocation =
            gl.getUniformLocation(
                program,
                "u_viewTransform"
            );

        this.modelTransformLocation =
            gl.getUniformLocation(
                program,
                "u_modelTransform"
            );

        this.viewTransform =
            m3.identity();

        this.verticesBuffer =
            gl.createBuffer();
    }

    defineViewTransform(viewTransform) {
        this.viewTransform =
            viewTransform;
    }

    draw(object) {
        const gl = this.gl;

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.verticesBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.vertices,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.positionLocation
        );

        gl.vertexAttribPointer(
            this.positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.uniform3fv(
            this.colorLocation,
            object.color
        );

        gl.uniformMatrix3fv(
            this.modelTransformLocation,
            false,
            object.modelTransform
        );

        gl.uniformMatrix3fv(
            this.viewTransformLocation,
            false,
            this.viewTransform
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            object.vertices.length / 2
        );
    }
}

// ==================================================
// AUXILIARY FUNCTIONS
// ==================================================

function rectangleVertices(x,y,width,height){
    return [
        x, y,
        x+width, y+height,
        x, y+height,

        x, y,
        x+width, y,
        x+width, y+height
    ];
}

function circleVertices(radius,numSegments){
    const vertices = [];

    for (let i = 0; i < numSegments; i++) {
        const theta1 =
            (i / numSegments) *
            2 * Math.PI;

        const theta2 =
            ((i + 1) / numSegments) *
            2 * Math.PI;


        vertices.push(
            0,
            0
        );

        vertices.push(
            radius * Math.cos(theta1),
            radius * Math.sin(theta1)
        );


        vertices.push(
            radius * Math.cos(theta2),
            radius * Math.sin(theta2)
        );
    }

    return vertices;
}

// ==================================================
// CLASSE SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(vertices, color) {

        this.vertices = vertices;

        this.color = color; 

        this.modelTransform = m3.identity();
    }

    updateModelTransform(modelTransform) {

        this.modelTransform = modelTransform;
    }
}

// VERTICES DAS PARTES DO ROBÔ

function corpoVertices() {
    return new Float32Array(rectangleVertices(-0.15, -0.2, 0.3, 0.4));
}

function cabecaVertices() {
    return new Float32Array(rectangleVertices(-0.1, -0.1, 0.2, 0.2));
}

function bracoVertices() {
    return new Float32Array(rectangleVertices(-0.04, -0.3, 0.08, 0.3));
}

function pernaVertices() {
    return new Float32Array(rectangleVertices(-0.05, -0.3, 0.1, 0.3));
}

function olhoVertices() {
    return new Float32Array(rectangleVertices(-0.02, -0.02, 0.04, 0.04));
}

function antenaVertices() {
    return new Float32Array(rectangleVertices(-0.01, 0.0, 0.02, 0.1));
}

// CLASSE PARTE DO ROBÔ

class ParteRobo extends SceneObject {

    constructor(vertices, color, offsetX, offsetY) {

        super(vertices, color);

        this.offsetX = offsetX;

        this.offsetY = offsetY;

        this.theta = 0.0;
    }

    updateModelTransform(roboTransform) {

        const localTransform =

            m3.multiply(
                m3.translation(this.offsetX, this.offsetY),
                m3.rotation(this.theta)
            );

        this.modelTransform =

            m3.multiply(
                roboTransform,
                localTransform
            );
    }
}

// CLASSE ROBÔ

class Robo {

    constructor(tx, ty) {

        this.tx = tx;

        this.ty = ty;

        this.speed = 0.005;

        this.tempo = 0.0;

        this.corpo = new ParteRobo(corpoVertices(), new Float32Array([0.55, 0.55, 0.6]), 0.0, 0.0);

        this.cabeca = new ParteRobo(cabecaVertices(), new Float32Array([0.7, 0.7, 0.75]), 0.0, 0.3);

        this.bracoEsq = new ParteRobo(bracoVertices(), new Float32Array([0.4, 0.4, 0.45]), -0.19, 0.18);

        this.bracoDir = new ParteRobo(bracoVertices(), new Float32Array([0.4, 0.4, 0.45]), 0.19, 0.18);

        this.pernaEsq = new ParteRobo(pernaVertices(), new Float32Array([0.35, 0.35, 0.4]), -0.08, -0.2);

        this.pernaDir = new ParteRobo(pernaVertices(), new Float32Array([0.35, 0.35, 0.4]), 0.08, -0.2);

        this.olhoEsq = new ParteRobo(olhoVertices(), new Float32Array([0.05, 0.05, 0.05]), -0.04, 0.02);

        this.olhoDir = new ParteRobo(olhoVertices(), new Float32Array([0.05, 0.05, 0.05]), 0.04, 0.02);

        this.antena = new ParteRobo(antenaVertices(), new Float32Array([0.8, 0.8, 0.85]), 0.0, 0.1);
    }

    move() {

        this.tx += this.speed;

        if (this.tx > 1.5 || this.tx < -1.5) {

            this.speed = -this.speed;
        }

        this.tempo += 0.05;

        const roboTransform = m3.translation(this.tx, this.ty);

        // BRAÇOS: balançam devagar, um pra cada lado

        this.bracoEsq.theta =  0.6 * Math.sin(this.tempo);

        this.bracoDir.theta = -0.6 * Math.sin(this.tempo);

        // PERNAS: balançam mais rápido e com menos amplitude

        this.pernaEsq.theta =  0.3 * Math.sin(2.0 * this.tempo);

        this.pernaDir.theta = -0.3 * Math.sin(2.0 * this.tempo);

        // CABEÇA: só inclina de leve

        this.cabeca.theta = 0.15 * Math.sin(0.5 * this.tempo);

        // atualiza a matriz de cada peça a partir da matriz do robô

        this.corpo.updateModelTransform(roboTransform);

        this.cabeca.updateModelTransform(roboTransform);

        this.bracoEsq.updateModelTransform(roboTransform);

        this.bracoDir.updateModelTransform(roboTransform);

        this.pernaEsq.updateModelTransform(roboTransform);

        this.pernaDir.updateModelTransform(roboTransform);

        this.olhoEsq.updateModelTransform(this.cabeca.modelTransform);

        this.olhoDir.updateModelTransform(this.cabeca.modelTransform);

        this.antena.updateModelTransform(this.cabeca.modelTransform);
    }
    
    draw(renderer) {

        renderer.draw(this.corpo);

        renderer.draw(this.cabeca);

        renderer.draw(this.bracoEsq);

        renderer.draw(this.bracoDir);

        renderer.draw(this.pernaEsq);

        renderer.draw(this.pernaDir);

        renderer.draw(this.olhoEsq);

        renderer.draw(this.olhoDir);

        renderer.draw(this.antena);
    }
}

// CLASSE SCENE

class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl, program);

        this.viewTransform = m3.setClippingWindow(-2.0, -1.0, 2.0, 1.0);

        this.renderer.defineViewTransform(this.viewTransform);

        this.robo = new Robo(0.0, 0.0);
    }

    update() {

        this.robo.move();
    }

    draw() {

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        this.robo.draw(this.renderer);
    }

    execute() {

        this.update();

        this.draw();

        requestAnimationFrame(() => this.execute());
    }

    init() {

        requestAnimationFrame(() => this.execute());
    }
}

// CONFIGURAÇÃO INICIAL DO WEBGL

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.viewport(0, 0, canvas.width, canvas.height);

// CRIAR CENA E INICIAR ANIMAÇÃO

const scene = new Scene(gl, program);

scene.init();