/* Homepage hero: "We source real assets, secure their title, build them, lease
   them and steward them", told as one WebGL scene. No dependencies.
   Every frame is a pure function of the timeline position t, so the story can
   loop, jump to a chapter, or stay frozen on its last frame for reduced motion.
   If WebGL2 is unavailable this exits and the SVG underneath stays in place. */
(function () {
  'use strict';

  // ---------- timeline ----------
  var CH = [
    { at: 0.0, n: '01', name: 'Source', line: 'We read parcels across the market. Most never pass.' },
    { at: 3.6, n: '02', name: 'Title', line: 'Title first. Every layer of ownership is read before anything else.' },
    { at: 8.2, n: '03', name: 'Build', line: 'The team that recommends the asset is the team that builds it.' },
    { at: 13.6, n: '04', name: 'Lease', line: 'Floor by floor, the asset starts to earn.' },
    { at: 17.4, n: '05', name: 'Steward', line: 'Capital moves. The asset stays, and so do we.' }
  ];
  var END = 23.2, TOTAL = 24.2, FROZEN = 22.8;

  // ---------- maths ----------
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function p01(a, b, t) { return clamp((t - a) / (b - a), 0, 1); }
  function ss(a, b, t) { var x = p01(a, b, t); return x * x * (3 - 2 * x); }
  function out(a, b, t) { var x = 1 - p01(a, b, t); return 1 - x * x * x; }
  function back(a, b, t) { var x = p01(a, b, t) - 1, c = 1.6; return 1 + (c + 1) * x * x * x + c * x * x; }
  function frac(x) { return x - Math.floor(x); }
  function hash(i, j) { return frac(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453); }
  function rgb(h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; }
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function keys(list, t) {
    if (t <= list[0][0]) return list[0][1];
    for (var i = 1; i < list.length; i++) if (t <= list[i][0]) return list[i - 1][1] + (list[i][1] - list[i - 1][1]) * ss(list[i - 1][0], list[i][0], t);
    return list[list.length - 1][1];
  }
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function lookAt(e, c) {
    var z = norm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = norm(cross([0, 1, 0], z)), y = cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
  }
  function ortho(w, h, n, f) { return [1 / w, 0, 0, 0, 0, 1 / h, 0, 0, 0, 0, -2 / (f - n), 0, 0, 0, -(f + n) / (f - n), 1]; }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[r + 4] * b[c * 4 + 1] + a[r + 8] * b[c * 4 + 2] + a[r + 12] * b[c * 4 + 3];
    return o;
  }

  // ---------- geometry (position + normal) ----------
  function boxGeo() {
    var v = [], faces = [
      [[0, 1, 0], [-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]],
      [[0, 0, 1], [-1, 0, 1], [1, 0, 1], [1, 1, 1], [-1, 1, 1]],
      [[1, 0, 0], [1, 0, 1], [1, 0, -1], [1, 1, -1], [1, 1, 1]],
      [[-1, 0, 0], [-1, 0, -1], [-1, 0, 1], [-1, 1, 1], [-1, 1, -1]],
      [[0, 0, -1], [1, 0, -1], [-1, 0, -1], [-1, 1, -1], [1, 1, -1]]
    ];
    faces.forEach(function (f) {
      [1, 2, 3, 1, 3, 4].forEach(function (i) { v.push(f[i][0] / 2, f[i][1], f[i][2] / 2, f[0][0], f[0][1], f[0][2]); });
    });
    return v;
  }
  function cylGeo(n) {
    var v = [];
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2;
      var ax = Math.cos(a), az = Math.sin(a), bx = Math.cos(b), bz = Math.sin(b);
      v.push(ax / 2, 0, az / 2, ax, 0, az, bx / 2, 1, bz / 2, bx, 0, bz, bx / 2, 0, bz / 2, bx, 0, bz);
      v.push(ax / 2, 0, az / 2, ax, 0, az, ax / 2, 1, az / 2, ax, 0, az, bx / 2, 1, bz / 2, bx, 0, bz);
      v.push(0, 1, 0, 0, 1, 0, bx / 2, 1, bz / 2, 0, 1, 0, ax / 2, 1, az / 2, 0, 1, 0);
    }
    return v;
  }
  function sphGeo(lat, lon) {
    var v = [];
    function pt(i, j) {
      var th = i / lat * Math.PI, ph = j / lon * Math.PI * 2;
      var x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
      v.push(x / 2, y / 2 + 0.5, z / 2, x, y, z);
    }
    for (var i = 0; i < lat; i++) for (var j = 0; j < lon; j++) { pt(i, j); pt(i, j + 1); pt(i + 1, j + 1); pt(i, j); pt(i + 1, j + 1); pt(i + 1, j); }
    return v;
  }

  var VS = '#version 300 es\n' +
    'layout(location=0) in vec3 p;layout(location=1) in vec3 n;layout(location=2) in vec3 iP;layout(location=3) in vec3 iS;layout(location=4) in float iR;layout(location=5) in vec3 iC;layout(location=6) in float iG;' +
    'uniform mat4 uVP;uniform mat4 uL;out vec3 vN;out vec3 vW;out vec3 vC;out vec4 vLP;out float vG;' +
    'void main(){float c=cos(iR),s=sin(iR);vec3 q=p*iS;vec3 w=vec3(c*q.x+s*q.z,q.y,-s*q.x+c*q.z)+iP;' +
    'vN=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);vW=w;vC=iC;vG=iG;vLP=uL*vec4(w,1.);gl_Position=uVP*vec4(w,1.);}';
  var FS = '#version 300 es\nprecision highp float;precision highp sampler2DShadow;' +
    'in vec3 vN;in vec3 vW;in vec3 vC;in vec4 vLP;in float vG;uniform sampler2DShadow uS;uniform vec3 uD;uniform float uT;out vec4 o;' +
    'void main(){vec3 n=normalize(vN);vec3 q=vLP.xyz/vLP.w*.5+.5;float s=0.;' +
    'for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)s+=texture(uS,vec3(q.xy+vec2(float(i),float(j))*uT,q.z-.0011));s/=9.;' +
    'float d=max(dot(n,uD),0.);float a=smoothstep(0.,1.15,vW.y);' +
    'vec3 amb=mix(vec3(.61,.68,.71),vec3(.8,.825,.835),.5+.5*n.y);' +
    'vec3 c=vC*(amb*mix(.9,1.,a)+vec3(1.,.97,.93)*.25*d*s);' +
    'o=vec4(mix(min(c,vec3(1.)),vC,vG),1.);}';
  var DS = '#version 300 es\nprecision mediump float;void main(){}';

  var INST = 11, SHADOW = 2048;

  window.ATHeroStory = function (host) {
    var canvas = document.createElement('canvas');
    canvas.className = 'hs-gl';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'A vacant parcel is sourced, its title verified, a building rises on it, its floors lease up, and the finished asset is stewarded.');
    var gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return function () {};

    function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    function program(v, f) {
      var pr = gl.createProgram();
      gl.attachShader(pr, shader(gl.VERTEX_SHADER, v)); gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, f)); gl.linkProgram(pr);
      return gl.getProgramParameter(pr, gl.LINK_STATUS) ? pr : null;
    }
    var main = program(VS, FS), depth = program(VS, DS);
    if (!main || !depth) return function () {};
    var uni = {
      vp: gl.getUniformLocation(main, 'uVP'), l: gl.getUniformLocation(main, 'uL'), s: gl.getUniformLocation(main, 'uS'),
      d: gl.getUniformLocation(main, 'uD'), t: gl.getUniformLocation(main, 'uT'), dvp: gl.getUniformLocation(depth, 'uVP')
    };

    function mesh(data, max) {
      var vao = gl.createVertexArray(), vb = gl.createBuffer(), ib = gl.createBuffer(), arr = new Float32Array(data);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
      var d = new Float32Array(max * INST);
      gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferData(gl.ARRAY_BUFFER, d.byteLength, gl.DYNAMIC_DRAW);
      [[2, 3, 0], [3, 3, 12], [4, 1, 24], [5, 3, 28], [6, 1, 40]].forEach(function (a) {
        gl.enableVertexAttribArray(a[0]); gl.vertexAttribPointer(a[0], a[1], gl.FLOAT, false, INST * 4, a[2]); gl.vertexAttribDivisor(a[0], 1);
      });
      gl.bindVertexArray(null);
      return { vao: vao, ib: ib, verts: arr.length / 6, d: d, n: 0, max: max, base: 0 };
    }
    var BOX = mesh(boxGeo(), 3000), CYL = mesh(cylGeo(10), 400), SPH = mesh(sphGeo(8, 12), 400), ALL = [BOX, CYL, SPH];

    var sTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SHADOW, SHADOW);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, sTex, 0);
    gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // ---------- scene ----------
    var C = {
      ground: rgb('#E6EEEF'), parcel: rgb('#FFFFFF'), road: rgb('#CBD8DB'), lane: rgb('#FFFFFF'),
      bldg: rgb('#FBFDFD'), bldg2: rgb('#E4ECEE'), win: rgb('#9DB8BD'), teal: rgb('#13353E'), teal2: rgb('#254750'), teal3: rgb('#2E5F6B'),
      gold: rgb('#A9843F'), goldLit: rgb('#D9B15F'), warm: rgb('#F4EAD3'), lit: rgb('#F6D48B'), white: rgb('#FFFFFF'),
      s1: rgb('#9C855F'), s2: rgb('#B39C78'), s3: rgb('#CCBEA3'), s4: rgb('#E8E1D3'),
      leaf: rgb('#A9C5B8'), leaf2: rgb('#8FB3A2'), trunk: rgb('#8A7350'), pv: rgb('#1D4B57')
    };
    var P = 6.4, ROAD = 1.4, PAD = 5, HALF = P * 1.5 + 0.2;

    function put(m, x, y, z, sx, sy, sz, r, c, g) {
      if (m.n >= m.max) return;
      var d = m.d, i = m.n++ * INST;
      d[i] = x; d[i + 1] = y; d[i + 2] = z; d[i + 3] = sx; d[i + 4] = sy; d[i + 5] = sz; d[i + 6] = r || 0; d[i + 7] = c[0]; d[i + 8] = c[1]; d[i + 9] = c[2]; d[i + 10] = g || 0;
    }

    function tree(x, z, k, s, c, y) {
      if (k <= 0.01) return;
      y = y || 0;
      put(CYL, x, y + 0.05, z, 0.09, 0.55 * k * s, 0.09, 0, C.trunk);
      put(SPH, x, y + 0.42 * k * s, z, 0.82 * k * s, 0.95 * k * s, 0.82 * k * s, 0, c || C.leaf);
    }
    function panes(x, z, w, d, h, base, col) {
      var rows = Math.floor(h / 0.62), cw = Math.max(2, Math.floor(w / 0.72)), cd = Math.max(2, Math.floor(d / 0.72)), i, j;
      for (i = 0; i < rows; i++) {
        var y = base + 0.22 + i * 0.62;
        for (j = 0; j < cw; j++) put(BOX, x - w / 2 + (j + 0.5) * w / cw, y, z + d / 2, 0.26, 0.3, 0.04, 0, col || C.win);
        for (j = 0; j < cd; j++) put(BOX, x + w / 2, y, z - d / 2 + (j + 0.5) * d / cd, 0.04, 0.3, 0.26, 0, col || C.win);
      }
    }
    function block(x, z, w, d, h, col, win) {
      put(BOX, x, 0.07, z, w, h, d, 0, col);
      if (win !== false) panes(x, z, w, d, h, 0.07, win);
    }

    // The city around the story stays quiet and unsaturated, so the story reads.
    (function city() {
      put(BOX, 0, -0.55, 0, HALF * 2, 0.55, HALF * 2, 0, C.ground);
      var i, j;
      [-P / 2, P / 2].forEach(function (c) {
        put(BOX, c, 0, 0, ROAD, 0.025, HALF * 2, 0, C.road);
        put(BOX, 0, 0, c, HALF * 2, 0.025, ROAD, 0, C.road);
        for (i = -9; i <= 9; i++) {
          var q = i * 1.05;
          if (Math.abs(Math.abs(q) - P / 2) > ROAD / 2 + 0.25) {
            put(BOX, c, 0.026, q, 0.06, 0.006, 0.5, 0, C.lane);
            put(BOX, q, 0.026, c, 0.5, 0.006, 0.06, 0, C.lane);
          }
        }
      });
      for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j++) {
        if ((i === 0 && j === 0) || (i === 1 && j === -1) || (i === -1 && j === 1)) continue;
        put(BOX, i * P, 0, j * P, PAD, 0.07, PAD, 0, C.parcel);
      }
      // back row: taller
      block(-P - 0.9, -P - 0.8, 2.3, 2.6, 4.3, C.bldg);
      block(-P + 1.3, -P + 1.2, 1.9, 1.9, 3.1, C.bldg);
      block(-P + 1.3, -P - 1.3, 1.9, 1.6, 1.9, C.bldg2);
      block(-P - 0.2, 0, 3.6, 2.2, 3.7, C.bldg);
      block(-P - 0.3, -1.9 + 3.8, 2.8, 0.9, 1.2, C.bldg2);
      block(1.2, -P - 0.6, 2.2, 3, 4.3, C.bldg);
      block(-1.4, -P + 0.4, 1.7, 2.8, 2.4, C.bldg2);
      // sides and front: low so the parcel stays in view
      block(P - 0.3, -0.2, 3.8, 3.2, 1.25, C.bldg);
      block(-0.2, P, 3.2, 3.8, 1.25, C.bldg);
      put(BOX, P, 0.07, P, 3.6, 0.05, 3.6, 0, C.leaf2);
      put(BOX, P, 0.12, P, 3, 0.03, 3, 0, C.leaf);
      [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5], [0, -0.3], [0.8, 0.9]].forEach(function (o, k) { tree(P + o[0], P + o[1], 1, k % 2 ? 1.5 : 1.15, k % 2 ? C.leaf2 : C.leaf, 0.12); });
      // street trees
      [[-P, -P + 2.3], [-P + 2.2, -2.3], [2.3, -P - 2.2], [-2.2, P + 2.1], [P + 2.2, -2.1], [P + 2.2, 2.2], [2.3, P + 2.2], [-P - 2.3, 2.2]].forEach(function (o, k) { tree(o[0], o[1], 1, 1.05, k % 2 ? C.leaf : C.leaf2, 0.07); });
      ALL.forEach(function (m) { m.base = m.n; });
    })();

    // Vacant parcels that get read and passed over; the centre one is the story.
    var CAND = [
      { x: -P, z: P, on: 0.2, off: 1.3 },
      { x: P, z: -P, on: 1.35, off: 2.45 },
      { x: 0, z: 0, on: 2.5, off: 99 }
    ];

    function outline(x, y, z, s, w, h, col, g) {
      put(BOX, x, y, z + s / 2, s + w, h, w, 0, col, g);
      put(BOX, x, y, z - s / 2, s + w, h, w, 0, col, g);
      put(BOX, x + s / 2, y, z, w, h, s + w, 0, col, g);
      put(BOX, x - s / 2, y, z, w, h, s + w, 0, col, g);
    }

    function hero(t) {
      var sink = 14 * ss(END, TOTAL, t);
      function add(m, x, y, z, sx, sy, sz, r, c, g) { put(m, x, y - sink, z, sx, sy, sz, r, c, g); }
      var i, j, k;

      // ambient traffic (whole laps per loop so it wraps cleanly)
      for (i = 0; i < 3; i++) {
        var u = frac(t / TOTAL * (2 + i) + i * 0.37) * HALF * 2 - HALF;
        put(BOX, u, 0.05, -P / 2 + 0.32, 0.56, 0.2, 0.28, 0, C.bldg2);
        put(BOX, -P / 2 - 0.32, 0.05, -u, 0.28, 0.2, 0.56, 0, C.bldg2);
      }

      // 01 Source: three vacant parcels; a pin reads each, two are passed over
      CAND.forEach(function (c, idx) {
        var isHero = idx === 2;
        var a = out(c.on, c.on + 0.35, t), b = isHero ? 0 : ss(c.off - 0.25, c.off, t);
        var glow = a * (1 - b);
        put(BOX, c.x, 0, c.z, PAD, 0.07, PAD, 0, mix(C.parcel, C.warm, glow * 0.85));
        if (glow > 0.01) outline(c.x, 0.07, c.z, PAD, 0.09 * glow, 0.03, C.gold);
        var pinOut = isHero ? ss(3.7, 4.0, t) : b;
        var drop = back(c.on, c.on + 0.5, t);
        if (t > c.on && pinOut < 1) {
          var ph = 2.6 * (1 - pinOut), y0 = 0.07 + (1 - drop) * 4;
          add(CYL, c.x, y0, c.z, 0.07, ph, 0.07, 0, C.gold);
          add(SPH, c.x, y0 + ph - 0.18, c.z, 0.56 * (1 - pinOut), 0.56 * (1 - pinOut), 0.56 * (1 - pinOut), 0, C.teal);
        }
      });

      // 02 Title: the land lifts in layers, each is read, then it settles and is staked
      var lift = out(3.8, 4.7, t) * (1 - ss(6.1, 6.8, t));
      var cols = [C.s1, C.s2, C.s3, C.s4];
      if (t > 3.8) {
        var grown = out(3.8, 4.1, t);
        for (i = 0; i < 4; i++) {
          var sliceY = 0.07 + i * 0.09 + lift * i * 0.95;
          var read = ss(4.9 + (3 - i) * 0.3, 5.15 + (3 - i) * 0.3, t);
          var slabCol = i === 3 ? mix(C.s4, C.warm, ss(6.3, 6.9, t)) : cols[i];
          add(BOX, 0, sliceY, 0, 4.7, 0.09 * grown + lift * 0.26, 4.7, 0, mix(slabCol, C.goldLit, read * (1 - ss(6.1, 6.6, t)) * 0.55));
        }
        // the reading frame travels down the stack
        var scan = p01(4.75, 6.05, t);
        if (scan > 0 && scan < 1) {
          var fade = ss(0, 0.06, scan) * (1 - ss(0.94, 1, scan));
          outline(0, 0.1 + (1 - scan) * 3.5, 0, 5.05, 0.11 * fade, 0.05, C.gold, 0.9);
        }
      }
      // stakes and the boundary line
      if (t > 6.7) {
        var e = 2.42;
        var stakes = [[-e, -e], [e, -e], [e, e], [-e, e], [0, -e], [e, 0], [0, e], [-e, 0]];
        stakes.forEach(function (s, n) {
          var st = 6.7 + n * 0.09, kk = back(st, st + 0.35, t);
          if (t <= st) return;
          add(CYL, s[0], 0.4 + (1 - kk) * 2, s[1], 0.06, 0.95, 0.06, 0, C.gold);
          add(SPH, s[0], 1.24 + (1 - kk) * 2, s[1], 0.27, 0.27, 0.27, 0, C.white);
        });
        var perim = 56;
        for (i = 0; i < perim; i++) {
          var at = 6.85 + (i / perim) * 0.75;
          if (t <= at) continue;
          var s4 = i / perim * 4, side = Math.floor(s4), f = s4 - side;
          var a2 = -e + f * 2 * e, px, pz, horiz;
          if (side === 0) { px = a2; pz = e; horiz = 1; } else if (side === 1) { px = e; pz = -a2; horiz = 0; } else if (side === 2) { px = -a2; pz = -e; horiz = 1; } else { px = -e; pz = a2; horiz = 0; }
          if (i % 2) continue;
          add(BOX, px, 0.42, pz, horiz ? 0.2 : 0.07, 0.03, horiz ? 0.07 : 0.2, 0, C.gold, 0.6);
        }
        // flag: the land is secured
        var fl = back(7.5, 7.95, t);
        if (t > 7.5) {
          add(CYL, -1.9, 0.4, -1.9, 0.06, 1.7 * fl, 0.06, 0, C.teal);
          add(BOX, -1.9 + 0.33, 0.4 + 1.33 * fl, -1.9, 0.62 * fl, 0.36 * fl, 0.03, 0, C.gold);
        }
      }

      // 03 Build: foundation, crane, floors
      var FP = 3, FH = 0.56, N = 12, BASE = 0.42, H = N * FH, TOP = BASE + 0.22 + H;
      if (t > 8.3) {
        add(BOX, 0, 0.41, 0, FP + 1.1, 0.2 * out(8.3, 8.8, t), FP + 1.1, 0, C.bldg);
      }
      var cu = out(8.5, 9.1, t) * (1 - ss(13.3, 13.9, t));
      if (cu > 0.01) {
        var CX = 2.1, CZ = -2.1, CH_ = 9.4 * cu, slew = Math.sin(t * 1.15) * 0.22;
        var ang = -Math.PI * 0.75 + slew;
        var dx = Math.cos(ang), dz = -Math.sin(ang);
        add(BOX, CX, 0.42, CZ, 0.32, CH_, 0.32, 0, C.gold);
        add(BOX, CX, 0.42 + CH_, CZ, 0.42, 0.42, 0.42, 0, C.teal);
        var L = 6.2 * cu, jibY = 0.42 + CH_ + 0.14;
        add(BOX, CX + dx * (L / 2 - 1.5), jibY, CZ + dz * (L / 2 - 1.5), L, 0.15, 0.14, ang, C.gold);
        add(BOX, CX - dx * 1.2, jibY - 0.14, CZ - dz * 1.2, 0.5, 0.42, 0.5, ang, C.teal);
        // hook drops each floor onto the stack
        var fi = clamp(Math.floor((t - 9) / 0.33), 0, N - 1), fPhase = frac((t - 9) / 0.33);
        var topNow = BASE + 0.22 + (fi + 1) * FH;
        var hookY = topNow + 0.3 + (1 - out(0, 0.75, fPhase)) * 1.8;
        var hd = 1.9 + Math.sin(t * 2.3) * 0.25;
        if (t > 8.95) {
          add(BOX, CX + dx * hd, hookY, CZ + dz * hd, 0.035, Math.max(0.02, jibY - hookY), 0.035, 0, C.teal);
          add(BOX, CX + dx * hd, hookY - 0.16, CZ + dz * hd, 0.26, 0.16, 0.26, 0, C.teal);
        }
      }
      for (i = 0; i < N; i++) {
        var st2 = 9 + i * 0.33;
        if (t <= st2) break;
        k = back(st2, st2 + 0.4, t);
        var d0 = 1 - out(st2, st2 + 0.4, t);
        var y = BASE + 0.2 + i * FH + d0 * 1.4;
        var w = FP * (0.86 + 0.14 * k);
        add(BOX, 0, y, 0, w - 0.16, FH - 0.07, w - 0.16, 0, C.teal);
        add(BOX, 0, y + FH - 0.07, 0, w, 0.07, w, 0, C.bldg);
        if (k < 0.97) continue;
        var bays = 6, dB = (FP - 0.16) / bays, face = FP / 2 - 0.08;
        for (j = 0; j < bays; j++) {
          var off = -face + (j + 0.5) * dB, h1 = hash(i, j), h2 = hash(i + 40, j);
          var ls1 = 14.1 + i * 0.19 + h1 * 0.35, ls2 = 14.1 + i * 0.19 + h2 * 0.35;
          var lk1 = h1 < 0.8 ? ss(ls1, ls1 + 0.22, t) : 0, lk2 = h2 < 0.8 ? ss(ls2, ls2 + 0.22, t) : 0;
          add(BOX, off, y + 0.06, face + 0.005, dB - 0.1, FH - 0.2, 0.03, 0, mix(C.teal3, C.lit, lk1), lk1 * 0.85);
          add(BOX, face + 0.005, y + 0.06, off, 0.03, FH - 0.2, dB - 0.1, 0, mix(C.teal3, C.lit, lk2), lk2 * 0.85);
        }
      }

      // 04 Lease: tenants arrive and park at the door
      var parked = [-2, -1.05, -0.1, 1.05], cCol = [C.teal, C.gold, C.bldg, C.teal3];
      parked.forEach(function (xp, n) {
        var s0 = 14.5 + n * 0.45, m = out(s0, s0 + 1.1, t);
        if (t <= s0) return;
        var x = HALF - 0.4 + (xp - HALF + 0.4) * m;
        add(BOX, x, 0.05, P / 2 - 0.4, 0.62, 0.2, 0.3, 0, cCol[n]);
        add(BOX, x - 0.03, 0.25, P / 2 - 0.4, 0.32, 0.13, 0.25, 0, n === 2 ? C.bldg2 : C.teal2);
      });

      // 05 Steward: the site is planted, the roof earns, and income flows out
      [[-2.1, 2.1], [-0.7, 2.25], [2.15, 0.2], [2.15, 1.5], [-2.15, -0.5], [2.1, 2.1], [0.7, 2.25], [-2.1, 0.9]].forEach(function (o, n) {
        var s = 17.5 + n * 0.14;
        tree(o[0], o[1], back(s, s + 0.55, t) * (sink > 0 ? 1 - ss(END, END + 0.3, t) : 1), 1.05, n % 2 ? C.leaf : C.leaf2, 0.42);
      });
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        var s5 = 18.6 + (i + j) * 0.12, pk = back(s5, s5 + 0.35, t);
        if (t <= s5) continue;
        add(BOX, -0.85 + i * 0.85, TOP + 0.02, -0.85 + j * 0.85, 0.7 * pk, 0.05, 0.7 * pk, 0, C.pv);
      }
      var flow = ss(19.3, 19.9, t) * (1 - ss(22.7, 23.15, t));
      if (flow > 0.01) {
        for (i = 0; i < 9; i++) {
          var q = frac((t - 19.3) * 0.17 + i / 9);
          var sz = 0.3 * flow * Math.min(1, q * 8, (1 - q) * 8);
          put(SPH, 2.1 - q * (HALF + 2), 0.14, P / 2 + 0.33, sz, sz, sz, 0, C.goldLit, 1);
          put(SPH, P / 2 + 0.33, 0.14, 2.1 - q * (HALF + 2), sz, sz, sz, 0, C.goldLit, 1);
        }
      }
    }

    // ---------- render ----------
    var LD = norm([0.28, 0.86, 0.58]);
    var lightVP = mul(ortho(16, 16, 1, 70), lookAt([LD[0] * 34, LD[1] * 34, LD[2] * 34], [0, 0, 0]));
    var W = 0, Hh = 0, pointer = 0, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw(t) {
      ALL.forEach(function (m) { m.n = m.base; });
      hero(t);
      ALL.forEach(function (m) { gl.bindBuffer(gl.ARRAY_BUFFER, m.ib); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.d, 0, m.n * INST); });

      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(depth);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, SHADOW, SHADOW);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 3);
      gl.uniformMatrix4fv(uni.dvp, false, lightVP);
      ALL.forEach(function (m) { gl.bindVertexArray(m.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, m.verts, m.n); });
      gl.disable(gl.POLYGON_OFFSET_FILL);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, Hh);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(main);
      var zoom = keys([[0, 1], [3.3, 1], [4.5, 1.16], [8.2, 1.16], [9.6, 1.04], [13.6, 1.04], [17.4, 1.02], [19.6, 1], [TOTAL, 1]], t);
      var cy = keys([[0, 0.7], [3.3, 0.7], [4.5, 1.3], [8.2, 1.1], [9.6, 2.1], [13.6, 2.1], [19.6, 1.3], [TOTAL, 0.7]], t);
      var az = Math.PI / 4 + Math.sin(t / TOTAL * Math.PI * 2) * 0.04 + pointer, el = 0.6;
      var dist = 40, eye = [Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist + cy, Math.cos(az) * Math.cos(el) * dist];
      var hh = 10.4 / zoom, aspect = W / Hh;
      var vp = mul(ortho(hh * aspect, hh, 1, 90), lookAt(eye, [0, cy, 0]));
      gl.uniformMatrix4fv(uni.vp, false, vp);
      gl.uniformMatrix4fv(uni.l, false, lightVP);
      gl.uniform3fv(uni.d, LD);
      gl.uniform1f(uni.t, 1.5 / SHADOW);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sTex); gl.uniform1i(uni.s, 0);
      ALL.forEach(function (m) { gl.bindVertexArray(m.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, m.verts, m.n); });
      gl.bindVertexArray(null);
    }

    // ---------- story UI ----------
    var ui = document.createElement('div');
    ui.className = 'hs-ui';
    var list = document.createElement('ol');
    list.className = 'hs-steps';
    var buttons = CH.map(function (c, i) {
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="hs-n">' + c.n + '</span><span class="hs-t">' + c.name + '</span>';
      b.addEventListener('click', function () { seek(reduced ? chapterEnd(i) : c.at); });
      li.appendChild(b); list.appendChild(li);
      return b;
    });
    var cap = document.createElement('p');
    cap.className = 'hs-cap';
    ui.appendChild(list); ui.appendChild(cap);

    function chapterEnd(i) { return i < CH.length - 1 ? CH[i + 1].at - 0.05 : FROZEN; }
    var active = -1;
    function syncUI(t) {
      var i = CH.length - 1;
      while (i > 0 && t < CH[i].at) i--;
      if (i !== active) {
        active = i;
        buttons.forEach(function (b, n) { if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
        cap.innerHTML = '<b>' + CH[i].name + '</b>' + CH[i].line;
      }
    }

    // ---------- loop ----------
    var t = reduced ? FROZEN : 0, last = 0, raf = 0, onscreen = true, dead = false, pAim = 0, painted = false;
    function resize() {
      var r = host.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(2, Math.round(r.width * dpr)); Hh = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== W || canvas.height !== Hh) { canvas.width = W; canvas.height = Hh; }
    }
    function frame() {
      syncUI(t); draw(t);
      if (!painted) { painted = true; host.classList.add('gl-on'); }
    }
    function tick(now) {
      raf = 0;
      if (dead || !onscreen || document.hidden) { last = 0; return; }
      var dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (!reduced) t = (t + dt) % TOTAL;
      var ry = parseFloat(host.style.getPropertyValue('--ry')) || 0;
      pAim = ry * 0.012;
      pointer += (pAim - pointer) * 0.06;
      frame();
      if (!reduced || Math.abs(pAim - pointer) > 0.001) raf = requestAnimationFrame(tick);
    }
    function wake() { if (!raf && !dead) raf = requestAnimationFrame(tick); }
    function seek(v) { t = v; if (reduced) frame(); wake(); }

    host.appendChild(canvas);
    host.appendChild(ui);
    resize();
    var ro = new ResizeObserver(function () { resize(); if (reduced) frame(); });
    ro.observe(host);
    var io = new IntersectionObserver(function (es) { onscreen = es[0].isIntersecting; wake(); });
    io.observe(host);
    document.addEventListener('visibilitychange', wake);
    function lost(e) { e.preventDefault(); stop(); }
    canvas.addEventListener('webglcontextlost', lost);
    frame();
    wake();

    function stop() {
      if (dead) return;
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', wake);
      canvas.removeEventListener('webglcontextlost', lost);
      host.classList.remove('gl-on');
      ui.remove(); canvas.remove();
      var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext();
    }
    return stop;
  };
})();
