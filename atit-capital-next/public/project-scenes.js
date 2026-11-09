/* The seven projects as live WebGL scenes, for the client to choose a style.
   Same approach as the homepage hero: no dependencies, and every frame is a pure
   function of the timeline position t. Each project tells its own story; the
   style (model, ink, dusk) sets the palette, light, ground and camera.

   ATProjectScene(host, project, style, at)
     host     element to fill; data-label becomes the canvas description
     project  theatre | reno | portfolio | residence | litigated | land | hotel
     style    model | ink | dusk
     at       optional fixed timeline position (no animation)

   Returns a function that stops the scene and frees its WebGL context, or false
   if WebGL2 is unavailable. Browsers allow about 16 live contexts per page, so a
   page with more scenes should stop the ones that have scrolled away. */
(function () {
  'use strict';

  var TOTAL = 16, END = 14.5, FROZEN = 14;

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
  // Half cylinder lying along z: x in [-.5,.5], y in [0,1], z in [-.5,.5].
  function vaultGeo(n) {
    var v = [];
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI, b = (i + 1) / n * Math.PI;
      var ax = Math.cos(a), ay = Math.sin(a), bx = Math.cos(b), by = Math.sin(b);
      v.push(ax / 2, ay, 0.5, ax, ay, 0, bx / 2, by, 0.5, bx, by, 0, bx / 2, by, -0.5, bx, by, 0);
      v.push(ax / 2, ay, 0.5, ax, ay, 0, bx / 2, by, -0.5, bx, by, 0, ax / 2, ay, -0.5, ax, ay, 0);
      v.push(0, 0, 0.5, 0, 0, 1, ax / 2, ay, 0.5, 0, 0, 1, bx / 2, by, 0.5, 0, 0, 1);
      v.push(0, 0, -0.5, 0, 0, -1, bx / 2, by, -0.5, 0, 0, -1, ax / 2, ay, -0.5, 0, 0, -1);
    }
    return v;
  }

  var VS = '#version 300 es\n' +
    'layout(location=0) in vec3 p;layout(location=1) in vec3 n;layout(location=2) in vec3 iP;layout(location=3) in vec3 iS;layout(location=4) in float iR;layout(location=5) in vec3 iC;layout(location=6) in float iG;layout(location=7) in float iW;layout(location=8) in float iK;' +
    'uniform mat4 uVP;uniform mat4 uL;out vec3 vN;out vec3 vNL;out vec3 vPL;out vec3 vSc;out vec3 vW;out vec3 vC;out vec4 vLP;out float vG;out float vM;out float vK;' +
    'void main(){float c=cos(iR),s=sin(iR);vec3 q=p*iS;vec3 w=vec3(c*q.x+s*q.z,q.y,-s*q.x+c*q.z)+iP;' +
    'vN=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);vNL=n;vPL=p;vSc=iS;vW=w;vC=iC;vG=iG;vM=iW;vK=iK;vLP=uL*vec4(w,1.);gl_Position=uVP*vec4(w,1.);}';
  var FS = '#version 300 es\nprecision highp float;precision highp sampler2DShadow;' +
    'in vec3 vN;in vec3 vNL;in vec3 vPL;in vec3 vSc;in vec3 vW;in vec3 vC;in vec4 vLP;in float vG;in float vM;in float vK;' +
    'uniform sampler2DShadow uS;uniform vec3 uD,uSun,uSky,uGnd,uOff,uHoff,uLit,uInkC,uFwd;uniform float uT,uInk,uBox;out vec4 o;' +
    'float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'void main(){vec3 n=normalize(vN);float s=0.;vec3 q=vLP.xyz/vLP.w*.5+.5;' +
    'for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)s+=texture(uS,vec3(q.xy+vec2(float(i),float(j))*uT,q.z-.0011));s/=9.;' +
    'float d=max(dot(n,uD),0.);vec3 lg=mix(uGnd,uSky,.5+.5*n.y)+uSun*d*s;vec3 c=vC*lg;' +
    'if(uInk>.5){float sh=n.y>.5?1.-s:1.-smoothstep(.1,.45,d*s);c=vC*mix(1.,.94,sh);' +
    'float hs=sin((gl_FragCoord.x-gl_FragCoord.y)*1.05);c=mix(c,uInkC,smoothstep(.2,.8,hs)*.32*sh);}' +
    'c=mix(c,vC,vG);' +
    'if(vM>-.5&&abs(vNL.y)<.5){float u=abs(vNL.x)>.5?vPL.z*vSc.z:vPL.x*vSc.x;float v=vPL.y*vSc.y;' +
    'vec2 g=vec2(u/.5,v/.56);vec2 id=floor(g);vec2 f=fract(g);vec2 w=max(fwidth(g),vec2(.001));' +
    'float m=smoothstep(.2-w.x,.2+w.x,f.x)*(1.-smoothstep(.8-w.x,.8+w.x,f.x))*smoothstep(.25-w.y,.25+w.y,f.y)*(1.-smoothstep(.8-w.y,.8+w.y,f.y));' +
    'float kk=abs(vK);float lit=vM>0.?step(h21(id+vec2(kk*1.37,kk*2.11)),vM):0.;vec3 wo=vK<0.?uHoff:uOff;c=mix(c,lit>.5?uLit:(uInk>.5?wo:wo*lg),m);}' +
    'if(uInk>.5){float l=0.;if(uBox>.5){vec3 a=abs(vNL);vec3 e=vec3((.5-abs(vPL.x))*vSc.x,min(vPL.y,1.-vPL.y)*vSc.y,(.5-abs(vPL.z))*vSc.z);' +
    'float dd=a.x>.5?min(e.y,e.z):a.y>.5?min(e.x,e.z):min(e.x,e.y);dd+=.004*sin(vW.x*5.+vW.z*4.+vW.y*6.);float aa=max(fwidth(dd),.0001);l=1.-smoothstep(.45*aa,1.3*aa,dd);if(a.y<.5&&vSc.y<.15)l=0.;if(min(vSc.x,vSc.z)<.08)l=0.;}' +
    'else{float f=dot(n,-uFwd);l=1.-smoothstep(.22,.36,f);}c=mix(c,uInkC,l*.9);}' +
    'o=vec4(min(c,vec3(1.)),1.);}';
  var DS = '#version 300 es\nprecision mediump float;void main(){}';

  var INST = 13, SHADOW = 2048, AZ = Math.PI / 4;

  // ---------- styles: the site palette in three materials ----------
  var STYLES = {
    // White architectural model on a turned teal plinth; a slow orbit.
    model: {
      ground: 'disc', ld: [0.42, 0.78, 0.46], sky: [0.8, 0.825, 0.835], gnd: [0.61, 0.68, 0.71], sun: [0.25, 0.2425, 0.2325], ctxWin: -1, zoom: 1,
      cam: function (t, a, S) {
        var el = 0.62, az = AZ + Math.sin(t / TOTAL * Math.PI * 2) * 0.4, hh = S.fit, dist = hh / Math.tan(0.15), cy = S.cy;
        return { eye: [Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist + cy, Math.cos(az) * Math.cos(el) * dist], at: [0, cy, 0], proj: persp(0.3, a, 1, dist + 80) };
      },
      pal: {
        ground: '#E6EEEF', plot: '#FFFFFF', road: '#CBD8DB', road2: '#9DB8BD', lane: '#FFFFFF', wall: '#FBFDFD', wall2: '#E4ECEE', old: '#CDD8DA', old2: '#BCCACD', slab: '#FFFFFF',
        dark: '#254750', panel: '#2E5F6B', glass: '#9DB8BD', water: '#B9D3D8', gold: '#A9843F', goldLit: '#D9B15F', lit: '#F6D48B', warm: '#F4EAD3', crane: '#A9843F',
        leaf: '#A9C5B8', leaf2: '#8FB3A2', trunk: '#8A7350', plinth: '#13353E', person: '#13353E', off: '#C8D6D9', hoff: '#9DB8BD',
        st: ['#F7FAFA', '#EDF3F4', '#F2F6F7', '#E9F0F1'], field: ['#C6D8CE', '#B6CDC0', '#D9E5DD', '#A9C5B8'], soil: '#E3DAC8', s: ['#9C855F', '#B39C78', '#CCBEA3', '#E8E1D3']
      }
    },
    // Pen drawing: paper surfaces, ruled edges, hatched shadow; a true isometric.
    ink: {
      ground: 'sheet', ink: true, ld: [-0.42, 0.8, 0.42], sky: [1, 1, 1], gnd: [1, 1, 1], sun: [0, 0, 0], ctxWin: 0, zoom: 0.98,
      cam: function (t, a, S) {
        var az = -AZ + Math.sin(t / TOTAL * Math.PI * 2) * 0.05, el = 0.6, cy = S.cy, D = 70;
        return { eye: [Math.sin(az) * Math.cos(el) * D, Math.sin(el) * D + cy, Math.cos(az) * Math.cos(el) * D], at: [0, cy, 0], proj: ortho(S.fit * a, S.fit, 1, 160) };
      },
      pal: {
        ground: '#F3F7F7', plot: '#FFFFFF', road: '#E6EEEF', road2: '#9DB8BD', lane: '#FFFFFF', wall: '#FFFFFF', wall2: '#F7FAFA', old: '#E6EEEF', old2: '#DAE4E5', slab: '#FFFFFF',
        dark: '#2E5F6B', panel: '#2E5F6B', glass: '#E6EEEF', water: '#DCE9EB', gold: '#A9843F', goldLit: '#D9B15F', lit: '#F4DDA6', warm: '#F4EAD3', crane: '#A9843F',
        leaf: '#E4EEE9', leaf2: '#D2E2DA', trunk: '#13353E', plinth: '#13353E', person: '#13353E', off: '#E6EEEF', hoff: '#9DB8BD', ink: '#13353E',
        st: ['#FFFFFF', '#F7FAFA', '#FBFDFD', '#F3F7F7'], field: ['#EAF2EE', '#FFFFFF', '#F3F7F4', '#DFEAE4'], soil: '#F4EAD3', s: ['#CCBEA3', '#DCD2BE', '#E8E1D3', '#F4EAD3']
      }
    },
    // A cut block of the city at dusk: dark teal mass, lit windows, low camera.
    dusk: {
      ground: 'block', ld: [-0.62, 0.5, 0.6], sky: [0.44, 0.52, 0.6], gnd: [0.2, 0.27, 0.32], sun: [0.62, 0.46, 0.32], ctxWin: 0.42, zoom: 1, glow: true,
      cam: function (t, a, S) {
        var el = 0.34, az = 0.62 + Math.sin(t / TOTAL * Math.PI * 2) * 0.16, hh = S.fit, dist = hh / Math.tan(0.21), cy = S.cy;
        return { eye: [Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist + cy, Math.cos(az) * Math.cos(el) * dist], at: [0, cy, 0], proj: persp(0.42, a, 1, dist + 80) };
      },
      pal: {
        ground: '#1C4550', plot: '#2B5A66', road: '#102F37', road2: '#0B252C', lane: '#5C7C83', wall: '#46707B', wall2: '#355C67', old: '#5A6F75', old2: '#4A6068', slab: '#6F929B',
        dark: '#16343D', panel: '#1F4752', glass: '#14323B', water: '#2F7D8C', gold: '#D9B15F', goldLit: '#F0CC7E', lit: '#FFD98F', warm: '#6E6242', crane: '#D9B15F',
        leaf: '#3E6B60', leaf2: '#335A50', trunk: '#3A3226', plinth: '#13353E', person: '#FFD98F', off: '#1A3C46', hoff: '#0F2C34',
        st: ['#2B5A66', '#24505C', '#316270', '#1F4955'], field: ['#2F5F54', '#39695C', '#28564C', '#44735F'], soil: '#4A4432', s: ['#0E2A32', '#14343D', '#1A3F49', '#214B56']
      }
    }
  };

  // ---------- the seven stories ----------
  // Front of every scene is +z. Each draw function may use S (helpers) and t.

  // A cinema empties, comes down bay by bay, and the same plot fills with shops,
  // restaurants and offices. The road and the neighbours never change.
  function theatre(S, t) {
    var C = S.C, B = S.B, i, k, x;
    S.ground(); S.road(5.3, 1.6);
    S.pad(0, -0.6, 7.6, 8.8, C.plot);
    S.ctx(-5.5, -0.5, 2.2, 4.4, 2.4, 11); S.ctx(5.5, -1.2, 2.2, 3.4, 3.4, 12);
    S.ctx(-5.5, -4.8, 2.2, 2.4, 1.8, 13); S.ctx(5.5, -4.9, 2.2, 2.2, 2.6, 14);

    // the hall, then the foyer
    for (i = 0; i < 8; i++) {
      k = 1 - ss(4.1 + i * 0.2, 4.45 + i * 0.2, t);
      if (k <= 0.01) continue;
      var hz = -4.4 + 0.3125 + i * 0.625;
      B(0, 0.07, hz, 4.8, 1.7 * k, 0.625, C.old);
      S.vault(0, 0.07 + 1.7 * k, hz, 4.8, 1.3 * k, 0.625, C.old2);
    }
    k = 1 - ss(5.8, 6.3, t);
    if (k > 0.01) {
      B(0, 0.07, 1.6, 5.2, 2.4 * k, 2, C.old2);
      B(0, 0.07, 2.62, 1.6, 0.95 * k, 0.04, C.dark);
      for (i = -1; i <= 1; i += 2) B(i * 1.75, 0.5 * k, 2.63, 0.7, 0.85 * k, 0.03, C.gold);
      B(0, 0.07 + 1.25 * k, 3.05, 4.6, 0.16 * k, 1, C.gold);
      var bulb = 1 - ss(1.7, 2.5, t);
      for (i = 0; i < 14; i++) S.ball(-2.15 + i * 0.33, 0.07 + 1.2 * k, 3.56, 0.13 * k, mix(C.old, C.lit, bulb), bulb);
      B(-2.85, 0.07, 2.75, 0.34, 3.3 * k, 0.34, C.dark);
      B(-2.85, 0.07 + 1.9 * k, 2.95, 0.5, 1.25 * k, 0.05, mix(C.old2, C.lit, bulb), bulb);
    }
    // the audience moves on
    for (i = 0; i < 18; i++) {
      var u = p01(0.3 + i * 0.13, 2.9 + i * 0.13, t);
      if (u <= 0 || u >= 1) continue;
      x = (i % 2 ? 1 : -1) * Math.pow(u, 1.5) * 9 + hash(i, 3) * 0.6 - 0.3;
      S.person(x, 3.7 + Math.min(u * 4, 1) * (1.05 + hash(i, 5) * 0.5), 1 - ss(0.85, 1, u));
    }

    // the new building is drawn first, then filled
    var gh = out(3.2, 4.2, t) * (1 - ss(9.8, 10.4, t));
    S.frame(0, -0.7, 6.6, 6.4, 0.07, 5.3 * gh, C.gold, 0.05, 0.85);
    if (t > 6.3) B(0, 0.07, -0.7, 7.2, 0.18 * out(6.3, 6.7, t), 7, C.slab);
    S.crane(3.3, -4.2, 7, 6.5, 10.8);
    var lease = ss(10.8, 12, t), f = 2.5;
    S.floor(6.8, 0, 0.25, -0.7, 6.6, 0.86, 6.4, C.wall);
    if (t > 7.2) {
      k = back(7.2, 7.6, t);
      for (i = 0; i < 5; i++) {
        x = -2.64 + i * 1.32;
        B(x, 0.32, f + 0.03, 1.14, 0.62, 0.06, mix(C.glass, C.lit, lease), lease);
        B(x, 0.98, f + 0.03 + 0.26 * k, 1.14, 0.06, 0.52 * k, C.gold);
      }
    }
    S.floor(7.7, 0, 1.11, -1.05, 6, 0.7, 5.7, C.wall2, lease * 0.85, 17);
    if (t > 8) for (i = 0; i < 5; i++) {
      k = back(8 + i * 0.08, 8.4 + i * 0.08, t);
      x = -2.3 + i * 1.15;
      S.cyl(x, 1.11, 2.15, 0.05, 0.56 * k, 0.05, C.dark);
      S.ball(x, 1.11 + 0.42 * k, 2.15, 0.72 * k, C.gold, 0, 0.32);
    }
    for (i = 0; i < 6; i++) S.floor(8.4 + i * 0.3, 0, 1.81 + i * 0.56, -1.1, 4.2, 0.56, 3.6, C.dark, lease * 0.86, -(i * 3.7 + 1));
    for (i = 0; i < 4; i++) { x = [-3.2, -1.6, 1.6, 3.2][i]; k = back(11.1 + i * 0.12, 11.6 + i * 0.12, t); if (t > 11.1 + i * 0.12) S.tree(x, 3.45, k, 1, i % 2 ? C.leaf : C.leaf2); }
    // and the people come back
    for (i = 0; i < 18; i++) {
      var v = out(11.2 + i * 0.09, 13 + i * 0.09, t);
      if (v <= 0) continue;
      var from = (i % 2 ? 1 : -1) * 8, to = -3 + hash(i, 9) * 6;
      S.person(from + (to - from) * v, 3.05 + hash(i, 12) * 0.9, Math.min(1, v * 6));
    }
  }

  // Scaffold goes up, old cladding comes off and a new face goes on, floor by
  // floor, while the ground-floor shops stay lit and open the whole time.
  function reno(S, t) {
    var C = S.C, B = S.B, i, f, b, fl, k;
    S.ground(); S.road(4.3, 1.4);
    S.pad(0, -0.6, 6.4, 6.6, C.plot);
    S.ctx(-4.5, -0.6, 1.6, 4.6, 2.3, 21); S.ctx(4.5, -1, 1.6, 3.8, 3.1, 22);

    var W = 4.4, D = 3.4, cz = -0.6, G = 0.9, FH = 0.56, N = 3, H = G + N * FH, T = 0.07 + H;
    // basement ramp
    B(-2.55, 0.072, 0.4, 0.7, 0.01, 2.6, C.road2);
    for (i = 0; i < 5; i++) B(-2.55, 0.083, -0.6 + i * 0.5, 0.45, 0.005, 0.07, C.lane);

    // the shell, and shops that never close
    B(0, 0.07, cz, W - 0.1, H, D - 0.1, C.wall2);
    var sides = [
      { nx: 0, nz: 1, n: 5, len: W, o: D / 2, a: 'x' },
      { nx: 1, nz: 0, n: 4, len: D, o: W / 2, a: 'z' },
      { nx: -1, nz: 0, n: 4, len: D, o: W / 2, a: 'z' }
    ];
    function at(s, u, off) { return s.a === 'x' ? [u, cz + s.o + off] : [s.nx * (s.o + off), cz + u]; }
    sides.forEach(function (s, fi) {
      var bay = s.len / s.n, p, q;
      for (b = 0; b < s.n; b++) {
        var u = -s.len / 2 + bay * (b + 0.5);
        p = at(s, u, 0.02);
        B(p[0], 0.14, p[1], s.a === 'x' ? bay - 0.1 : 0.05, 0.66, s.a === 'x' ? 0.05 : bay - 0.1, C.lit, 1);
        q = at(s, u, 0.26);
        B(q[0], 0.84, q[1], s.a === 'x' ? bay - 0.08 : 0.5, 0.06, s.a === 'x' ? 0.5 : bay - 0.08, C.gold);
        for (fl = 0; fl < N; fl++) {
          var y = 0.07 + G + fl * FH + 0.02, tp = 4.2 + (N - 1 - fl) * 0.7 + b * 0.1 + fi * 0.12, off = ss(tp, tp + 0.35, t);
          var tn = 7 + fl * 0.85 + b * 0.1 + fi * 0.1, nw = out(tn, tn + 0.45, t), sx = s.a === 'x' ? bay - 0.04 : 0.07, sz = s.a === 'x' ? 0.07 : bay - 0.04;
          if (off < 1) {
            var po = at(s, u, 0.04 + off * 1.1);
            B(po[0], y - off * 0.6, po[1], sx, (FH - 0.04) * (1 - off * 0.3), sz, C.old, 0, 0, 30 + b + fl * 7);
          }
          if (t > tn) {
            var pn = at(s, u, 0.04 + (1 - nw) * 1.3);
            B(pn[0], y, pn[1], sx, FH - 0.04, sz, C.panel, 0, 0, -(40 + b + fl * 7));
            var fin = at(s, u - bay / 2 + 0.02, 0.1 + (1 - nw) * 1.3);
            B(fin[0], y, fin[1], s.a === 'x' ? 0.04 : 0.14, FH - 0.04, s.a === 'x' ? 0.14 : 0.04, C.gold);
          }
        }
      }
      // scaffold on this face
      var P = H + 0.55, gone = ss(11.3, 12.2, t);
      for (b = 0; b <= s.n; b++) {
        var st = 1.6 + b * 0.07 + fi * 0.25; k = out(st, st + 0.5, t) * (1 - gone);
        if (t <= st || k <= 0.01) continue;
        var pa = at(s, -s.len / 2 + bay * b, 0.5);
        B(pa[0], 0.07, pa[1], 0.05, P * k, 0.05, C.dark);
      }
      for (fl = 0; fl <= N; fl++) {
        var st2 = 2.3 + fl * 0.22 + fi * 0.25; k = out(st2, st2 + 0.4, t) * (1 - gone);
        if (t <= st2 || k <= 0.01) continue;
        var m = at(s, 0, 0.5), ly = 0.07 + G + fl * FH;
        B(m[0], ly, m[1], s.a === 'x' ? s.len * k : 0.04, 0.04, s.a === 'x' ? 0.04 : s.len * k, C.dark);
        var pl = at(s, 0, 0.34);
        B(pl[0], ly + 0.04, pl[1], s.a === 'x' ? s.len * k : 0.28, 0.025, s.a === 'x' ? 0.28 : s.len * k, C.gold);
      }
    });
    // terrace finished last
    k = back(10.9, 11.4, t);
    if (t > 10.9) {
      S.ring(0, T, cz, W, D, 0.1, 0.22, C.slab);
      B(-0.7, T, cz, 2.2, 0.03, 2, C.warm);
      [[-1.7, -1.3], [0.3, -1.3], [-1.7, 0.1], [0.3, 0.1]].forEach(function (p) { B(p[0], T, p[1], 0.07, 0.72 * k, 0.07, C.dark); });
      B(-0.7, T + 0.72 * k, -0.6, 2.2, 0.06, 1.6, C.gold);
      S.tree(1.5, cz + 0.9, k, 0.75, C.leaf, T); S.tree(1.5, cz - 0.7, k, 0.75, C.leaf2, T);
    }
    // customers keep coming throughout
    for (i = 0; i < 14; i++) {
      var q2 = frac(t * 0.075 + i / 14), dir = i % 2 ? 1 : -1, x = dir * (q2 * 10 - 5);
      S.person(x, 1.72 + hash(i, 2) * 0.9, Math.min(1, Math.min(q2, 1 - q2) * 10));
    }
  }

  // Twenty-six properties, four states. Records scattered, each asset audited
  // on the ground, and everything drawn together into one view.
  function portfolio(S, t) {
    var C = S.C, B = S.B, i, k;
    S.ground();
    var STATES = [
      { c: [-3.5, -3.3], n: 7, p: [[-3.5, -3.4, 6, 5.2], [-6.2, -2.2, 1.6, 3.2], [-1.8, -6.2, 2.6, 1]] },
      { c: [3.5, -3.2], n: 7, p: [[3.5, -3.2, 6.2, 5.6], [6.5, -1.2, 1.8, 2.6], [2.2, -6.3, 3, 1.2]] },
      { c: [-3.4, 3], n: 6, p: [[-3.4, 2.9, 6.2, 5], [-6, 3.6, 1.4, 2.6], [-2.2, 5.9, 2.6, 1]] },
      { c: [3.5, 3], n: 6, p: [[3.5, 3, 6, 4.8], [6.5, 2.2, 1.4, 2.8], [2.4, 5.8, 2.6, 0.9]] }
    ];
    STATES.forEach(function (s, n) {
      var kk = back(0.1 + n * 0.25, 0.7 + n * 0.25, t);
      if (t <= 0.1 + n * 0.25) return;
      s.p.forEach(function (r) { B(r[0], 0.04, r[1], r[2], 0.22 * kk, r[3], C.st[n]); });
    });
    var props = [];
    STATES.forEach(function (s, n) {
      for (var j = 0; j < s.n; j++) {
        props.push({ x: s.c[0] + ((j % 3) - 1) * 1.8 + (hash(n, j) - 0.5) * 0.4, z: s.c[1] + (Math.floor(j / 3) - 1) * 1.5 + (hash(j, n) - 0.5) * 0.4, kind: (j + n) % 4, r: hash(n + 2, j + 8) });
      }
    });
    var Y = 0.26, hub = 0;
    props.forEach(function (p, i) {
      var s0 = 0.9 + hash(i, 40) * 1.5, kk = back(s0, s0 + 0.4, t);
      if (t <= s0) return;
      var a0 = 3.2 + i * 0.16, a = ss(a0, a0 + 0.3, t), col = mix(C.old, C.wall, a), h = 0.5;
      if (p.kind === 0) { h = (1.1 + p.r * 1.2) * kk; B(p.x, Y, p.z, 0.62, h, 0.62, col, 0, S.winOn(a), i + 1); }
      else if (p.kind === 1) { h = 0.5 * kk; B(p.x, Y, p.z, 1, h, 0.7, col, 0, S.winOn(a), i + 1); }
      else if (p.kind === 2) { h = 0.62 * kk; B(p.x, Y, p.z, 0.64, 0.38 * kk, 0.64, col); B(p.x, Y + 0.38 * kk, p.z, 0.44, 0.24 * kk, 0.44, a > 0.5 ? C.gold : C.old2); }
      else { h = 0.05; B(p.x, Y, p.z, 1, 0.05 * kk, 1, mix(C.soil, C.warm, a)); S.ring(p.x, Y + 0.05, p.z, 1, 1, 0.04, 0.04, a > 0.5 ? C.gold : C.old2); S.tree(p.x + 0.2, p.z - 0.15, kk, 0.7, C.leaf, Y + 0.05); }
      if (t > a0 + 0.2) {
        var pk = back(a0 + 0.2, a0 + 0.55, t);
        S.cyl(p.x + 0.42, Y, p.z + 0.32, 0.05, 0.75 * pk, 0.05, C.gold);
        S.ball(p.x + 0.42, Y + 0.65 * pk, p.z + 0.32, 0.26 * pk, C.goldLit, S.glow);
      }
      // the records, in many hands, until they all come home
      var rs = 7.6 + i * 0.09, q = p01(rs, rs + 0.9, t), ax = p.x, az = p.z, ay = Y + h + 0.55 + Math.sin(t * 1.4 + i) * 0.08;
      if (q >= 1) { hub++; return; }
      if (t > s0 + 0.2) {
        var e = q * q * (3 - 2 * q), rx = ax * (1 - e), rz = az * (1 - e), ry = ay + (0.5 - ay) * e + Math.sin(q * Math.PI) * 1.5, sc = out(s0 + 0.2, s0 + 0.5, t);
        for (var n = 0; n < 3; n++) B(rx, ry + n * 0.07, rz, 0.34 * sc, 0.04, 0.44 * sc, n === 2 ? C.warm : C.slab);
      }
      // field inspection visits one asset at a time
      if (t > a0 - 0.02 && t < a0 + 0.2) S.cyl(p.x, Y, p.z, 0.16, 3.4, 0.16, C.goldLit, 1);
    });
    // one portfolio view
    S.cyl(0, 0.26, 0, 1.6, 0.12, 1.6, C.gold);
    S.cyl(0, 0.38, 0, 1.3, 0.04, 1.3, C.slab);
    for (i = 0; i < hub; i++) B(0, 0.42 + i * 0.05, 0, 0.62, 0.04, 0.8, i % 3 === 2 ? C.warm : C.slab);
    var done = ss(10.1, 10.6, t);
    if (done > 0.01) B(0, 0.42 + hub * 0.05, 0, 0.62 * done, 0.05, 0.8 * done, C.goldLit, S.glow);
    props.forEach(function (p, i) {
      var s = 10.1 + i * 0.05, kk = ss(s, s + 0.4, t);
      if (kk > 0.01) S.line(0, 0, p.x + 0.42, p.z + 0.32, 0.3, 0.035, C.gold, 0.7, kk);
    });
  }

  // A family home built to an institutional programme: budget, schedule and
  // quality rise in step, a marker is set every week, and the house comes up.
  function residence(S, t) {
    var C = S.C, B = S.B, i, k, x, z;
    S.ground(); S.road(4.4, 1);
    S.pad(0, 0, 7.4, 7, C.plot);
    function wall(x0, z0, x1, z1, st) {
      var kk = out(st, st + 0.5, t);
      if (t > st) B((x0 + x1) / 2, 0.07, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.12, 0.42 * kk, Math.abs(z1 - z0) + 0.12, C.wall2);
    }
    wall(-3.55, -3.35, 3.55, -3.35, 0.2); wall(-3.55, -3.35, -3.55, 3.35, 0.3); wall(3.55, -3.35, 3.55, 3.35, 0.4);
    wall(-3.55, 3.35, -1.4, 3.35, 0.5); wall(0.1, 3.35, 3.55, 3.35, 0.6);

    // weekly reporting: twelve markers, and three measures that move together
    var week = clamp(Math.floor((t - 1) / 0.9) + 1, 0, 12);
    for (i = 0; i < 12; i++) {
      var on = ss(1 + i * 0.9, 1.3 + i * 0.9, t);
      B(-3.1 + i * 0.28, 0.07, -2.95, 0.18, 0.12 + on * 0.1, 0.18, mix(C.wall2, C.goldLit, on), on * 0.8);
    }
    var pr = (week - 1 + out(0, 0.4, frac((t - 1) / 0.9))) / 12;
    if (t < 1) pr = 0; if (week >= 12) pr = out(10.9, 11.3, t);
    [C.gold, C.dark, C.glass].forEach(function (c, n) { B(-3.15 + n * 0.3, 0.07, -2.5, 0.22, 0.04 + 1.5 * clamp(pr, 0, 1), 0.22, c); });

    var cx = 0.4, cz = -0.6, xs = [-2.1, -0.43, 1.23, 2.9], zs = [-2.4, -0.6, 1.2];
    if (t > 1) B(cx, 0.07, cz, 5.3, 0.22 * out(1, 1.6, t), 3.9, C.slab);
    var Y0 = 0.29, H0 = 0.95, Y1 = Y0 + H0 + 0.14, H1 = 0.9;
    xs.forEach(function (x, a) {
      zs.forEach(function (z, b) {
        var st = 2.2 + (a + b) * 0.1, kk = out(st, st + 0.4, t);
        if (t > st) B(x, Y0, z, 0.14, H0 * kk, 0.14, C.dark);
      });
    });
    if (t > 3.6) { k = back(3.6, 4, t); B(cx, Y0 + H0 + (1 - Math.min(k, 1)) * 1, cz, 5.5, 0.14, 4.1, C.slab); }
    function rise(st, x, y, z, w, h, d, c, wn, key) { var kk = out(st, st + 0.5, t); if (t > st) B(x, y, z, w, h * kk, d, c, 0, wn, key); }
    rise(4.2, cx, Y0, -2.4, 5, H0, 0.14, C.wall); rise(4.5, -2.1, Y0, cz, 0.14, H0, 3.6, C.wall); rise(4.8, 2.9, Y0, cz, 0.14, H0, 3.6, C.wall);
    rise(5.1, -1.4, Y0, 1.2, 1.4, H0, 0.14, C.wall);
    [[0.7, -2.4], [2.9, -2.4], [0.7, 0.9], [2.9, 0.9]].forEach(function (p, n) {
      var st = 5.6 + n * 0.1, kk = out(st, st + 0.4, t);
      if (t > st) B(p[0], Y1, p[1], 0.14, H1 * kk, 0.14, C.dark);
    });
    if (t > 6.8) { k = back(6.8, 7.2, t); B(1.8, Y1 + H1 + (1 - Math.min(k, 1)) * 1, -0.75, 3.1, 0.14, 4.5, C.slab); B(1.8, Y1 + H1 - 0.02, -0.75, 2.9 * Math.min(k, 1), 0.02, 4.3 * Math.min(k, 1), C.gold);
      if (k > 0.97) { S.ring(1.8, Y1 + H1 + 0.14, -0.75, 2.86, 4.26, 0.08, 0.1, C.wall2); for (i = 0; i < 2; i++) for (var pv = 0; pv < 4; pv++) B(1.3 + i, Y1 + H1 + 0.15, -2 + pv * 0.82, 0.8, 0.04, 0.68, C.panel); } }
    var lit = ss(11.6, 12.6, t);
    rise(7.5, 1.8, Y1, -2.4, 2.3, H1, 0.14, C.wall); rise(7.8, 0.7, Y1, -0.75, 0.14, H1, 3.2, C.wall2); rise(8.1, 2.9, Y1, -0.75, 0.14, H1, 3.2, C.wall2);
    rise(9, 0.1, Y0 + 0.02, 1.2, 1.9, H0 - 0.04, 0.05, mix(C.glass, C.lit, lit), undefined); rise(9.2, 2, Y0 + 0.02, 1.2, 1.7, H0 - 0.04, 0.05, mix(C.glass, C.lit, lit), undefined);
    rise(9.5, 1.8, Y1 + 0.02, 0.9, 2.1, H1 - 0.04, 0.05, mix(C.glass, C.lit, lit), undefined);
    // pergola on the open terrace
    if (t > 10) {
      for (i = 0; i < 5; i++) { k = out(10 + i * 0.08, 10.4 + i * 0.08, t); B(-1.7 + i * 0.5, Y1 + 0.75, -0.6, 0.07, 0.07, 3.2 * k, C.gold); }
      [[-1.9, -2.1], [0.4, -2.1], [-1.9, 0.9], [0.4, 0.9]].forEach(function (p) { B(p[0], Y1, p[1], 0.08, 0.75 * out(10, 10.4, t), 0.08, C.dark); });
    }
    // garden, drive, pool
    k = ss(10.3, 11, t);
    if (k > 0.01) {
      B(-1.4, 0.072, 2.25, 3.9, 0.02, 2 * k, C.leaf2);
      B(-0.65, 0.074, 2.65, 1.5, 0.02, 1.3 * k, C.road);
      B(2.3, 0.072, 2.3, 2.3, 0.05, 1.5 * k, C.slab); B(2.3, 0.1, 2.3, 2, 0.03, 1.2 * k, C.water);
    }
    [[-3.1, 0.2], [-3.1, 1.5], [-3, 2.85], [3.15, -2.9], [3.15, 0.9]].forEach(function (p, n) { var s = 11 + n * 0.14; if (t > s) S.tree(p[0], p[1], back(s, s + 0.5, t), 1.05, n % 2 ? C.leaf : C.leaf2); });
  }

  // Good land, trapped: a half-built frame, fences, a lender's lock and buyers'
  // claims. Every claim is mapped, a developer arrives, the barriers come down.
  function litigated(S, t) {
    var C = S.C, B = S.B, i, k, x, z, CX = 0, CZ = -0.4;
    S.ground(); S.road(4.3, 1.3);
    S.pad(0, -0.3, 7.6, 6.6, C.plot);
    S.ctx(-4.8, -2, 1.2, 3.6, 2.8, 31); S.ctx(4.8, -1.1, 1.2, 4.6, 2.2, 32);
    var free = ss(9.4, 10.6, t);
    [[-1.95, -2], [1.95, -2], [-1.95, 1.3], [1.95, 1.3]].forEach(function (p, n) { B(p[0], 0.07, p[1], 3.7, 0.01, 3.1, mix(mix(C.st[n], C.old2, 0.5), C.plot, free)); });

    // the abandoned frame stays inside whatever comes next
    for (i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
      x = -1.7 + i * 1.7; z = CZ - 1.7 + j * 1.7; k = out(0.1 + (i + j) * 0.05, 0.6 + (i + j) * 0.05, t);
      B(x, 0.08, z, 0.22, 2.2 * k, 0.22, C.old);
      B(x, 0.08 + 2.2 * k, z, 0.05, 0.45 * k, 0.05, C.dark);
      if (i < 2 && k > 0.5) { B(x + 0.85, 0.08 + 1.06, z, 1.7, 0.13, 0.13, C.old); }
    }
    if (t > 0.5) { k = out(0.5, 1, t); B(CX, 1.2, CZ, 3.72 * k, 0.1, 3.72 * k, C.old2); }

    // four fences
    var ARMS = [[2, CZ, 3.78, CZ], [-3.78, CZ, -2, CZ], [CX, -3.55, CX, CZ - 2], [CX, CZ + 2, CX, 2.95]];
    ARMS.forEach(function (a, n) {
      var drop = 1 - ss(8.3 + n * 0.3, 8.9 + n * 0.3, t), st = 0.7 + n * 0.12, kk = out(st, st + 0.5, t);
      if (t <= st || drop <= 0.01) return;
      var len = Math.hypot(a[2] - a[0], a[3] - a[1]), cnt = Math.ceil(len / 0.42), hx = Math.abs(a[2] - a[0]) > 0.1;
      for (var p = 0; p <= cnt; p++) B(a[0] + (a[2] - a[0]) * p / cnt, 0.07, a[1] + (a[3] - a[1]) * p / cnt, 0.05, 0.62 * kk * drop, 0.05, C.dark);
      [0.3, 0.55].forEach(function (y) { B((a[0] + a[2]) / 2, 0.07 + y * kk * drop, (a[1] + a[3]) / 2, hx ? len : 0.03, 0.03, hx ? 0.03 : len, C.gold); });
    });

    // the buyers and their claims, each one mapped, then all brought to the table
    var PINS = [[-3.1, -2.8], [-2.4, -3.1], [-3.2, -1.2], [3, -3], [2.2, -2.8], [3.2, -1.5], [-3.1, 2], [-2.2, 2.5], [2.8, 2.3]];
    PINS.forEach(function (p, n) {
      var st = 0.8 + n * 0.17, mt = 3.4 + n * 0.28, m = ss(mt, mt + 0.3, t), sign = ss(12 + n * 0.08, 12.6 + n * 0.08, t);
      if (t <= st) return;
      var ang = n / 9 * Math.PI * 2 + 0.3, RR = 3.1, tx = Math.cos(ang) * RR * 1.1, tz = CZ + Math.sin(ang) * RR * 0.92;
      var px = p[0] + (tx - p[0]) * sign, pz = p[1] + (tz - p[1]) * sign, kk = back(st, st + 0.45, t);
      if (m > 0.01 && sign < 0.5) S.line(px, pz, CX, CZ, 0.1, 0.03, C.gold, 0.8, m);
      S.cyl(px, 0.08, pz, 0.06, 1.15 * kk, 0.06, m > 0.5 ? C.gold : C.dark);
      S.ball(px, 0.08 + 1 * kk, pz, 0.3 * kk, m > 0.5 ? C.goldLit : C.dark, m * S.glow);
    });

    // the lender's lock
    var open = ss(9, 9.5, t), gone = ss(9.6, 10.2, t), lockIn = back(2.2, 2.7, t);
    if (t > 2.2 && gone < 1) {
      var lx = -2.5, lz = 1.2, ly = 0.08 + (1 - lockIn) * 3, sq2 = 1 - gone;
      B(lx, ly, lz, 1.2 * sq2, 0.85 * sq2, 0.38 * sq2, C.gold);
      B(lx, ly + 0.3 * sq2, lz + 0.2 * sq2, 0.16 * sq2, 0.3 * sq2, 0.02, C.dark);
      var up = open * 0.32;
      [-0.38, 0.38].forEach(function (o) { S.cyl(lx + o, ly + 0.85 * sq2 + (o > 0 ? up : 0), lz, 0.14 * sq2, 0.4 * sq2, 0.14 * sq2, C.dark); });
      B(lx, ly + (0.85 + 0.4) * sq2 + up, lz, 0.92 * sq2, 0.14 * sq2, 0.14 * sq2, C.dark);
    }

    // the investor-developer arrives by road
    var car = out(6.1, 7.4, t), inX = 8 + (1.6 - 8) * car, inZ = 4.3 + (2.2 - 4.3) * ss(7.2, 7.9, t);
    if (t > 6.1 && t < 10.4) { k = 1 - ss(10, 10.4, t); B(inX, 0.08, inZ, 1 * k, 0.48 * k, 0.72 * k, C.goldLit, S.glow); B(inX, 0.56 * k, inZ, 0.6 * k, 0.2 * k, 0.5 * k, C.dark); }

    // and the land is released
    var lease = ss(12.2, 13.2, t);
    S.floor(10, CX, 0.08, CZ, 3.9, 0.92, 3.9, C.wall);
    if (t > 10.3) for (i = 0; i < 4; i++) {
      k = back(10.3 + i * 0.05, 10.7 + i * 0.05, t);
      B(-1.43 + i * 0.95, 0.15, CZ + 1.97, 0.85, 0.66, 0.05, mix(C.glass, C.lit, lease), lease);
      B(-1.43 + i * 0.95, 0.86, CZ + 2.2, 0.85, 0.05, 0.46 * k, C.gold);
    }
    for (i = 0; i < 6; i++) S.floor(10.5 + i * 0.26, CX, 1 + i * 0.56, CZ, 3.5, 0.56, 3.5, C.dark, lease * 0.84, -(i * 3.7 + 1));
    [[-3.2, 2.7], [3.2, 2.7], [-1.2, 2.8], [1.2, 2.8]].forEach(function (p, n) { var s = 12 + n * 0.14; if (t > s) S.tree(p[0], p[1], back(s, s + 0.5, t), 1, n % 2 ? C.leaf : C.leaf2); });
  }

  // Farmland outside the city. Every parcel is surveyed; title is read layer by
  // layer before anything is bought. Those that fail are passed over.
  function land(S, t) {
    var C = S.C, B = S.B, i, j, k, n, a;
    S.ground();
    var G = 3.45, PS = 3.1;
    function cen(v) { return (v - 1.5) * G; }
    // tracks
    B(0, 0.002, 0, 15, 0.03, 0.3, C.soil); B(cen(2) + G / 2, 0.002, 0, 0.3, 0.03, 14, C.soil); B(cen(0) + G / 2, 0.002, 0, 0.3, 0.03, 14, C.soil);
    var CH = [[1, 1], [2, 2], [0, 3]], NO = [[3, 0], [1, 3]];
    function idx(list, i, j) { for (var q = 0; q < list.length; q++) if (list[q][0] === i && list[q][1] === j) return q; return -1; }
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) {
      var cx = cen(i), cz = cen(j), r = (i * 3 + j * 5) % C.field.length, hor = (i + j) % 2 === 0, s0 = 0.05 + (i + j) * 0.09;
      var c = idx(CH, i, j), no = idx(NO, i, j);
      var kk = out(s0, s0 + 0.45, t), col = C.field[r];
      if (no >= 0) col = mix(col, C.old2, ss(3.6 + no * 0.8, 4 + no * 0.8, t));
      if (t <= s0) continue;
      if (c >= 0) {
        var T0 = 4.2 + c * 1.45, lift = out(T0, T0 + 0.45, t) * (1 - ss(T0 + 1, T0 + 1.4, t));
        var rd = ss(T0 + 0.35, T0 + 1, t), bl = rd * (1 - ss(T0 + 1, T0 + 1.3, t));
        for (n = 0; n < 4; n++) B(cx, 0.03 + n * 0.08 + lift * n * 0.75, cz, PS, 0.08 + lift * 0.14, PS, mix(C.s[n], C.goldLit, bl * 0.5));
        // the crop sits on top of the layers
        var top = 0.03 + 4 * 0.08 + lift * 3 * 0.75 + lift * 0.14;
        for (n = 0; n < 7; n++) { a = -PS / 2 + (n + 0.5) * (PS / 7); if (hor) B(cx, top, cz + a, PS - 0.1, 0.08 * kk, PS / 7 - 0.12, col); else B(cx + a, top, cz, PS / 7 - 0.12, 0.08 * kk, PS - 0.1, col); }
        var v = ss(T0 + 1.3, T0 + 1.6, t);
        if (v > 0.01) S.ring(cx, 0.42, cz, PS + 0.2, PS + 0.2, 0.07 * v, 0.04, C.gold, 0.8);
        if (t > T0 + 1.3) {
          [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (s, m) {
            var st = T0 + 1.3 + m * 0.05, q = back(st, st + 0.3, t), e = (PS + 0.2) / 2;
            if (t <= st) return;
            S.cyl(cx + s[0] * e, 0.1, cz + s[1] * e, 0.07, 0.75 * q, 0.07, C.gold);
            S.ball(cx + s[0] * e, 0.8 * q, cz + s[1] * e, 0.22 * q, C.wall, 0);
          });
          var fq = back(T0 + 1.5, T0 + 1.85, t);
          if (t > T0 + 1.5) { S.cyl(cx, 0.1, cz, 0.08, 1.85 * fq, 0.08, C.dark); B(cx + 0.36, 0.1 + 1.45 * fq, cz, 0.7 * fq, 0.42 * fq, 0.03, C.gold); }
        }
      } else {
        B(cx, 0.03, cz, PS, 0.1, PS, C.soil);
        for (n = 0; n < 7; n++) { a = -PS / 2 + (n + 0.5) * (PS / 7); if (hor) B(cx, 0.13, cz + a, PS - 0.1, 0.09 * kk, PS / 7 - 0.12, col); else B(cx + a, 0.13, cz, PS / 7 - 0.12, 0.09 * kk, PS - 0.1, col); }
      }
      if (no >= 0) {
        var ps = 3.6 + no * 0.8, ks = back(ps, ps + 0.3, t), of = ss(ps + 1.4, ps + 1.8, t);
        if (t > ps && of < 1) { S.cyl(cx, 0.1, cz, 0.08, 1.2 * ks * (1 - of), 0.08, C.dark); S.ball(cx, 0.1 + 1.05 * ks * (1 - of), cz, 0.34 * (1 - of), C.dark, 0); }
      }
    }
    // farm pond and farmhouse on parcels that are not in play
    k = out(0.8, 1.3, t);
    if (t > 0.8) { S.cyl(cen(3), 0.24, cen(3), 2.3 * k, 0.04, 2.3 * k, C.water); }
    [[0.3, -1.2], [-1.2, 0.6], [1.2, 0.8], [-0.6, 1.25]].forEach(function (o, m) { var s = 1 + m * 0.1; if (t > s) S.tree(cen(3) + o[0], cen(3) + o[1], back(s, s + 0.4, t), 1.05, m % 2 ? C.leaf : C.leaf2, 0.23); });
    if (t > 1.2) { k = out(1.2, 1.7, t); B(cen(0), 0.23, cen(0), 1, 0.55 * k, 0.8, C.wall); B(cen(0), 0.78 * k + 0.0, cen(0), 1.2, 0.1, 1, C.gold); S.tree(cen(0) + 0.9, cen(0) + 0.6, k, 1.1, C.leaf, 0.23); }
    // the survey line sweeps first
    var sw = p01(1.4, 3.6, t);
    if (sw > 0 && sw < 1) { k = ss(0, 0.06, sw) * (1 - ss(0.94, 1, sw)); B(-7.6 + sw * 15.2, 0.32, 0, 0.07, 0.7 * k, 14.6, C.goldLit, 0.9); }
    // a tractor keeps working the track
    var tr = frac(t / 7) * 15 - 7.5;
    B(tr, 0.05, 0, 0.55, 0.24, 0.3, C.gold, S.glow * 0.6); B(tr - 0.1, 0.29, 0, 0.26, 0.2, 0.26, C.dark);
  }

  // A hotel on the technology corridor: offices rise around it, rooms fill, and
  // the district's daily traffic bends toward the one operating asset.
  function hotel(S, t) {
    var C = S.C, B = S.B, i, j, k;
    S.ground(); S.road(5.5, 1.4);
    var warm = ss(8, 11, t);
    S.pad(0, -0.3, 6.8, 7.8, mix(C.plot, C.warm, warm * 0.75));
    var TW = [[-5.5, -3.2, 2, 2.4, 5.6, 51], [-5.6, 1.2, 1.9, 2.4, 3.9, 52], [5.5, -3.4, 2, 2.6, 6.4, 53], [5.5, 1.3, 1.9, 2.4, 3.4, 54], [-1.9, -5.5, 2.4, 1.5, 4.4, 55], [2.3, -5.6, 2.4, 1.5, 5.2, 56]];
    TW.forEach(function (w, n) {
      var st = 0.2 + n * 0.22, kk = out(st, st + 0.8, t);
      if (t <= st) return;
      S.padT(w[0], w[1], w[2] + 0.4, w[3] + 0.4, C.plot);
      B(w[0], 0.07, w[1], w[2], w[4] * kk, w[3], C.wall2, 0, S.style.ctxWin, w[5]);
    });

    var cz = -0.6, occ = 0.18 + 0.66 * ss(3.4, 7.5, t);
    S.floor(1.5, 0, 0.1, cz, 6.2, 0.56, 4.8, C.wall, occ, 60);
    S.floor(1.8, 0, 0.66, cz, 6.2, 0.56, 4.8, C.wall, occ, 61);
    for (i = 0; i < 10; i++) S.floor(2 + i * 0.13, 0, 1.22 + i * 0.56, -1.5, 4.2, 0.56, 1.8, C.dark, occ * (0.75 + 0.25 * Math.sin(t * 0.8 + i)), -(i * 3.7 + 1));
    if (t > 3.3) { k = back(3.3, 3.7, t); B(0, 6.82, -1.5, 4.5 * Math.min(k, 1), 0.16, 2, C.gold); B(0, 6.98, -1.5, 1.6, 0.42 * k, 0.8, C.slab); }
    // pool deck on the podium
    if (t > 3.4) {
      k = out(3.4, 3.9, t);
      B(0, 1.22, 0.75, 5.8 * k, 0.03, 1.9, C.slab);
      B(1.1, 1.25, 0.75, 2.8 * k, 0.03, 1, C.water);
      for (i = 0; i < 4; i++) B(-1.9 + i * 0.5, 1.25, 0.8, 0.28, 0.05, 0.6, C.warm);
      S.tree(-2.6, 1.3, k, 0.8, C.leaf, 1.25); S.tree(2.8, 1.3, k, 0.8, C.leaf2, 1.25);
    }
    // arrival court
    if (t > 3) {
      k = back(3, 3.4, t);
      [[-1.1, 1.85], [1.1, 1.85], [-1.1, 3.1], [1.1, 3.1]].forEach(function (p) { B(p[0], 0.07, p[1], 0.14, 1 * k, 0.14, C.dark); });
      B(0, 1.07 * k, 2.45, 2.8, 0.14, 1.9, C.gold);
      B(0, 0.07, 4.5, 2.2, 0.02, 1.5, C.road);
    }
    for (i = 0; i < 3; i++) {
      var ca = t * 0.55 + i * Math.PI * 2 / 3, cxp = Math.cos(ca) * 2.2, czp = 2.55 + Math.sin(ca) * 1;
      if (t > 3.6) B(cxp, 0.08, czp, 0.5, 0.18, 0.27, i ? C.dark : C.goldLit, S.glow * (i ? 0 : 0.8), undefined, 0, -ca);
    }
    // the gravity of the corridor
    var g = ss(7.8, 8.6, t);
    if (g > 0.01) {
      for (i = 0; i < 3; i++) {
        var R = (1 - frac(t * 0.14 + i / 3)) * 8 + 0.8, n = 56, a = g * Math.min(1, (R - 0.8) * 1.2, (8.8 - R) * 0.4);
        if (a <= 0.02) continue;
        for (j = 0; j < n; j += 2) {
          var an = j / n * Math.PI * 2, x0 = Math.cos(an) * R, z0 = cz + Math.sin(an) * R;
          if (Math.abs(x0) > 6.6 || z0 > 6.3 || z0 < -6.6) continue;
          B(x0, 0.09, z0, 0.32 * a, 0.015, 0.05 * a, C.gold, 0.8, undefined, 0, Math.PI / 2 - an);
        }
      }
      TW.forEach(function (w, n) {
        for (j = 0; j < 6; j++) {
          var u = frac(t * 0.17 + j / 6 + n * 0.13), e = u * u, tw = (1 - u) * 1.3;
          var dx = w[0] * (1 - e), dz = w[1] + (cz - w[1]) * e, ca2 = Math.cos(tw), sa2 = Math.sin(tw);
          var rx = dx * ca2 - (dz - cz) * sa2, rz = cz + dx * sa2 + (dz - cz) * ca2;
          var sz = 0.2 * g * Math.min(1, u * 6, (1 - u) * 6);
          if (sz > 0.01) S.ball(rx, 0.1 + (1 - u) * 1.2, rz, sz, C.goldLit, S.glow);
        }
      });
    }
    [[-3.2, 3.3], [3.2, 3.3], [-3.2, 1.7], [3.2, 1.7]].forEach(function (p, n) { var s = 4 + n * 0.12; if (t > s) S.tree(p[0], p[1], back(s, s + 0.5, t), 1, n % 2 ? C.leaf : C.leaf2); });
  }

  var SCENES = {
    theatre: { r: 6.6, h: 6.2, draw: theatre },
    reno: { r: 4.9, h: 3.4, draw: reno },
    portfolio: { r: 7.4, h: 2.4, draw: portfolio },
    residence: { r: 4.3, h: 2.6, draw: residence },
    litigated: { r: 5.2, h: 4.8, draw: litigated },
    land: { r: 7.6, h: 1.4, draw: land },
    hotel: { r: 6.5, h: 7.4, draw: hotel }
  };

  // ---------- one canvas ----------
  window.ATProjectScene = function (host, project, styleName, at) {
    var L = STYLES[styleName], SC = SCENES[project];
    if (!L || !SC) return false;
    var canvas = document.createElement('canvas');
    canvas.className = 'hs-gl';
    canvas.setAttribute('role', 'img');
    if (host.dataset.label) canvas.setAttribute('aria-label', host.dataset.label);
    var gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return false;

    function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; }
    function program(v, f) {
      var pr = gl.createProgram();
      gl.attachShader(pr, shader(gl.VERTEX_SHADER, v)); gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, f)); gl.linkProgram(pr);
      return gl.getProgramParameter(pr, gl.LINK_STATUS) ? pr : null;
    }
    var main = program(VS, FS), depth = program(VS, DS);
    if (!main || !depth) return false;
    function U(n) { return gl.getUniformLocation(main, n); }
    var uni = { vp: U('uVP'), l: U('uL'), s: U('uS'), fwd: U('uFwd'), box: U('uBox'), dvp: gl.getUniformLocation(depth, 'uVP') };

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
      return { vao: vao, ib: ib, verts: arr.length / 6, d: d, n: 0, max: max };
    }
    var BOX = mesh(boxGeo(), 5000), CYL = mesh(cylGeo(14), 500), SPH = mesh(sphGeo(10, 14), 900), VAULT = mesh(vaultGeo(20), 16), DISC = mesh(cylGeo(90), 6), ALL = [BOX, CYL, SPH, VAULT, DISC];

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

    var t = 0, sq = 1, R = SC.r * 1.4, E = SC.r + 0.6;
    var S = {
      C: C, style: L, glow: L.glow ? 1 : 0, fit: 0, cy: 0,
      // B/cyl/ball and friends fold flat into the ground as the loop closes
      B: function (x, y, z, sx, sy, sz, c, g, w, k, r) { if (sy > 0.0005 && sx > 0.0005 && sz > 0.0005) put(BOX, x, y * sq, z, sx, sy * sq, sz, r, c, g, w, k); },
      cyl: function (x, y, z, sx, sy, sz, c, g) { if (sy > 0.0005) put(CYL, x, y * sq, z, sx, sy * sq, sz, 0, c, g); },
      ball: function (x, y, z, s, c, g, flat) { if (s > 0.002) put(SPH, x, y * sq, z, s, s * (flat || 1) * sq, s, 0, c, g); },
      vault: function (x, y, z, sx, sy, sz, c) { if (sy > 0.0005) put(VAULT, x, y * sq, z, sx, sy * sq, sz, 0, c); },
      winOn: function (a) { return L.ctxWin < 0 ? -1 : a * 0.75; },
      ground: function () {
        if (L.ground === 'disc') { var deep = SC.r * 0.2; put(DISC, 0, -0.05 - deep, 0, R * 2, deep, R * 2, 0, C.plinth); put(DISC, 0, -0.05, 0, (R - 0.3) * 2, 0.05, (R - 0.3) * 2, 0, C.ground); }
        else if (L.ground === 'sheet') put(BOX, 0, -0.4, 0, E * 2, 0.4, E * 2, 0, C.ground);
        else { var layer = SC.r * 0.05; put(BOX, 0, -0.05, 0, E * 2, 0.05, E * 2, 0, C.ground); C.s.forEach(function (c, n) { put(BOX, 0, -0.05 - (n + 1) * layer, 0, E * 2, layer, E * 2, 0, c); }); }
      },
      road: function (z, w) {
        var edge = Math.abs(z) + w / 2 + 0.15, len = L.ground === 'disc' ? 2 * Math.sqrt(Math.max((R - 0.3) * (R - 0.3) - edge * edge, 1)) : E * 2;
        put(BOX, 0, 0, z, len, 0.025, w, 0, C.road);
        for (var q = -Math.floor(len / 2.2); q <= Math.floor(len / 2.2); q++) put(BOX, q * 1.05, 0.026, z, 0.5, 0.006, 0.06, 0, C.lane);
      },
      pad: function (x, z, w, d, c) { put(BOX, x, 0, z, w, 0.07, d, 0, c); },
      padT: function (x, z, w, d, c) { put(BOX, x, 0, z, w, 0.06, d, 0, c); },
      ctx: function (x, z, w, d, h, key) { put(BOX, x, 0, z, w + 0.4, 0.07, d + 0.4, 0, C.plot); put(BOX, x, 0.07, z, w, h, d, 0, C.wall2, 0, L.ctxWin, key); },
      person: function (x, z, k) { if (k > 0.01) { var s = 0.16 * k; put(SPH, x, 0.05, z, s, s * 2.1 * sq, s, 0, C.person, L.glow ? 1 : 0); } },
      tree: function (x, z, k, s, c, y) {
        if (k <= 0.01) return; y = y || 0.07;
        S.cyl(x, y, z, 0.09, 0.55 * k * s, 0.09, C.trunk);
        put(SPH, x, (y + 0.36 * k * s) * sq, z, 0.82 * k * s, 0.95 * k * s * sq, 0.82 * k * s, 0, c || C.leaf);
      },
      ring: function (x, y, z, w, d, th, h, c, g) {
        S.B(x, y, z + d / 2, w + th, h, th, c, g); S.B(x, y, z - d / 2, w + th, h, th, c, g);
        S.B(x + w / 2, y, z, th, h, d + th, c, g); S.B(x - w / 2, y, z, th, h, d + th, c, g);
      },
      frame: function (x, z, w, d, y, h, c, th, g) {
        if (h <= 0.02) return;
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { S.B(x + s[0] * w / 2, y, z + s[1] * d / 2, th, h, th, c, g); });
        S.ring(x, y + h, z, w, d, th, th, c, g); S.ring(x, y, z, w, d, th, th, c, g);
      },
      line: function (x0, z0, x1, z1, y, th, c, g, k) {
        var dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) * k;
        var a = Math.atan2(-dz, dx);
        S.B(x0 + dx * k / 2, y, z0 + dz * k / 2, l, th, th, c, g, undefined, 0, a);
      },
      floor: function (st, x, y, z, w, h, d, c, win, key) {
        if (t <= st) return;
        var kk = back(st, st + 0.4, t), d0 = 1 - out(st, st + 0.4, t), ww = w * (0.86 + 0.14 * kk), dd = d * (0.86 + 0.14 * kk), yy = y + d0 * 1.4;
        S.B(x, yy, z, ww - 0.1, h - 0.06, dd - 0.1, c, 0, kk < 0.97 ? (win === undefined ? -1 : 0) : win, key);
        S.B(x, yy + h - 0.06, z, ww, 0.06, dd, C.slab);
      },
      crane: function (x, z, H, t0, t1) {
        var cu = out(t0, t0 + 0.6, t) * (1 - ss(t1 - 0.5, t1, t));
        if (cu < 0.01) return;
        var hh = H * cu, ang = Math.atan2(z, -x) + Math.sin(t * 1.1) * 0.22, dx = Math.cos(ang), dz = -Math.sin(ang), Lj = 5.4 * cu, y = 0.07 + hh + 0.14;
        S.B(x, 0.07, z, 0.26, hh, 0.26, C.crane);
        S.B(x, 0.07 + hh, z, 0.36, 0.36, 0.36, C.dark);
        S.B(x + dx * (Lj / 2 - 1.2), y, z + dz * (Lj / 2 - 1.2), Lj, 0.13, 0.12, C.crane, 0, undefined, 0, ang);
        S.B(x - dx, y - 0.1, z - dz, 0.42, 0.36, 0.42, C.dark, 0, undefined, 0, ang);
        var hd = Math.hypot(x, z) * 0.6 + Math.sin(t * 2.3) * 0.2, hy = H * 0.62 + Math.sin(t * 0.9) * 0.4;
        S.B(x + dx * hd, hy, z + dz * hd, 0.03, Math.max(0.02, y - hy), 0.03, C.dark);
        S.B(x + dx * hd, hy - 0.14, z + dz * hd, 0.22, 0.14, 0.22, C.dark);
      }
    };
    S.fit = (L.ground === 'disc' ? 1.16 * SC.r + 0.2 * SC.h : L.ground === 'sheet' ? 1.04 * SC.r + 0.22 * SC.h : 1.06 * SC.r + 0.2 * SC.h) * L.zoom;
    S.cy = SC.h * 0.2;

    // ---------- render ----------
    var LD = norm(L.ld), shSize = SC.r * 1.6 + SC.h * 0.5;
    var lightVP = mul(ortho(shSize, shSize, 1, 120), lookAt([LD[0] * 55, LD[1] * 55, LD[2] * 55], [0, 0, 0]));
    var W = 0, Hh = 0;

    gl.useProgram(main);
    gl.uniform3fv(U('uD'), LD); gl.uniform3fv(U('uSun'), L.sun); gl.uniform3fv(U('uSky'), L.sky); gl.uniform3fv(U('uGnd'), L.gnd);
    gl.uniform3fv(U('uOff'), C.off); gl.uniform3fv(U('uHoff'), C.hoff); gl.uniform3fv(U('uLit'), C.lit); gl.uniform3fv(U('uInkC'), C.ink || [0, 0, 0]);
    gl.uniform1f(U('uT'), 1.8 / SHADOW); gl.uniform1f(U('uInk'), L.ink ? 1 : 0);
    gl.enable(gl.DEPTH_TEST);

    function draw(tt) {
      t = tt; sq = 1 - ss(END, TOTAL - 0.1, t);
      ALL.forEach(function (m) { m.n = 0; });
      SC.draw(S, t);
      ALL.forEach(function (m) { if (m.n) { gl.bindBuffer(gl.ARRAY_BUFFER, m.ib); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.d, 0, m.n * INST); } });
      // shadows
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, SHADOW, SHADOW); gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.useProgram(depth); gl.uniformMatrix4fv(uni.dvp, false, lightVP);
      ALL.forEach(function (m) { if (m.n) { gl.bindVertexArray(m.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, m.verts, m.n); } });
      // scene
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, Hh);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(main);
      var cam = L.cam(t, W / Hh, S), vp = mul(cam.proj, lookAt(cam.eye, cam.at));
      gl.uniformMatrix4fv(uni.vp, false, vp); gl.uniformMatrix4fv(uni.l, false, lightVP);
      gl.uniform3fv(uni.fwd, norm([cam.at[0] - cam.eye[0], cam.at[1] - cam.eye[1], cam.at[2] - cam.eye[2]]));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sTex); gl.uniform1i(uni.s, 0);
      ALL.forEach(function (m) { if (m.n) { gl.uniform1f(uni.box, m === BOX ? 1 : 0); gl.bindVertexArray(m.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, m.verts, m.n); } });
      gl.bindVertexArray(null);
    }

    function size() {
      var r = host.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width * dpr)); Hh = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== W || canvas.height !== Hh) { canvas.width = W; canvas.height = Hh; }
    }

    host.appendChild(canvas);
    host.classList.add('gl-on');
    size();

    var watchers = [];
    function watch(o) { o.observe(host); watchers.push(o); }
    function stop() {
      visible = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      watchers.forEach(function (o) { o.disconnect(); });
      canvas.remove();
      host.classList.remove('gl-on');
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }

    var fixed = at !== undefined ? at : (matchMedia('(prefers-reduced-motion: reduce)').matches ? FROZEN : null);
    if (fixed !== null) {
      draw(fixed);
      watch(new ResizeObserver(function () { size(); draw(fixed); }));
      return stop;
    }

    // Runs only while on screen, so the three options stay smooth together.
    var clock = 0, last = 0, raf = 0, visible = false;
    function frame(now) {
      raf = 0;
      if (!visible) return;
      if (last) clock += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw(clock % TOTAL);
      raf = requestAnimationFrame(frame);
    }
    watch(new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting; last = 0;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }, { rootMargin: '100px 0px' }));
    watch(new ResizeObserver(function () { size(); }));
    return stop;
  };

  window.ATProjectFrames = { TOTAL: TOTAL, END: END, FROZEN: FROZEN };
})();
