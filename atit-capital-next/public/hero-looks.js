/* Five new looks for the same story: a city, a plot taken up, a building raised,
   leased and looked after. Same chapters and timing as the homepage hero; the
   rendering style, palette and camera differ per look. No dependencies.
   Every frame is a pure function of the timeline position t. */
(function () {
  'use strict';

  var CH = [
    { at: 0.0, n: '01', name: 'Source', line: 'We read parcels across the market. Most never pass.' },
    { at: 3.6, n: '02', name: 'Title', line: 'Title first. Every layer of ownership is read before anything else.' },
    { at: 8.2, n: '03', name: 'Build', line: 'The team that recommends the asset is the team that builds it.' },
    { at: 13.6, n: '04', name: 'Lease', line: 'Floor by floor, the asset starts to earn.' },
    { at: 17.4, n: '05', name: 'Steward', line: 'Capital moves. The asset stays, and so do we.' }
  ];
  var END = 23.2, TOTAL = 24.2, FROZEN = 22.8;

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
  function persp(fov, a, n, f) { var c = 1 / Math.tan(fov / 2); return [c / a, 0, 0, 0, 0, c, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[r + 4] * b[c * 4 + 1] + a[r + 8] * b[c * 4 + 2] + a[r + 12] * b[c * 4 + 3];
    return o;
  }

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
    'layout(location=0) in vec3 p;layout(location=1) in vec3 n;layout(location=2) in vec3 iP;layout(location=3) in vec3 iS;layout(location=4) in float iR;layout(location=5) in vec3 iC;layout(location=6) in float iG;layout(location=7) in float iW;layout(location=8) in float iK;' +
    'uniform mat4 uVP;uniform mat4 uL;out vec3 vN;out vec3 vNL;out vec3 vPL;out vec3 vSc;out vec3 vW;out vec3 vC;out vec4 vLP;out float vG;out float vM;out float vK;' +
    'void main(){float c=cos(iR),s=sin(iR);vec3 q=p*iS;vec3 w=vec3(c*q.x+s*q.z,q.y,-s*q.x+c*q.z)+iP;' +
    'vN=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);vNL=n;vPL=p;vSc=iS;vW=w;vC=iC;vG=iG;vM=iW;vK=iK;vLP=uL*vec4(w,1.);gl_Position=uVP*vec4(w,1.);}';
  var FS = '#version 300 es\nprecision highp float;precision highp sampler2DShadow;' +
    'in vec3 vN;in vec3 vNL;in vec3 vPL;in vec3 vSc;in vec3 vW;in vec3 vC;in vec4 vLP;in float vG;in float vM;in float vK;' +
    'uniform sampler2DShadow uS;uniform vec3 uD,uSun,uSky,uGnd,uOff,uHoff,uLit,uFog,uInkC,uEye,uFwd;uniform float uT,uA,uB,uInk,uBox,uShadow,uFlat,uDim;out vec4 o;' +
    'float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'void main(){vec3 n=normalize(vN);float s=1.;' +
    'if(uShadow>.5){vec3 q=vLP.xyz/vLP.w*.5+.5;s=0.;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)s+=texture(uS,vec3(q.xy+vec2(float(i),float(j))*uT,q.z-.0011));s/=9.;}' +
    'float d=max(dot(n,uD),0.);vec3 lg=mix(uGnd,uSky,.5+.5*n.y)+uSun*d*s;' +
    'vec3 c=vC*lg;if(uFlat>.5)c=vC*(n.z>.5?1.:n.y>.5?1.04:.9);' +
    'if(uInk>.5){float sh=n.y>.5?1.-s:1.-smoothstep(.1,.45,d*s);c=vC*mix(1.,.94,sh);' +
    'float hs=sin((gl_FragCoord.x-gl_FragCoord.y)*1.05);c=mix(c,uInkC,smoothstep(.2,.8,hs)*.32*sh);}' +
    'c=mix(c,vC,vG);' +
    'if(vM>-.5&&abs(vNL.y)<.5){float u=abs(vNL.x)>.5?vPL.z*vSc.z:vPL.x*vSc.x;float v=vPL.y*vSc.y;' +
    'vec2 g=vec2(u/.5,v/.56);vec2 id=floor(g);vec2 f=fract(g);vec2 w=max(fwidth(g),vec2(.001));' +
    'float m=smoothstep(.2-w.x,.2+w.x,f.x)*(1.-smoothstep(.8-w.x,.8+w.x,f.x))*smoothstep(.25-w.y,.25+w.y,f.y)*(1.-smoothstep(.8-w.y,.8+w.y,f.y));' +
    'float kk=abs(vK);float lit=vM>0.?step(h21(id+vec2(kk*1.37,kk*2.11)),vM):0.;vec3 wo=vK<0.?uHoff:uOff;c=mix(c,lit>.5?uLit*(vK<0.?1.:uDim):(uFlat>.5||uInk>.5?wo:wo*lg),m);}' +
    'if(uInk>.5){float l=0.;if(uBox>.5){vec3 a=abs(vNL);vec3 e=vec3((.5-abs(vPL.x))*vSc.x,min(vPL.y,1.-vPL.y)*vSc.y,(.5-abs(vPL.z))*vSc.z);' +
    'float dd=a.x>.5?min(e.y,e.z):a.y>.5?min(e.x,e.z):min(e.x,e.y);dd+=.005*sin(vW.x*5.+vW.z*4.+vW.y*6.);float aa=max(fwidth(dd),.0001);l=1.-smoothstep(.45*aa,1.3*aa,dd);if(a.y<.5&&vSc.y<.15)l=0.;}' +
    'else{float f=dot(n,-uFwd);l=1.-smoothstep(.22,.36,f);}c=mix(c,uInkC,l*.9);}' +
    'if(uB>uA&&vG<.99){float z=dot(vW-uEye,uFwd);c=mix(c,uFog,clamp((z-uA)/(uB-uA),0.,1.));}' +
    'o=vec4(min(c,vec3(1.)),1.);}';
  var DS = '#version 300 es\nprecision mediump float;void main(){}';

  var INST = 13, SHADOW = 2048, P = 6.4, PAD = 5, ROAD = 1.4;
  var AZ = Math.PI / 4;

  function isoCam(az0) {
    return function (t, aspect) {
      var zoom = keys([[0, 1], [3.3, 1], [4.5, 1.16], [8.2, 1.16], [9.6, 1.04], [13.6, 1.04], [17.4, 1.02], [19.6, 1], [TOTAL, 1]], t);
      var cy = keys([[0, 0.7], [3.3, 0.7], [4.5, 1.3], [8.2, 1.1], [9.6, 2.1], [13.6, 2.1], [19.6, 1.3], [TOTAL, 0.7]], t);
      var az = az0 + Math.sin(t / TOTAL * Math.PI * 2) * 0.04, el = 0.6, dist = 44;
      var eye = [Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist + cy, Math.cos(az) * Math.cos(el) * dist];
      var hh = 10.4 / zoom;
      return { eye: eye, at: [0, cy, 0], proj: ortho(hh * aspect, hh, 1, 120) };
    };
  }
  function tiers(low, mid, high) {
    return function (f, d, r) { return f > 0.4 ? low[0] + r * low[1] : f > -0.4 ? mid[0] + r * mid[1] : high[0] + r * high[1] + (d - 1) * high[2]; };
  }

  // The homepage hero's palette, shared by every look.
  var THEME = {
    ground: '#E6EEEF', parcel: '#FFFFFF', road: '#CBD8DB', lane: '#FFFFFF', bld: ['#FBFDFD', '#E4ECEE'], body: '#13353E', slab: '#FBFDFD',
    off: '#9DB8BD', hoff: '#2E5F6B', lit: '#F6D48B', gold: '#A9843F', goldLit: '#D9B15F', teal: '#13353E', teal2: '#254750', white: '#FFFFFF', crane: '#A9843F',
    leaf: '#A9C5B8', leaf2: '#8FB3A2', trunk: '#8A7350', pv: '#1D4B57', warm: '#F4EAD3', car: ['#13353E', '#A9843F', '#FBFDFD', '#2E5F6B'], s: ['#9C855F', '#B39C78', '#CCBEA3', '#E8E1D3']
  };
  function theme(o) { var r = {}, k; for (k in THEME) r[k] = THEME[k]; for (k in (o || {})) r[k] = o[k]; return r; }

  var LOOKS = {
    night: {
      R: 4, front: [1, 1], cam: isoCam(AZ), shadow: true, sh: 24, cars: 4, parks: 0.1, lane: true,
      h: tiers([0.9, 0.8], [1.8, 2.4], [3.2, 2.2, 0.5]), win: function () { return 0; },
      sky: [0.8, 0.825, 0.835], gnd: [0.61, 0.68, 0.71], sun: [0.25, 0.2425, 0.2325], ld: [0.28, 0.86, 0.58],
      pal: theme()
    },
    golden: {
      R: 4, front: [0.58, 0.81], shadow: true, sh: 30, cars: 3, parks: 0.08, lane: true,
      ld: [-0.72, 0.42, 0.42], sky: [0.8, 0.825, 0.835], gnd: [0.61, 0.68, 0.71], sun: [0.25, 0.2425, 0.2325], fog: '#FFFFFF', fa: 56, fb: 96,
      h: tiers([0.8, 0.6], [2.2, 2.6], [4, 3, 0.9]), win: function () { return 0; },
      cam: function (t, aspect) {
        var ey = keys([[0, 29], [3.3, 29], [4.5, 23], [8.2, 23], [10.6, 10], [22.4, 10], [TOTAL, 29]], t);
        var ay = keys([[0, 0.4], [4.5, 1.2], [8.2, 1.4], [10.6, 4.6], [22.4, 4.6], [TOTAL, 0.4]], t);
        var az = 0.62 + Math.sin(t / TOTAL * Math.PI * 2) * 0.1, dist = 56;
        return { eye: [Math.sin(az) * dist, ey, Math.cos(az) * dist], at: [0, ay, 0], proj: persp(0.3, aspect, 1, 190) };
      },
      pal: theme()
    },
    model: {
      R: 2, front: [1, 1], shadow: true, sh: 21, cars: 0, parks: 0.1, lane: false, noRoads: true, plinth: true,
      keep: function (i, j) { return i * i + j * j <= 5; },
      ld: [0.42, 0.78, 0.46], sky: [0.8, 0.825, 0.835], gnd: [0.61, 0.68, 0.71], sun: [0.25, 0.2425, 0.2325],
      h: tiers([0.7, 0.7], [1.4, 1.5], [2.4, 2, 0.4]), win: function () { return -1; },
      cam: function (t, aspect) {
        var el = keys([[0, 0.78], [3.3, 0.78], [4.5, 0.62], [8.2, 0.62], [10.6, 0.46], [22.4, 0.46], [TOTAL, 0.78]], t);
        var ay = keys([[0, 0], [8.2, 0.6], [10.6, 2.4], [22.4, 2.4], [TOTAL, 0]], t);
        var az = AZ + Math.sin(t / TOTAL * Math.PI * 2) * 0.42, dist = 74;
        return { eye: [Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist + ay, Math.cos(az) * Math.cos(el) * dist], at: [0, ay, 0], proj: persp(0.3, aspect, 1, 170) };
      },
      pal: theme({ wood: '#13353E' })
    },
    ink: {
      R: 3, front: [-1, 1], cam: isoCam(-AZ), shadow: true, sh: 24, ink: true, cars: 2, parks: 0.1, lane: false, crane: [-2.1, -2.1],
      ld: [-0.42, 0.8, 0.42], sky: [1, 1, 1], gnd: [1, 1, 1], sun: [0, 0, 0],
      h: tiers([0.9, 0.8], [1.8, 2.2], [3, 2, 0.4]), win: function () { return 0; },
      pal: theme({ ground: '#F3F7F7', road: '#E6EEEF', bld: ['#FFFFFF', '#F7FAFA'], body: '#2E5F6B', slab: '#2E5F6B', off: '#E6EEEF', hoff: '#9DB8BD', ink: '#13353E' })
    },
    skyline: {
      R: 3, flat: true, shadow: false, stagger: 2.3, cars: 3, parks: 0, lane: false, noRoads: true, earth: true, sunDisc: true, crane: [2.6, -1.6],
      cand: [[-2, 0], [2, 0]], fog: '#FFFFFF', fa: 42, fb: 76, lanes: [['x', P / 2 + 0.3]],
      keep: function (i, j) { return j <= 0 && j >= -3; },
      h: function (f, d, r, i, j) { var v = j === 0 ? 1.8 + r * 2.6 : j === -1 ? 2.8 + r * 2.6 : j === -2 ? 3.6 + r * 3.8 : 4.6 + r * 4.4; return i === 0 || (i === 1 && j < 0) ? v * 0.55 : v; },
      win: function (r, i, j) { return j >= -1 ? 0 : -1; },
      ld: [0, 1, 0], sky: [1, 1, 1], gnd: [1, 1, 1], sun: [0, 0, 0],
      cam: function (t, aspect) {
        var zoom = keys([[0, 1], [3.3, 1], [4.5, 1.14], [8.2, 1.14], [9.6, 1], [TOTAL, 1]], t);
        var cy = keys([[0, 4.8], [3.3, 4.8], [4.5, 3.6], [8.2, 3.6], [9.6, 4.8], [TOTAL, 4.8]], t), hh = 9.4 / zoom;
        return { eye: [0, cy, 42], at: [0, cy, 0], proj: ortho(hh * aspect, hh, 1, 130) };
      },
      pal: theme({ ground: '#E6EEEF', bld: ['#DDE7E9', '#CBD8DB', '#E8EFF0'], slab: '#FBFDFD', e: ['#9FB4B9', '#B2C3C7', '#C5D2D5', '#D8E2E4'] })
    }
  };

  window.ATHeroLook = function (host, name) {
    var L = LOOKS[name];
    var canvas = document.createElement('canvas');
    canvas.className = 'hs-gl';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'A plot of land in a city is chosen, its title verified, a building rises on it, its floors lease up, and the finished asset is looked after.');
    var gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl || !L) return function () {};

    function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; }
    function program(v, f) {
      var pr = gl.createProgram();
      gl.attachShader(pr, shader(gl.VERTEX_SHADER, v)); gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, f)); gl.linkProgram(pr);
      return gl.getProgramParameter(pr, gl.LINK_STATUS) ? pr : null;
    }
    var main = program(VS, FS), depth = program(VS, DS);
    if (!main || !depth) return function () {};
    function U(n) { return gl.getUniformLocation(main, n); }
    var uni = { vp: U('uVP'), l: U('uL'), s: U('uS'), eye: U('uEye'), fwd: U('uFwd'), box: U('uBox'), dvp: gl.getUniformLocation(depth, 'uVP') };

    function mesh(data, max) {
      var vao = gl.createVertexArray(), vb = gl.createBuffer(), ib = gl.createBuffer(), arr = new Float32Array(data);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
      var d = new Float32Array(max * INST);
      gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferData(gl.ARRAY_BUFFER, d.byteLength, gl.DYNAMIC_DRAW);
      [[2, 3, 0], [3, 3, 12], [4, 1, 24], [5, 3, 28], [6, 1, 40], [7, 1, 44], [8, 1, 48]].forEach(function (a) {
        gl.enableVertexAttribArray(a[0]); gl.vertexAttribPointer(a[0], a[1], gl.FLOAT, false, INST * 4, a[2]); gl.vertexAttribDivisor(a[0], 1);
      });
      gl.bindVertexArray(null);
      return { vao: vao, ib: ib, verts: arr.length / 6, d: d, n: 0, max: max, base: 0, up: false };
    }
    var BOX = mesh(boxGeo(), 4000), CYL = mesh(cylGeo(10), 400), SPH = mesh(sphGeo(8, 12), 500), DISC = mesh(cylGeo(72), 4), BALL = mesh(sphGeo(28, 56), 2), ALL = [BOX, CYL, SPH, DISC, BALL];

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

    var C = {};
    Object.keys(L.pal).forEach(function (k) { var v = L.pal[k]; C[k] = Array.isArray(v) ? v.map(rgb) : rgb(v); });

    function put(m, x, y, z, sx, sy, sz, r, c, g, w, k) {
      if (m.n >= m.max) return;
      var d = m.d, i = m.n++ * INST;
      d[i] = x; d[i + 1] = y; d[i + 2] = z; d[i + 3] = sx; d[i + 4] = sy; d[i + 5] = sz; d[i + 6] = r || 0; d[i + 7] = c[0]; d[i + 8] = c[1]; d[i + 9] = c[2]; d[i + 10] = g || 0; d[i + 11] = w === undefined ? -1 : w; d[i + 12] = k || 0;
    }
    function tree(x, z, k, s, c, y) {
      if (k <= 0.01) return;
      y = y || 0;
      put(CYL, x, y + 0.05, z, 0.09, 0.55 * k * s, 0.09, 0, C.trunk);
      put(SPH, x, y + 0.42 * k * s, z, 0.82 * k * s, 0.95 * k * s, 0.82 * k * s, 0, c || C.leaf);
    }

    var CAND = (L.cand || [[-1, 1], [1, -1]]).map(function (c, i) { return { x: c[0] * P, z: c[1] * P, on: i ? 1.35 : 0.2, off: i ? 2.45 : 1.3, i: c[0], j: c[1] }; });
    CAND.push({ x: 0, z: 0, on: 2.5, off: 99, i: 0, j: 0 });
    function isLot(i, j) { return CAND.some(function (c) { return c.i === i && c.j === j; }); }
    var EXT = (L.R + 0.7) * P;
    var LANES = L.lanes || [['x', -P / 2 + 0.32], ['z', -P / 2 - 0.32], ['x', P / 2 + 0.32], ['z', P / 2 - 0.32], ['x', -1.5 * P + 0.32], ['z', 1.5 * P - 0.32]];

    (function city() {
      var R = L.R, i, j;
      if (L.plinth) {
        put(DISC, 0, -2.4, 0, 35, 2.36, 35, 0, C.wood);
        put(DISC, 0, -0.05, 0, 33.6, 0.05, 33.6, 0, C.ground);
      } else if (L.earth) {
        put(BOX, 0, -0.04, -10.4, EXT * 2.4, 0.08, 30, 0, C.ground);
        (C.e || C.s).forEach(function (c, n) { put(BOX, 0, -0.04 - (4 - n) * 2, -10.4, EXT * 2.4, 2, 30, 0, c); });
      } else {
        put(BOX, 0, -0.55, 0, EXT * 2, 0.55, EXT * 2, 0, C.ground);
      }
      if (!L.noRoads) {
        for (i = -R - 1; i <= R; i++) {
          var c = (i + 0.5) * P;
          put(BOX, c, 0, 0, ROAD, 0.025, EXT * 2, 0, C.road);
          put(BOX, 0, 0, c, EXT * 2, 0.025, ROAD, 0, C.road);
        }
        if (L.lane) [-P / 2, P / 2].forEach(function (c) {
          for (var q = -24; q <= 24; q++) {
            var u = q * 1.05;
            if (Math.abs(frac(u / P + 0.5) - 0.5) * P < ROAD / 2 + 0.25) continue;
            put(BOX, c, 0.026, u, 0.06, 0.006, 0.5, 0, C.lane);
            put(BOX, u, 0.026, c, 0.5, 0.006, 0.06, 0, C.lane);
          }
        });
      }
      function b(cx, cz, x, z, w, d, h, r, n, i, j) {
        put(BOX, cx + x, 0.07, cz + z, w, h, d, 0, C.bld[Math.floor(hash(n + 3, i * 7 + j) * C.bld.length)], 0, L.win(r, i, j), hash(i + n, j + 17) * 90);
      }
      for (i = -R; i <= R; i++) for (j = -R; j <= R; j++) {
        if ((L.keep && !L.keep(i, j)) || isLot(i, j)) continue;
        var cx = i * P + j * (L.stagger || 0), cz = j * P, r = hash(i + 13, j + 7);
        put(BOX, cx, 0, cz, PAD, 0.07, PAD, 0, C.parcel);
        if (r < L.parks && !(L.earth)) {
          put(BOX, cx, 0.07, cz, 3.8, 0.05, 3.8, 0, C.leaf2);
          [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4], [0, 0.2]].forEach(function (o, k) { tree(cx + o[0], cz + o[1], 1, k % 2 ? 1.4 : 1.1, k % 2 ? C.leaf2 : C.leaf, 0.12); });
          continue;
        }
        var fr = L.front || [0, 0], dd = Math.max(1, Math.hypot(i, j)), f = (i * fr[0] + j * fr[1]) / dd / Math.max(1, Math.hypot(fr[0], fr[1]));
        var ty = hash(i, j + 31), a = hash(i + 5, j), e = hash(i, j + 9), hh = function (rr) { return L.h(f, dd, rr, i, j); };
        if (ty < 0.4) b(cx, cz, 0, 0, 3.5, 3.5, hh(a), a, 1, i, j);
        else if (ty < 0.75) { b(cx, cz, -1.1, 0, 2, 3.7, hh(a), a, 2, i, j); b(cx, cz, 1.15, 0.2, 1.9, 3.2, hh(e * 0.8), e, 3, i, j); }
        else { b(cx, cz, -1.1, -1.1, 1.9, 1.9, hh(a), a, 4, i, j); b(cx, cz, 1.1, -1.1, 1.9, 1.9, hh(e), e, 5, i, j); b(cx, cz, -1.1, 1.1, 1.9, 1.9, hh(e * a), e, 6, i, j); b(cx, cz, 1.1, 1.1, 1.9, 1.9, hh(a * 0.7), a, 7, i, j); }
        if (hash(i + 2, j + 2) < 0.5) tree(cx + 2.25, cz + 2.25, 1, 1.05, C.leaf, 0.07);
      }
      ALL.forEach(function (m) { m.base = m.n; });
    })();

    function outline(x, y, z, s, w, h, col, g) {
      put(BOX, x, y, z + s / 2, s + w, h, w, 0, col, g);
      put(BOX, x, y, z - s / 2, s + w, h, w, 0, col, g);
      put(BOX, x + s / 2, y, z, w, h, s + w, 0, col, g);
      put(BOX, x - s / 2, y, z, w, h, s + w, 0, col, g);
    }

    var cranePos = L.crane || [2.1, -2.1];
    function hero(t) {
      var sink = 14 * ss(END, TOTAL, t);
      function add(m, x, y, z, sx, sy, sz, r, c, g, w, k) { put(m, x, y - sink, z, sx, sy, sz, r, c, g, w, k); }
      var i, j, k, E = EXT;

      if (L.sunDisc) {
        var sy = keys([[0, 1.4], [13.6, 5.2], [22.8, 5.6], [TOTAL, 1.4]], t);
        put(BALL, -8 + t * 0.5, sy, -34, 7, 7, 7, 0, C.goldLit, 1);
      }
      if (L.cars) LANES.forEach(function (l, n) {
        for (var c = 0; c < L.cars; c++) {
          var u = frac(t / TOTAL * (2 + c) * (n % 2 ? -1 : 1) + c * 0.37 + n * 0.21) * E * 2 - E;
          var col = C.car[(c + n) % C.car.length], g = L.carGlow ? 1 : 0;
          if (l[0] === 'x') put(BOX, u, 0.05, l[1], L.carGlow ? 0.44 : 0.56, 0.16, 0.22, 0, col, g);
          else put(BOX, l[1], 0.05, u, 0.22, 0.16, L.carGlow ? 0.44 : 0.56, 0, col, g);
        }
      });

      // 01 Source: vacant plots are read; two are passed over
      CAND.forEach(function (c, idx) {
        var isHero = idx === CAND.length - 1;
        var a = out(c.on, c.on + 0.35, t), b = isHero ? 0 : ss(c.off - 0.25, c.off, t), glow = a * (1 - b);
        put(BOX, c.x, 0, c.z, PAD, 0.07, PAD, 0, mix(C.parcel, C.warm, glow * 0.85));
        if (glow > 0.01) outline(c.x, 0.07, c.z, PAD, 0.09 * glow, 0.03, C.gold, L.carGlow ? 1 : 0);
        var pinOut = isHero ? ss(3.7, 4.0, t) : b, drop = back(c.on, c.on + 0.5, t);
        if (t > c.on && pinOut < 1) {
          var ph = 2.6 * (1 - pinOut), y0 = 0.07 + (1 - drop) * 4;
          add(CYL, c.x, y0, c.z, 0.07, ph, 0.07, 0, C.gold);
          add(SPH, c.x, y0 + ph - 0.18, c.z, 0.56 * (1 - pinOut), 0.56 * (1 - pinOut), 0.56 * (1 - pinOut), 0, C.teal);
        }
      });

      // 02 Title: the land lifts in layers, each is read, then it settles and is staked
      var lift = out(3.8, 4.7, t) * (1 - ss(6.1, 6.8, t));
      if (t > 3.8) {
        var grown = out(3.8, 4.1, t);
        for (i = 0; i < 4; i++) {
          var sliceY = 0.07 + i * 0.09 + lift * i * 0.95;
          var read = ss(4.9 + (3 - i) * 0.3, 5.15 + (3 - i) * 0.3, t);
          var slabCol = i === 3 ? mix(C.s[3], C.warm, ss(6.3, 6.9, t)) : C.s[i];
          add(BOX, 0, sliceY, 0, 4.7, 0.09 * grown + lift * 0.26, 4.7, 0, mix(slabCol, C.goldLit, read * (1 - ss(6.1, 6.6, t)) * 0.55));
        }
        var scan = p01(4.75, 6.05, t);
        if (scan > 0 && scan < 1) {
          var fade = ss(0, 0.06, scan) * (1 - ss(0.94, 1, scan));
          outline(0, 0.1 + (1 - scan) * 3.5, 0, 5.05, 0.11 * fade, 0.05, C.gold, 0.9);
        }
      }
      if (t > 6.7) {
        var e = 2.42, stakes = [[-e, -e], [e, -e], [e, e], [-e, e], [0, -e], [e, 0], [0, e], [-e, 0]];
        stakes.forEach(function (s, n) {
          var st = 6.7 + n * 0.09, kk = back(st, st + 0.35, t);
          if (t <= st) return;
          add(CYL, s[0], 0.4 + (1 - kk) * 2, s[1], 0.06, 0.95, 0.06, 0, C.gold);
          add(SPH, s[0], 1.24 + (1 - kk) * 2, s[1], 0.27, 0.27, 0.27, 0, C.white);
        });
        var perim = 56;
        for (i = 0; i < perim; i += 2) {
          if (t <= 6.85 + (i / perim) * 0.75) continue;
          var s4 = i / perim * 4, side = Math.floor(s4), a2 = -e + (s4 - side) * 2 * e, px, pz, horiz;
          if (side === 0) { px = a2; pz = e; horiz = 1; } else if (side === 1) { px = e; pz = -a2; horiz = 0; } else if (side === 2) { px = -a2; pz = -e; horiz = 1; } else { px = -e; pz = a2; horiz = 0; }
          add(BOX, px, 0.42, pz, horiz ? 0.2 : 0.07, 0.03, horiz ? 0.07 : 0.2, 0, C.gold, 0.6);
        }
        var fl = back(7.5, 7.95, t);
        if (t > 7.5) {
          add(CYL, -1.9, 0.4, -1.9, 0.06, 1.7 * fl, 0.06, 0, C.teal);
          add(BOX, -1.9 + 0.33, 0.4 + 1.33 * fl, -1.9, 0.62 * fl, 0.36 * fl, 0.03, 0, C.gold);
        }
      }

      // 03 Build: foundation, crane, floors
      var FP = 3, FH = 0.56, N = 12, BASE = 0.42, H = N * FH, TOP = BASE + 0.22 + H;
      if (t > 8.3) add(BOX, 0, 0.41, 0, FP + 1.1, 0.2 * out(8.3, 8.8, t), FP + 1.1, 0, C.slab);
      var cu = out(8.5, 9.1, t) * (1 - ss(13.3, 13.9, t));
      if (cu > 0.01) {
        var CX = cranePos[0], CZ = cranePos[1], CH_ = 9.4 * cu, slew = Math.sin(t * 1.15) * 0.22;
        var ang = Math.atan2(CZ, -CX) + slew, dx = Math.cos(ang), dz = -Math.sin(ang);
        add(BOX, CX, 0.42, CZ, 0.32, CH_, 0.32, 0, C.crane);
        add(BOX, CX, 0.42 + CH_, CZ, 0.42, 0.42, 0.42, 0, C.teal);
        var LJ = 6.2 * cu, jibY = 0.42 + CH_ + 0.14;
        add(BOX, CX + dx * (LJ / 2 - 1.5), jibY, CZ + dz * (LJ / 2 - 1.5), LJ, 0.15, 0.14, ang, C.crane);
        add(BOX, CX - dx * 1.2, jibY - 0.14, CZ - dz * 1.2, 0.5, 0.42, 0.5, ang, C.teal);
        if (L.beacon) { var bk = frac(t * 0.8) < 0.5 ? 1 : 0.25; add(SPH, CX, jibY + 0.32, CZ, 0.26, 0.26, 0.26, 0, mix([0.3, 0.05, 0.05], [1, 0.28, 0.2], bk), 1); }
        var fi = clamp(Math.floor((t - 9) / 0.33), 0, N - 1), fPhase = frac((t - 9) / 0.33);
        var topNow = BASE + 0.22 + (fi + 1) * FH, hookY = topNow + 0.3 + (1 - out(0, 0.75, fPhase)) * 1.8, hd = Math.hypot(CX, CZ) * 0.64 + Math.sin(t * 2.3) * 0.25;
        if (t > 8.95) {
          add(BOX, CX + dx * hd, hookY, CZ + dz * hd, 0.035, Math.max(0.02, jibY - hookY), 0.035, 0, C.teal);
          add(BOX, CX + dx * hd, hookY - 0.16, CZ + dz * hd, 0.26, 0.16, 0.26, 0, C.teal);
        }
      }
      for (i = 0; i < N; i++) {
        var st2 = 9 + i * 0.33;
        if (t <= st2) break;
        k = back(st2, st2 + 0.4, t);
        var d0 = 1 - out(st2, st2 + 0.4, t), y = BASE + 0.2 + i * FH + d0 * 1.4, w = FP * (0.86 + 0.14 * k);
        // 04 Lease: windows on each floor switch on from the ground up
        var fs = 14.1 + i * 0.19, lease = ss(fs, fs + 0.7, t) * 0.86;
        if (L.noWin) {
          add(BOX, 0, y, 0, w - 0.16, FH - 0.07, w - 0.16, 0, mix(C.body, C.lit, lease), 0);
          add(BOX, 0, y + FH - 0.07, 0, w, 0.07, w, 0, C.slab);
        } else if (L.ink) {
          add(BOX, 0, y, 0, w - 0.16, FH, w - 0.16, 0, C.body, 0, k < 0.97 ? 0 : lease, -(i * 3.7 + 1));
        } else {
          add(BOX, 0, y, 0, w - 0.16, FH - 0.07, w - 0.16, 0, C.body, 0, k < 0.97 ? 0 : lease, -(i * 3.7 + 1));
          add(BOX, 0, y + FH - 0.07, 0, w, 0.07, w, 0, C.slab);
        }
      }

      // tenants arrive and park at the door
      [-2, -1.05, -0.1, 1.05].forEach(function (xp, n) {
        var s0 = 14.5 + n * 0.45, m = out(s0, s0 + 1.1, t);
        if (t <= s0) return;
        var x = 10 + (xp - 10) * m, col = C.car[n % C.car.length], g = L.carGlow ? 1 : 0;
        add(BOX, x, 0.05, P / 2 - 0.4, 0.62, 0.2, 0.3, 0, col, g);
        if (!L.carGlow) add(BOX, x - 0.03, 0.25, P / 2 - 0.4, 0.32, 0.13, 0.25, 0, C.teal2);
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
      if (L.beacon && t > 13.9) add(SPH, 0, TOP + 0.1, 0, 0.3, 0.3, 0.3, 0, C.goldLit, 1);
      var flow = ss(19.3, 19.9, t) * (1 - ss(22.7, 23.15, t));
      if (flow > 0.01) {
        for (i = 0; i < 9; i++) {
          var q = frac((t - 19.3) * 0.17 + i / 9), sz = 0.3 * flow * Math.min(1, q * 8, (1 - q) * 8);
          put(SPH, 2.1 - q * 12, 0.14, P / 2 + 0.33, sz, sz, sz, 0, C.goldLit, 1);
          put(SPH, P / 2 + 0.33, 0.14, 2.1 - q * 12, sz, sz, sz, 0, C.goldLit, 1);
        }
      }
    }

    // ---------- render ----------
    var LD = norm(L.ld), shSize = L.sh || 22;
    var lightVP = mul(ortho(shSize, shSize, 1, 110), lookAt([LD[0] * 50, LD[1] * 50, LD[2] * 50], [0, 0, 0]));
    var W = 0, Hh = 0, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cam = L.cam;
    var fogC = L.fog ? rgb(L.fog) : [0, 0, 0];

    gl.useProgram(main);
    gl.uniform3fv(U('uD'), LD); gl.uniform3fv(U('uSun'), L.sun); gl.uniform3fv(U('uSky'), L.sky); gl.uniform3fv(U('uGnd'), L.gnd);
    gl.uniform3fv(U('uOff'), C.off); gl.uniform3fv(U('uHoff'), C.hoff || C.off); gl.uniform3fv(U('uLit'), C.lit); gl.uniform3fv(U('uFog'), fogC); gl.uniform3fv(U('uInkC'), C.ink || [0, 0, 0]);
    gl.uniform1f(U('uT'), (L.sh === 21 ? 2.4 : 1.5) / SHADOW); gl.uniform1f(U('uA'), L.fa || 0); gl.uniform1f(U('uB'), L.fb || 0);
    gl.uniform1f(U('uDim'), L.dim || 1); gl.uniform1f(U('uInk'), L.ink ? 1 : 0); gl.uniform1f(U('uShadow'), L.shadow ? 1 : 0); gl.uniform1f(U('uFlat'), L.flat ? 1 : 0);

    function draw(t) {
      ALL.forEach(function (m) { m.n = m.base; });
      hero(t);
      ALL.forEach(function (m) {
        gl.bindBuffer(gl.ARRAY_BUFFER, m.ib);
        if (!m.up) { gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.d, 0, m.n * INST); m.up = true; }
        else if (m.n > m.base) gl.bufferSubData(gl.ARRAY_BUFFER, m.base * INST * 4, m.d, m.base * INST, (m.n - m.base) * INST);
      });

      gl.enable(gl.DEPTH_TEST);
      if (L.shadow) {
        gl.useProgram(depth);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, SHADOW, SHADOW);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 3);
        gl.uniformMatrix4fv(uni.dvp, false, lightVP);
        ALL.forEach(function (m) { gl.bindVertexArray(m.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, m.verts, m.n); });
        gl.disable(gl.POLYGON_OFFSET_FILL);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, Hh);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(main);
      var v = cam(t, W / Hh);
      gl.uniformMatrix4fv(uni.vp, false, mul(v.proj, lookAt(v.eye, v.at)));
      gl.uniformMatrix4fv(uni.l, false, lightVP);
      gl.uniform3fv(uni.eye, v.eye);
      gl.uniform3fv(uni.fwd, norm([v.at[0] - v.eye[0], v.at[1] - v.eye[1], v.at[2] - v.eye[2]]));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sTex); gl.uniform1i(uni.s, 0);
      ALL.forEach(function (m) { if (!m.n) return; gl.uniform1f(uni.box, m === BOX ? 1 : 0); gl.bindVertexArray(m.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, m.verts, m.n); });
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
    var t = reduced ? FROZEN : 0, last = 0, raf = 0, onscreen = true, dead = false, painted = false;
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
      frame();
      if (!reduced) raf = requestAnimationFrame(tick);
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
    frame();
    wake();
  };
})();
