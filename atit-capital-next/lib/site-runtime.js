// Site behaviour, ported from the single-file version's inline scripts.
// Inlined at the end of <body> so it runs during the first parse, before React
// hydrates: reveal animations are set up before first paint and nothing flickers.
// After a client-side navigation, components/Navigator.tsx calls window.AT.page().
(function(){
  // Old single-file links (/#capital, /#gcc …) go to the new routes.
  var LEGACY = __LEGACY_HASH__;
  if(location.pathname==='/'&&location.hash.length>1){
    var lh=decodeURIComponent(location.hash.slice(1)), to=LEGACY[lh];
    if(to&&to!=='/'&&to.indexOf('/#')!==0){location.replace(to);return;}
  }

  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MO=!RM&&('IntersectionObserver' in window);
  if(MO)document.documentElement.classList.add('mo');

  // ---------- menu ----------
  const overlay=$('#overlay'), openBtn=$('#openNav'), closeBtn=$('#closeNav');
  function closeMenu(){overlay.classList.remove('show');openBtn.setAttribute('aria-expanded','false');document.body.style.overflow='';}
  openBtn.addEventListener('click',()=>{overlay.classList.add('show');openBtn.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';closeBtn.focus();});
  closeBtn.addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  $$('.ov-main > li > button').forEach(b=>b.addEventListener('click',()=>{const li=b.parentElement;const o=li.classList.contains('open');$$('.ov-main > li').forEach(x=>x.classList.remove('open'));if(!o)li.classList.add('open');}));
  $$('.overlay a').forEach(a=>a.addEventListener('click',closeMenu));

  // ---------- to top, header state, reading progress ----------
  const tt=$('#toTop'), hd=$('header.site');
  function onScroll(){const y=scrollY;tt.classList.toggle('show',y>900);document.body.classList.toggle('scrolled',y>40);const m=document.documentElement.scrollHeight-innerHeight;hd.style.setProperty('--sp',m>0?Math.min(1,y/m).toFixed(4):0);}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  tt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // ---------- procedural cadastral drawing ----------
  function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
  const seeds={hero:7,infra:21,dev:33,adl:47,adv:59,plan:83,thesis:91};
  function drawLand(c){
    const kind=c.dataset.land; const r=c.getBoundingClientRect(); if(r.width<2||r.height<2)return;
    const dpr=Math.min(2,window.devicePixelRatio||1); c.width=r.width*dpr; c.height=r.height*dpr;
    const x=c.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); const W=r.width,H=r.height;
    const R=rng(seeds[kind]||5);
    const line=kind==='plan';
    const dark=!line;
    const palettes={
      hero:['#3B2A24','#4A3A2C','#2F3A2E','#3E4535','#5A3B2E','#33302A','#463227'],
      infra:['#3A3632','#4B4038','#5B3A2E','#2F3436','#45403A'],
      dev:['#2F3A2E','#3E4535','#4B5340','#384132','#55503C'],
      adl:['#5A3B2E','#6B4434','#4A3A2C','#3B2A24','#7A4A35'],
      adv:['#2B3940','#34444C','#3D4F57','#24323A','#46575E'],
      thesis:['#182A31','#1F343C','#243C45','#2A444D']
    };
    const pal=palettes[kind]||palettes.hero;
    const mono=css('--f-mono')||'monospace';
    if(dark){x.fillStyle='#1B1714';x.fillRect(0,0,W,H);}else{x.clearRect(0,0,W,H);}
    // recursive split into parcels
    const rects=[]; (function split(a,b,w,h,d){ if(d>6||(w*h<(line?9000:5200)&&d>2)||w<40||h<40){rects.push([a,b,w,h]);return;} const v=w>h? true : w<h? false : R()<.5; const t=.3+R()*.4; if(v){split(a,b,w*t,h,d+1);split(a+w*t,b,w*(1-t),h,d+1);}else{split(a,b,w,h*t,d+1);split(a,b+h*t,w,h*(1-t),d+1);} })(-20,-20,W+40,H+40,0);
    const j=()=> (R()-.5)*10;
    const focusIdx=Math.floor(rects.length*(kind==='hero'?.62:.5));
    rects.forEach((q,i)=>{const [a,b,w,h]=q; const pts=[[a+j(),b+j()],[a+w+j(),b+j()],[a+w+j(),b+h+j()],[a+j(),b+h+j()]];
      x.beginPath();pts.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();
      if(dark){x.fillStyle=pal[Math.floor(R()*pal.length)];x.fill();
        x.save();x.clip();x.strokeStyle='rgba(255,255,255,0.04)';x.lineWidth=1;const ang=R()*Math.PI;const step=4+R()*5;x.translate(a+w/2,b+h/2);x.rotate(ang);for(let s=-Math.max(w,h);s<Math.max(w,h);s+=step){x.beginPath();x.moveTo(-w-h,s);x.lineTo(w+h,s);x.stroke();}x.restore();
        x.beginPath();pts.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();
        x.strokeStyle='rgba(235,225,210,0.28)';x.lineWidth=1;x.stroke();
        if(i===focusIdx){x.strokeStyle='#E68A7F';x.lineWidth=2.2;x.stroke();x.fillStyle='rgba(159,42,36,0.35)';x.fill();}
      }else{x.strokeStyle=css('--ink-3');x.globalAlpha=.35;x.lineWidth=.8;x.stroke();x.globalAlpha=1;
        if(i===focusIdx){x.fillStyle=css('--accent-soft');x.fill();x.strokeStyle=css('--accent');x.lineWidth=1.6;x.stroke();}
        if(R()<.35&&w>70&&h>40){x.fillStyle=css('--ink-3');x.globalAlpha=.55;x.font='9px '+mono;x.fillText('SY. '+(10+Math.floor(R()*180))+'/'+(1+Math.floor(R()*4)),a+10,b+h/2);x.globalAlpha=1;}
      }
    });
    // roads
    const roads=kind==='plan'?1:2;
    for(let k=0;k<roads;k++){x.beginPath();const y0=H*(.25+R()*.6),y1=H*(.15+R()*.7);x.moveTo(-10,y0);x.bezierCurveTo(W*.35,y0+(R()-.5)*80,W*.65,y1+(R()-.5)*80,W+10,y1);
      x.strokeStyle=dark?'rgba(214,205,190,0.55)':css('--rule');x.lineWidth=dark?(k?3:6):10;x.stroke();
      if(dark&&k===0){x.setLineDash([8,10]);x.strokeStyle='rgba(255,255,255,0.35)';x.lineWidth=1;x.stroke();x.setLineDash([]);}}
    if(dark&&kind==='hero'){
      for(let t=0;t<220;t++){x.beginPath();x.arc(R()*W,R()*H,1+R()*2.2,0,Math.PI*2);x.fillStyle='rgba(60,80,50,0.55)';x.fill();}
    }
  }
  function drawAll(){$$('canvas[data-land]').forEach(c=>{if(c.offsetParent!==null||c.closest('.hero'))drawLand(c);});}
  let rt; window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(drawAll,150);});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',drawAll);
  new MutationObserver(drawAll).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawAll);
  window.addEventListener('load',()=>setTimeout(drawAll,0));

  // ---------- per-page widgets ----------
  function carousel(p,later){
    const dots=$('#heroDots',p); if(!dots)return;
    const slides=$$('[data-slide]',p); let si=0, timer=null;
    dots.textContent='';
    slides.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Slide '+(i+1));b.addEventListener('click',()=>{go(i);restart();});dots.appendChild(b);});
    function go(i){si=(i+slides.length)%slides.length;slides.forEach((s,k)=>s.classList.toggle('on',k===si));$$('button',dots).forEach((d,k)=>d.setAttribute('aria-current',k===si?'true':'false'));}
    function restart(){clearInterval(timer);if(!RM)timer=setInterval(()=>go(si+1),8000);}
    $('#heroPrev',p).addEventListener('click',()=>{go(si-1);restart();});
    $('#heroNext',p).addEventListener('click',()=>{go(si+1);restart();});
    go(0);restart();
    later.push(()=>clearInterval(timer));
  }
  function projects(p){
    const g=$('#pjGrid',p); if(!g)return;
    const bs=$$('.pj-filters button',p), cards=$$('.pj-card',g), cnt=$('#pjCount',p);
    bs.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.f; bs.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false')); let n=0; cards.forEach(c=>{const on=f==='all'||c.dataset.tags.split(' ').includes(f); c.hidden=!on; if(on)n++;}); cnt.textContent=n+(n===1?' project':' projects');}));
  }
  function thesis(p,later){
    if(RM)return;
    const els=$$('.tp-anim',p); if(!els.length)return;
    const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.remove('pre'); io.unobserve(e.target); } }),{threshold:.25});
    els.forEach(el=>{ el.classList.add('pre'); io.observe(el); });
    const t=setTimeout(()=>els.forEach(el=>el.classList.remove('pre')),8000);
    later.push(()=>{io.disconnect();clearTimeout(t);});
  }
  function contact(p){
    const f=$('#enq',p);
    if(f){f.addEventListener('submit',e=>{e.preventDefault();const out=$('#enqOut',p);const n=$('#f-name',p).value.trim();
      if(!n){out.hidden=false;out.textContent='Add your name so we know who to reply to.';$('#f-name',p).focus();return;}
      const txt='Enquiry for ATit Capital\nName: '+n+'\nOrganisation: '+$('#f-org',p).value+'\nI am a: '+$('#f-type',p).value+'\nInterested in: '+$('#f-int',p).value+'\n\n'+$('#f-msg',p).value;
      out.hidden=false;out.innerHTML='';const para=document.createElement('p');para.textContent='Your message is ready. Copy it. Email it to partners@atitcapital.com. A founding partner will reply.';const pre=document.createElement('pre');pre.style.cssText='white-space:pre-wrap;font:inherit;font-size:.88rem;margin:.75rem 0;color:var(--ink-2)';pre.textContent=txt;const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='Copy message';
      b.addEventListener('click',()=>{navigator.clipboard.writeText(txt).then(()=>{b.textContent='Copied';}).catch(()=>{const s=getSelection();const rg=document.createRange();rg.selectNodeContents(pre);s.removeAllRanges();s.addRange(rg);b.textContent='Text selected. Press copy.';});});
      out.append(para,pre,b);});}
    const cm=$('#copyMail',p); if(cm){cm.addEventListener('click',()=>{const t=$('#mailAddr',p).textContent;navigator.clipboard.writeText(t).then(()=>cm.textContent='Copied').catch(()=>{const s=getSelection();const rg=document.createRange();rg.selectNodeContents($('#mailAddr',p));s.removeAllRanges();s.addRange(rg);cm.textContent='Selected';});});}
  }

  // ---------- motion ----------
  const AUTO='.phero .wrap > *,.sec-head,.statement,.opp,.steps > li,.rule-list > li,.tbl-wrap,.person,.nextrow > a,.pj-card,.pj-detail,.g2 > .cell,.g3 > .cell,.g4 > .cell,.platforms > a,.case-art,.case-copy > *,.split > .stack,.prose > p,.notice,.panel,.offices > .cell,.stats > div,.explore > a';
  function countIn(root){
    const els=root.matches&&root.matches('[data-count]')?[root]:$$('[data-count]',root);
    els.forEach(el=>{if(el.dataset.done)return;el.dataset.done=1;const to=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),pre=el.dataset.pre||'',suf=el.dataset.suf||'';const fmt=v=>pre+v.toFixed(dec)+suf;const t0=performance.now(),D=1700;
      (function f(t){const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,4);el.textContent=fmt(to*e);if(k<1)requestAnimationFrame(f);else el.textContent=fmt(to);})(t0);});
  }
  function motion(p,later){
    if(!MO)return;
    $$('.stats .v',p).forEach(v=>{const t=v.textContent.trim();if(!v.dataset.count&&/^\d+$/.test(t))v.dataset.count=t;});
    const set=new Set();
    $$('[data-rv]',p).forEach(e=>set.add(e));
    $$('[data-rv-group]',p).forEach(g=>[...g.children].forEach(c=>set.add(c)));
    $$(AUTO,p).forEach(e=>{if(!e.closest('.hero'))set.add(e);});
    const list=[...set].sort((a,b)=>(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)?-1:1);
    const cnt=new Map();
    list.forEach(e=>{if(e.parentElement.closest('.rv'))return;e.classList.add('rv');const pe=e.parentElement;const k=cnt.get(pe)||0;cnt.set(pe,k+1);e.style.setProperty('--d',Math.min(k,7));});
    const obs=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const t=en.target;t.classList.add('in');if(t.tagName.toLowerCase()==='svg')t.classList.add('play');obs.unobserve(t);countIn(t);}),{rootMargin:'0px 0px -6% 0px',threshold:.06});
    $$('.rv,[data-rv-group],svg.iso,[data-count]',p).forEach(e=>obs.observe(e));
    later.push(()=>obs.disconnect());
    // hero: tilt and drift with the pointer
    const ha=$('#heroArt',p),hero=$('.hero',p);
    if(ha&&hero&&matchMedia('(pointer:fine)').matches){
      hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        ha.style.setProperty('--tx',(x*-16).toFixed(1)+'px');ha.style.setProperty('--ty',(y*-10).toFixed(1)+'px');ha.style.setProperty('--ry',(x*7).toFixed(2)+'deg');ha.style.setProperty('--rx',(y*-5).toFixed(2)+'deg');});
      hero.addEventListener('pointerleave',()=>['--tx','--ty','--rx','--ry'].forEach(pr=>ha.style.removeProperty(pr)));
    }
  }

  // ---------- page lifecycle ----------
  let cur=null, cleanups=[];
  function page(){
    const p=$('main .page'); if(!p||p===cur)return false;
    cleanups.forEach(f=>f()); cleanups=[]; cur=p;
    document.body.dataset.page=p.id;
    const g=p.dataset.group;
    $$('.head-links a').forEach(a=>a.classList.toggle('on',a.dataset.group===g));
    closeMenu();
    $$('.phero',p).forEach(ph=>{if(!$('canvas',ph)){const c=document.createElement('canvas');c.className='plotbg';c.dataset.land='plan';c.setAttribute('aria-hidden','true');ph.prepend(c);}});
    carousel(p,cleanups); projects(p); thesis(p,cleanups); contact(p); motion(p,cleanups);
    onScroll();
    requestAnimationFrame(drawAll);
    return true;
  }
  window.AT={page:page,closeMenu:closeMenu};
  page();
})();
