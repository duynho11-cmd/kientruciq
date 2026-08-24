/**
 * useWaveCanvas
 *
 * Gắn một WebGL canvas overlay lên một container DOM.
 * Render ảnh texture qua vertex-displacement shader:
 *   - Wave liên tục chạy ngầm (nhẹ, ambient)
 *   - Khi chuột enter → biên độ + tần số tăng (cloth deform)
 *   - Khi chuột move → ripple tại vị trí con trỏ
 *   - Khi chuột leave → ease về trạng thái ambient
 *
 * @param {React.RefObject} containerRef  - ref tới .poster-image-container
 * @param {string}          src           - URL ảnh
 * @param {boolean}         active        - chỉ render khi true
 */

import { useEffect, useRef } from 'react'

/* ── GLSL ────────────────────────────────────────────────────── */
const VERT = /* glsl */`
attribute vec2 a_position;
attribute vec2 a_uv;

uniform float u_time;
uniform float u_amp;        /* amplitude chính */
uniform float u_freq;       /* tần số sóng */
uniform float u_speed;      /* tốc độ */
uniform vec2  u_mouse;      /* -1..1 normalised */
uniform float u_rippleAmp;  /* biên độ ripple tại chuột */
uniform float u_aspect;     /* width/height */

varying vec2 v_uv;

void main() {
  vec2 pos = a_position;

  /* Sóng ambient — uốn theo trục X theo thời gian */
  float wave = sin(pos.x * u_freq + u_time * u_speed) * u_amp;
  /* Sóng thứ hai, nhẹ hơn, góc 30° */
  wave += sin((pos.x * 0.6 + pos.y * 0.8) * u_freq * 0.7
              + u_time * u_speed * 1.3) * u_amp * 0.4;

  /* Ripple tại vị trí chuột */
  vec2 toMouse  = (pos - u_mouse);
  toMouse.x    *= u_aspect;
  float dist    = length(toMouse);
  float ripple  = sin(dist * 14.0 - u_time * 5.5)
                  * u_rippleAmp
                  * smoothstep(0.6, 0.0, dist);

  pos.y += wave + ripple;

  v_uv = a_uv;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`

const FRAG = /* glsl */`
precision mediump float;

uniform sampler2D u_texture;
uniform float     u_amp;

varying vec2 v_uv;

void main() {
  /* Chromatic aberration tỉ lệ với amplitude */
  float ca   = u_amp * 0.008;
  float r    = texture2D(u_texture, v_uv + vec2( ca, 0.0)).r;
  float g    = texture2D(u_texture, v_uv               ).g;
  float b    = texture2D(u_texture, v_uv + vec2(-ca, 0.0)).b;
  float a    = texture2D(u_texture, v_uv).a;
  gl_FragColor = vec4(r, g, b, a);
}
`

/* ── Mesh helpers ─────────────────────────────────────────────── */
function buildMesh(cols, rows) {
  /* Tạo lưới positions (NDC -1..1) và UVs */
  const positions = []
  const uvs       = []
  const indices   = []

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = (c / cols) * 2 - 1
      const y = (r / rows) * 2 - 1
      positions.push(x, y)
      uvs.push(c / cols, 1 - r / rows)
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * (cols + 1) + c
      indices.push(i, i + 1, i + cols + 1)
      indices.push(i + 1, i + cols + 2, i + cols + 1)
    }
  }

  return { positions: new Float32Array(positions), uvs: new Float32Array(uvs), indices: new Uint16Array(indices) }
}

function createShader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('[wave] shader error:', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

function createProgram(gl, vert, frag) {
  const v = createShader(gl, gl.VERTEX_SHADER,   vert)
  const f = createShader(gl, gl.FRAGMENT_SHADER, frag)
  if (!v || !f) return null
  const p = gl.createProgram()
  gl.attachShader(p, v); gl.attachShader(p, f)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn('[wave] program link error:', gl.getProgramInfoLog(p))
    return null
  }
  return p
}

/* ── Hook ─────────────────────────────────────────────────────── */
export function useWaveCanvas(containerRef, src, active) {
  const canvasRef  = useRef(null)
  const glStateRef = useRef(null)   /* WebGL objects */
  const animRef    = useRef(null)
  const stateRef   = useRef({
    amp:       0,      /* current amplitude (lerped) */
    targetAmp: 0.012,  /* ambient amplitude */
    ripple:    0,
    mouseNorm: [0, 0],
  })

  /* ── Boot WebGL ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    /* Reuse or create canvas */
    let canvas = canvasRef.current
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.className = 'wave-canvas'
      container.appendChild(canvas)
      canvasRef.current = canvas
    }

    /* Size canvas to container */
    const resize = () => {
      const { offsetWidth: w, offsetHeight: h } = container
      canvas.width  = w * devicePixelRatio
      canvas.height = h * devicePixelRatio
      canvas.style.width  = `${w}px`
      canvas.style.height = `${h}px`
      const gs = glStateRef.current
      if (gs?.gl) gs.gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()

    /* WebGL context */
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false })
    if (!gl) {
      console.warn('[wave] WebGL not available — skipping')
      return
    }

    const prog = createProgram(gl, VERT, FRAG)
    if (!prog) return

    /* Mesh: 32×48 segments — mịn nhưng không nặng */
    const { positions, uvs, indices } = buildMesh(32, 48)

    const posBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const uvBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)

    const idxBuf = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    /* Attribute locations */
    const aPos = gl.getAttribLocation(prog, 'a_position')
    const aUV  = gl.getAttribLocation(prog, 'a_uv')

    /* Uniform locations */
    const uTime      = gl.getUniformLocation(prog, 'u_time')
    const uAmp       = gl.getUniformLocation(prog, 'u_amp')
    const uFreq      = gl.getUniformLocation(prog, 'u_freq')
    const uSpeed     = gl.getUniformLocation(prog, 'u_speed')
    const uMouse     = gl.getUniformLocation(prog, 'u_mouse')
    const uRippleAmp = gl.getUniformLocation(prog, 'u_rippleAmp')
    const uAspect    = gl.getUniformLocation(prog, 'u_aspect')
    const uTexture   = gl.getUniformLocation(prog, 'u_texture')

    /* Load texture —
       Ưu tiên dùng <img> đã có sẵn trong container (đã cached, không CORS lại).
       Canvas chỉ được hiện sau khi texture upload xong.               */
    const tex = gl.createTexture()
    const setupTexParams = () => {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    }

    /* 1px transparent placeholder — canvas KHÔNG hiện cho đến khi loaded */
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 0, 0]))
    setupTexParams()

    /* Canvas ẩn cho đến khi có texture thật */
    canvas.style.opacity = '0'

    const uploadTexture = (source) => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
        setupTexParams()
        /* Texture đã upload → hiện canvas, ẩn img gốc */
        canvas.classList.add('wave-canvas--loaded')
        canvas.style.opacity = ''   /* trả về CSS animation */
      } catch (e) {
        console.warn('[wave] texImage2D error:', e)
        canvas.remove()
        canvasRef.current = null
      }
    }

    /* Tìm <img> đã render trong container — dùng luôn nếu complete */
    const existingImg = container.querySelector('img')
    if (existingImg?.complete && existingImg.naturalWidth > 0) {
      uploadTexture(existingImg)
    } else {
      /* Fallback: load lại qua Image() */
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload  = () => uploadTexture(img)
      img.onerror = () => {
        console.warn('[wave] image load failed, removing canvas')
        canvas.remove()
        canvasRef.current = null
      }
      img.src = src
    }

    glStateRef.current = { gl, prog, posBuf, uvBuf, idxBuf, aPos, aUV,
      uTime, uAmp, uFreq, uSpeed, uMouse, uRippleAmp, uAspect, uTexture,
      tex, indexCount: indices.length }

    /* ResizeObserver */
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    /* Render loop */
    const start  = performance.now()
    const lerp   = (a, b, t) => a + (b - a) * t
    const s      = stateRef.current

    const tick = (now) => {
      const t  = (now - start) / 1000
      const gs = glStateRef.current
      if (!gs) return

      /* Lerp amplitude */
      s.amp    = lerp(s.amp, s.targetAmp, 0.06)
      s.ripple = lerp(s.ripple, 0, 0.055)

      const { gl: G, prog: P, indexCount } = gs
      G.viewport(0, 0, canvas.width, canvas.height)
      G.clearColor(0, 0, 0, 1)
      G.clear(G.COLOR_BUFFER_BIT)

      // WebGL method; not a React Hook.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      G.useProgram(P)

      /* Bind position */
      G.bindBuffer(G.ARRAY_BUFFER, gs.posBuf)
      G.enableVertexAttribArray(gs.aPos)
      G.vertexAttribPointer(gs.aPos, 2, G.FLOAT, false, 0, 0)

      /* Bind UV */
      G.bindBuffer(G.ARRAY_BUFFER, gs.uvBuf)
      G.enableVertexAttribArray(gs.aUV)
      G.vertexAttribPointer(gs.aUV, 2, G.FLOAT, false, 0, 0)

      /* Bind indices */
      G.bindBuffer(G.ELEMENT_ARRAY_BUFFER, gs.idxBuf)

      /* Uniforms */
      G.uniform1f(gs.uTime,      t)
      G.uniform1f(gs.uAmp,       s.amp)
      G.uniform1f(gs.uFreq,      3.2)
      G.uniform1f(gs.uSpeed,     0.55)
      G.uniform2fv(gs.uMouse,    s.mouseNorm)
      G.uniform1f(gs.uRippleAmp, s.ripple)
      G.uniform1f(gs.uAspect,    canvas.width / canvas.height)

      /* Texture */
      G.activeTexture(G.TEXTURE0)
      G.bindTexture(G.TEXTURE_2D, gs.tex)
      G.uniform1i(gs.uTexture, 0)

      G.drawElements(G.TRIANGLES, indexCount, G.UNSIGNED_SHORT, 0)

      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      /* Cleanup GL */
      if (glStateRef.current) {
        const { gl: G, prog: P, posBuf, uvBuf, idxBuf, tex } = glStateRef.current
        G.deleteBuffer(posBuf); G.deleteBuffer(uvBuf); G.deleteBuffer(idxBuf)
        G.deleteTexture(tex);   G.deleteProgram(P)
        glStateRef.current = null
      }
      /* Remove canvas */
      canvas.remove()
      canvasRef.current = null
    }
  }, [active, containerRef, src])

  /* ── Mouse events — tăng / giảm wave ─────────────────────────── */
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const s = stateRef.current

    const onEnter = () => {
      s.targetAmp = 0.045   /* cloth deform khi hover */
    }

    const onLeave = () => {
      s.targetAmp = 0.012   /* ease về ambient */
      s.ripple    = 0
    }

    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      /* Normalise to -1..1 */
      const nx = ((e.clientX - rect.left)  / rect.width)  * 2 - 1
      const ny = ((e.clientY - rect.top)   / rect.height) * 2 - 1
      s.mouseNorm = [nx, -ny]   /* flip Y để match WebGL coords */
      s.ripple    = lerp(s.ripple, 0.028, 0.22)
    }

    const lerp = (a, b, t) => a + (b - a) * t

    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)
    container.addEventListener('mousemove',  onMove)

    return () => {
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      container.removeEventListener('mousemove',  onMove)
    }
  }, [active, containerRef])
}
