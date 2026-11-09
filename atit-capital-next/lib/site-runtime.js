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
  function endMenu(){overlay.classList.remove('show','closing');document.body.style.overflow='';}
  let menuTimer=0;
  function closeMenu(){if(!overlay.classList.contains('show')||overlay.classList.contains('closing'))return;openBtn.setAttribute('aria-expanded','false');if(RM){endMenu();return;}overlay.classList.add('closing');menuTimer=setTimeout(endMenu,620);}
  openBtn.addEventListener('click',()=>{clearTimeout(menuTimer);overlay.classList.remove('closing');overlay.classList.add('show');openBtn.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';closeBtn.focus();});
  closeBtn.addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  $$('.ov-main > li > button').forEach(b=>b.addEventListener('click',()=>{const li=b.parentElement;const o=li.classList.contains('open');$$('.ov-main > li').forEach(x=>x.classList.remove('open'));if(!o)li.classList.add('open');}));
  $$('.overlay a').forEach(a=>a.addEventListener('click',closeMenu));

  // ---------- to top, header state, reading progress ----------
  const tt=$('#toTop'), hd=$('header.site');
  function onScroll(){const y=scrollY;tt.classList.toggle('show',y>900);document.body.classList.toggle('scrolled',y>40);const m=document.documentElement.scrollHeight-innerHeight;hd.style.setProperty('--sp',m>0?Math.min(1,y/m).toFixed(4):0);}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  tt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // ---------- cookie notice ----------
  const cb=$('#cookieBanner'), CK='atit-capital-cookie-notice';
  let ckSet=false; try{ckSet=localStorage.getItem(CK)==='set';}catch(e){}
  if(cb&&!ckSet){
    cb.classList.add('show');
    $$('button',cb).forEach(b=>b.addEventListener('click',()=>{try{localStorage.setItem(CK,'set');}catch(e){}cb.classList.remove('show');}));
  }

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
  let heroStoryLoad=null;
  function heroStory(p,later){
    const host=$('#heroArt',p); if(!host)return;
    let dead=false, stop=null;
    const start=()=>{if(!dead&&window.ATHeroStory)stop=window.ATHeroStory(host);};
    const load=()=>{
      if(dead)return;
      if(!heroStoryLoad)heroStoryLoad=new Promise((res,rej)=>{const s=document.createElement('script');s.src='/hero-story.js?v=2';s.async=true;s.onload=res;s.onerror=rej;document.head.appendChild(s);});
      heroStoryLoad.then(start,()=>{});
    };
    load();
    later.push(()=>{dead=true;if(stop)stop();});
  }
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
  const GLIDE={duration:680,easing:'cubic-bezier(.4,0,.2,1)'};
  function projects(p,later){
    const g=$('#pjGrid',p); if(!g)return;
    const bs=$$('.pj-filters button',p), cards=$$('.pj-card',g), cnt=$('#pjCount',p);
    const panel=new Map(cards.map(c=>[c,c.nextElementSibling])), open=new Set();
    let moving=[], ghost=null, run=0;
    // Browsers restart an animation when a hidden element is shown, so once a drawing has built it stays built.
    $$('svg.iso',g).forEach(s=>{if(s.closest('.pj-detail'))s.classList.add('settled');});
    const keepBuilt=()=>cards.forEach(c=>{const s=$('svg.iso',c);if(s&&s.classList.contains('play'))s.classList.add('settled');});
    // The full view takes the card's place at the top of its row; nothing above it moves.
    function seat(c){const d=panel.get(c),top=c.offsetTop;cards.find(x=>!x.hidden&&x.offsetTop===top).before(d);c.hidden=true;d.hidden=false;}
    function relayout(){const list=cards.filter(c=>open.has(c));list.forEach(c=>{panel.get(c).hidden=true;c.hidden=false;});list.forEach(seat);}
    function finish(c){const d=panel.get(c);open.delete(c);d.hidden=true;c.hidden=false;c.setAttribute('aria-expanded','false');}
    function settle(){moving.forEach(a=>a.cancel());moving=[];if(ghost){ghost.remove();ghost=null;}g.classList.remove('pj-moving');document.documentElement.style.overflowAnchor='';}
    const seen=()=>[...cards,...panel.values()].filter(e=>!e.hidden);
    const inset=(small,large)=>`inset(${small.top-large.top}px ${large.right-small.right}px ${large.bottom-small.bottom}px ${small.left-large.left}px)`;
    // Measure, change the layout once, then glide every piece from where it was.
    function glide(change,out,inn,growing){
      if(RM){settle();change();return;}
      const box=g.getBoundingClientRect(), from=new Map(seen().map(e=>[e,e.getBoundingClientRect()])), was=from.get(out)||out.getBoundingClientRect();
      const copy=out.cloneNode(true);
      settle();
      document.documentElement.style.overflowAnchor='none';
      change();
      const nowH=g.getBoundingClientRect().height, to=inn.getBoundingClientRect(), id=++run, add=(e,k,o)=>moving.push(e.animate(k,o||GLIDE));
      g.classList.add('pj-moving');
      copy.removeAttribute('id');copy.hidden=false;copy.classList.add('pj-ghost');copy.setAttribute('aria-hidden','true');copy.tabIndex=-1;
      Object.assign(copy.style,{left:was.left-box.left+'px',top:was.top-box.top+'px',width:was.width+'px',height:was.height+'px'});
      g.append(copy);ghost=copy;
      add(g,[{height:box.height+'px'},{height:nowH+'px'}]);
      seen().forEach(e=>{if(e===inn)return;const a=from.get(e);if(!a)return;const b=e.getBoundingClientRect(),x=a.left-b.left,y=a.top-b.top;if(Math.abs(x)>.5||Math.abs(y)>.5)add(e,[{transform:`translate(${x}px,${y}px)`},{transform:'translate(0,0)'}]);});
      if(growing){
        add(inn,[{clipPath:inset(was,to),opacity:0},{opacity:1,offset:.55},{clipPath:'inset(0px 0px 0px 0px)',opacity:1}]);
        add(copy,[{opacity:1},{opacity:0,offset:.45},{opacity:0}]);
      }else{
        add(copy,[{clipPath:'inset(0px 0px 0px 0px)',opacity:1},{opacity:1,offset:.4},{clipPath:inset(to,was),opacity:0}]);
        add(inn,[{opacity:0},{opacity:0,offset:.4},{opacity:1}]);
      }
      Promise.all(moving.map(a=>a.finished)).then(()=>{if(id===run)settle();}).catch(()=>{});
    }
    function show(c,keyboard){const d=panel.get(c);keepBuilt();const own=$('svg.iso',c);if(own)own.classList.add('settled');glide(()=>{seat(c);open.add(c);c.setAttribute('aria-expanded','true');},c,d,true);if(keyboard)d.focus({preventScroll:true});}
    function shut(c,keyboard){const d=panel.get(c);glide(()=>{finish(c);relayout();},d,c,false);if(keyboard)c.focus({preventScroll:true});}
    cards.forEach(c=>{
      const d=panel.get(c);
      c.setAttribute('aria-expanded','false');
      c.addEventListener('click',e=>{e.preventDefault();show(c,e.detail===0);});
      d.tabIndex=0;
      d.addEventListener('click',()=>{if(!String(getSelection()))shut(c,false);});
      d.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();shut(c,true);}});
    });
    bs.forEach(b=>b.addEventListener('click',()=>{keepBuilt();settle();[...open].forEach(finish);const f=b.dataset.f; bs.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false')); let n=0; cards.forEach(c=>{const on=f==='all'||c.dataset.tags.split(' ').includes(f); c.hidden=!on; if(on)n++;}); cnt.textContent=n+(n===1?' project':' projects');}));
    let width=innerWidth;
    const reflow=()=>{if(innerWidth===width)return;width=innerWidth;settle();relayout();};
    // Links such as /projects#proj-reno arrive with that project open and in view.
    const fromHash=()=>{const hash=decodeURIComponent(location.hash.slice(1)), target=hash&&$('#'+CSS.escape(hash),g), c=target&&cards.find(x=>panel.get(x)===target);if(!c)return;settle();if(!open.has(c)){seat(c);open.add(c);c.setAttribute('aria-expanded','true');}target.scrollIntoView({behavior:'auto',block:'start'});};
    fromHash();
    window.addEventListener('hashchange',fromHash);
    window.addEventListener('resize',reflow);
    later.push(()=>{settle();window.removeEventListener('hashchange',fromHash);window.removeEventListener('resize',reflow);});
  }
  function thesis(p,later){
    if(RM)return;
    // Numbers count up to exactly the text already on the page.
    const NUM=/\d[\d,]*(?:\.\d+)?/g;
    const like=(tok,v)=>{const dec=(tok.split('.')[1]||'').length;if(!tok.includes(','))return v.toFixed(dec);return v.toLocaleString(/^\d{1,2}(,\d{2})+,\d{3}/.test(tok)?'en-IN':'en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});};
    const shown=(text,k)=>text.replace(NUM,tok=>like(tok,parseFloat(tok.replace(/,/g,''))*k));
    const finals=new Map();
    function count(el,wait){const final=finals.get(el);const t0=performance.now()+wait,D=1500;(function f(now){const k=Math.max(0,Math.min(1,(now-t0)/D));if(k>=1){el.textContent=final;return;}el.textContent=shown(final,1-Math.pow(1-k,3));requestAnimationFrame(f);})(performance.now());}
    const blocks=$$('.tp-anim,.tp-stats > div,.tp-conv > div',p);
    const counters=b=>$$(b.matches('.tp-anim')?'.tp-big,.c-big':'b',b);
    blocks.forEach(b=>{
      counters(b).forEach(el=>{finals.set(el,el.textContent);el.textContent=shown(el.textContent,0);});
      if(!b.matches('.tp-anim'))return;
      b.classList.add('pre');
      $$('.grow,.growx',b).forEach((e,i)=>{e.style.transitionDelay=i*110+'ms';});
      $$('.c-val,.c-gap',b).forEach((e,i)=>{e.style.transitionDelay=450+i*110+'ms';});
      $$('.c-dot.on',b).forEach((e,i)=>{e.style.transitionDelay=i*20+'ms';});
      $$('.c-pl',b).forEach((e,i)=>{e.style.transitionDelay=i*9+'ms';});
      $$('.grow-arc',b).forEach(e=>{e.style.strokeDasharray='0 '+e.getAttribute('stroke-dasharray').split(' ')[1];});
    });
    function play(b){b.classList.remove('pre');$$('.grow-arc',b).forEach(e=>{e.style.strokeDasharray='';});counters(b).forEach((el,i)=>count(el,i*120));}
    // Each block plays the first time it is reached, and never again on this visit.
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);play(e.target);}}),{threshold:.2,rootMargin:'0px 0px -8% 0px'});
    blocks.forEach(b=>io.observe(b));
    const forPrint=()=>{blocks.forEach(b=>{b.classList.remove('pre');$$('.grow-arc',b).forEach(e=>{e.style.strokeDasharray='';});});finals.forEach((v,el)=>{el.textContent=v;});$$('.rv',p).forEach(e=>e.classList.add('in'));};
    window.addEventListener('beforeprint',forPrint);
    later.push(()=>{io.disconnect();window.removeEventListener('beforeprint',forPrint);});
  }
  function reports(p){
    const more=$('#reportsMore',p); if(!more)return;
    const list=$('.tp-reports',p), extra=$$('.tp-reports li[hidden]',p), labelMore=more.textContent, labelLess=more.dataset.less;
    let shown=false, moving=[];
    more.setAttribute('aria-expanded','false');
    more.addEventListener('click',()=>{
      const was=list.getBoundingClientRect().height;
      moving.forEach(a=>a.cancel());moving=[];
      shown=!shown;
      more.textContent=shown?labelLess:labelMore;
      more.setAttribute('aria-expanded',String(shown));
      extra.forEach(li=>{li.hidden=!shown;});
      if(RM)return;
      const now=list.getBoundingClientRect().height;
      if(!shown)extra.forEach(li=>{li.hidden=false;});
      list.style.overflow='clip';
      const a=list.animate([{height:was+'px'},{height:now+'px'}],GLIDE); moving.push(a);
      extra.forEach(li=>moving.push(li.animate(shown?[{opacity:0},{opacity:0,offset:.2},{opacity:1}]:[{opacity:1},{opacity:0,offset:.7},{opacity:0}],GLIDE)));
      const was2=shown;
      a.finished.then(()=>{if(was2!==shown)return;if(!shown)extra.forEach(li=>{li.hidden=true;});list.style.overflow='';moving=[];}).catch(()=>{});
    });
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
  const AUTO='.phero .wrap > *,.sec-head,.statement,.opp,.steps > li,.rule-list > li,.tbl-wrap,.person,.nextrow > a,.pj-card,.g2 > .cell,.g3 > .cell,.g4 > .cell,.platforms > a,.case-art,.case-copy > *,.split > .stack,.prose > p,.notice,.panel,.offices > .cell,.stats > div,.explore > a,.tp-h,.tp-summary,.tp-sub,.tp-rails > div,.tp-bb-art,.tp-tile,.tp-stats > div,.tp-conv-art,.tp-conv > div,.tp-focus > a,.tp-theme,.tp-sdg > div,.tp-note,.tp-closer,.tp-closer-sub,.tp-close .tp-src,.tp-close .actions,.tp-miles > div,.tp-contact a,.tp-disc';
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
    const pageName=$('#pageName'); if(pageName){const here=$('.crumbs > span:last-child',p);pageName.textContent=here?here.textContent:'Home';}
    carousel(p,cleanups); heroStory(p,cleanups); projects(p,cleanups); thesis(p,cleanups); reports(p); contact(p); motion(p,cleanups);
    onScroll();
    requestAnimationFrame(drawAll);
    return true;
  }
  window.AT={page:page,closeMenu:closeMenu};
  page();
})();
