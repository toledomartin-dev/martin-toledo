// Contexto WebGL compartido por las animaciones: se crea una sola vez, sobre el canvas real, y
// Three.js lo reutiliza. Crear dos contextos (uno para probar y otro para dibujar) frenaba la página.
// Con render por software (sin GPU) las animaciones trabarían todo: ahí devuelve null.
export function getGpuContext(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  try {
    // Sin pedir la placa de alto rendimiento: en las notebooks con dos placas, cambiar a la dedicada
    // congela la página casi un segundo, y unos miles de puntos andan bien con la integrada
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: true,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
    });
    if (!gl) return null;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    return /swiftshader|llvmpipe|software|basic render/i.test(name) ? null : gl;
  } catch {
    return null;
  }
}
