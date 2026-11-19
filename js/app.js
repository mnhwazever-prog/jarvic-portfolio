let cfg={name:"S.R.",tag:"",planets:true,sections:[],designs:[],cs:{title:"Case Study",images:[]},socials:[]},list=[],li=0,sound=false;
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const safe=u=>/^(https:|images\/|audio\/)/.test(u)?u:"#";
function render(){
 $("#nm").textContent=cfg.name;$("#tg").textContent=cfg.tag;
 document.querySelectorAll(".pl").forEach(p=>p.style.display=cfg.planets?"":"none");
 $("#strips").innerHTML=cfg.sections.map(s=>{const t=`<span>${esc(s.name)} ✦</span>`.repeat(8);return `<div class="strip" data-s="${s.id}">${t}${t}</div>`}).join("");
 $("#work").innerHTML=cfg.sections.map(s=>{const ds=cfg.designs.filter(d=>d.sec===s.id).sort((a,b)=>(a.order||0)-(b.order||0));
  const one=ds.map((d,i)=>`<figure data-s="${s.id}" data-i="${i}"><img src="${safe(d.src)}" alt="${esc(d.title)}"><figcaption>${esc(d.title)}</figcaption></figure>`).join(""),reps=Math.max(1,Math.ceil(6/Math.max(ds.length,1))),half=one.repeat(reps),dur=Math.max(20,ds.length*reps*6);
  return `<div class="sec rv" id="sec-${s.id}"><h2>${esc(s.name)}</h2>`+(ds.length?`<div class="gal"><div class="trk" style="--d:${dur}s">${half}${half}${half}</div></div>`:`<p class="empty">Coming soon</p>`)+`</div>`}).join("");
 $("#cst").textContent=cfg.cs.title;$("#case").innerHTML=cfg.cs.images.map(u=>`<img loading="lazy" src="${safe(u)}" alt="">`).join("")||'<p class="empty">Coming soon</p>';
 $("#soc").innerHTML=cfg.socials.map(s=>`<a href="${safe(s.u)}" target="_blank" rel="noopener">${esc(s.n)}</a>`).join("");
 io();
}
const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("in")),{threshold:.1});
function io(){document.querySelectorAll(".rv").forEach(e=>obs.observe(e))}
document.addEventListener("click",e=>{
 const f=e.target.closest("figure[data-i]");
 if(f){list=cfg.designs.filter(d=>d.sec===f.dataset.s).sort((a,b)=>(a.order||0)-(b.order||0));li=+f.dataset.i;show();return}
 const s=e.target.closest(".strip");if(s){document.getElementById("sec-"+s.dataset.s)?.scrollIntoView({behavior:"smooth"})}
});
function show(){$("#lb").classList.add("on");$("#lb img").src=safe(list[li].src);beep()}
const nav=d=>{li=(li+d+list.length)%list.length;show()};
$("#lb .x").onclick=()=>$("#lb").classList.remove("on");$("#lb .l").onclick=()=>nav(-1);$("#lb .r").onclick=()=>nav(1);
addEventListener("keydown",e=>{if(!$("#lb").classList.contains("on"))return;if(e.key=="Escape")$("#lb .x").click();if(e.key=="ArrowLeft")nav(-1);if(e.key=="ArrowRight")nav(1)});
/* الأغنية: تشتغل عند الضغط على زر الصوت لو فيه أغنية مرفوعة من لوحة التحكم */
let bgm=null;
function music(){
 const src=cfg.music?safe(cfg.music):"#";
 if(!sound||src==="#"){if(bgm)bgm.pause();return}
 if(!bgm||bgm._s!==src){if(bgm)bgm.pause();bgm=new Audio(src);bgm._s=src;bgm.loop=true;bgm.volume=.5}
 bgm.play().catch(()=>{})
}
document.addEventListener("visibilitychange",()=>{if(!bgm)return;if(document.hidden)bgm.pause();else if(sound)bgm.play().catch(()=>{})});
$("#snd").onclick=()=>{sound=!sound;$("#snd").textContent=sound?"🔊 Sound on":"🔇 Sound off";if(sound)beep();music()};
function beep(){if(!sound)return;try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.frequency.value=520;g.gain.value=.03;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.08)}catch(e){}}

render();
fetch("data/site.json",{cache:"no-cache"}).then(r=>r.json()).then(j=>{cfg=j;render();music()}).catch(e=>console.error(e));

/* ===== شريط التصميمات: حركة تلقائية + سحب بالإصبع/الماوس + الضغط على أي تصميم ===== */
(()=>{
 if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
 const SP=45,WAIT=2500; /* SP سرعة الحركة التلقائية (بكسل/ثانية)، WAIT مدة التوقف بعد لمسك (مللي ثانية) */
 let last=performance.now();
 const gal=e=>e.target.closest?e.target.closest(".gal"):null;
 const hold=e=>{const g=gal(e);if(g)g._p=performance.now()+WAIT};
 ["touchstart","touchmove","touchend","wheel","pointerdown"].forEach(n=>document.addEventListener(n,hold,{passive:true}));
 document.addEventListener("pointerover",e=>{if(e.pointerType!=="mouse")return;const g=gal(e);if(g)g._hv=true});
 document.addEventListener("pointerout",e=>{if(e.pointerType!=="mouse")return;const g=gal(e);if(g&&!g.contains(e.relatedTarget))g._hv=false});
 /* سحب بالماوس على الكمبيوتر */
 let dg=null;
 document.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")return;const g=gal(e);if(g)dg={g,x:e.clientX,l:g.scrollLeft,m:false}});
 addEventListener("pointermove",e=>{if(!dg)return;const dx=e.clientX-dg.x;if(Math.abs(dx)>5)dg.m=true;if(dg.m){dg.g.scrollLeft=dg.l-dx;dg.g._p=performance.now()+WAIT}});
 addEventListener("pointerup",()=>{if(dg&&dg.m)dg.g._nc=performance.now()+80;dg=null});
 document.addEventListener("click",e=>{const g=gal(e);if(g&&performance.now()<(g._nc||0)){e.stopImmediatePropagation();e.preventDefault()}},true);
 addEventListener("resize",()=>document.querySelectorAll(".gal").forEach(g=>g._h=0));
 const vis=new IntersectionObserver(es=>es.forEach(x=>x.target._v=x.isIntersecting));
 const tick=now=>{
  const dt=Math.min(.05,(now-last)/1000);last=now;
  document.querySelectorAll(".gal").forEach(g=>{
   const t=g.firstElementChild;if(!t)return;
   if(!g._o){g._o=1;vis.observe(g)}
   if(!g._i){if(![...t.querySelectorAll("img")].every(i=>i.complete))return;g._h=(t.scrollWidth+14)/3;if(!g._h)return;g._i=1;g.scrollLeft=g._x=g._h}
   if(!g._h)g._h=(t.scrollWidth+14)/3;
   if(g._v===false)return;
   if(now<(g._p||0)||g._hv){g._x=g.scrollLeft;return}
   const h=g._h;let x=g._x+SP*dt;
   if(x>=1.5*h)x-=h;else if(x<.5*h)x+=h;
   g._x=x;g.scrollLeft=x});
  requestAnimationFrame(tick)};
 requestAnimationFrame(tick);
})();

/* ===== حركة الكواكب والنجوم (تتفاعل مع اللمس والماوس) ===== */
(()=>{
 const hero=document.querySelector(".hero");
 if(!hero||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
 /* للتحكم: SPEED سرعة الحركة، RANGE مدى الحركة، PUSH قوة الدفع عند اللمس، R نطاق التأثير بالبكسل */
 const SPEED=1.5,RANGE=1.4,PUSH=1.2,R=170;
 const rnd=(a,b)=>a+Math.random()*(b-a);
 const add=(cls,style)=>{const e=document.createElement("i");e.className=cls;if(style)e.style.cssText=style;hero.appendChild(e);return e};
 add("pl p5");add("pl p6");const moon=add("pl moon");
 for(let i=0;i<22;i++){const s=rnd(2,5);add("pl st",`left:${rnd(0,100)}%;top:${rnd(0,100)}%;width:${s}px;height:${s}px;animation-delay:${-rnd(0,4)}s`)}
 add("shoot");add("shoot s2");
 hero.classList.add("phys");
 let bodies=[],mx=-1e4,my=-1e4,run=true,last=performance.now();
 const measure=()=>bodies.forEach(b=>{b.cx=b.el.offsetLeft+b.el.offsetWidth/2;b.cy=b.el.offsetTop+b.el.offsetHeight/2;b.r=b.el.offsetWidth/2});
 bodies=[...hero.querySelectorAll(".pl:not(.moon)")].map(el=>{const st=el.classList.contains("st");
  return{el,st,p1:el.classList.contains("p1"),cx:0,cy:0,r:0,px:0,py:0,vx:0,vy:0,
   ax:st?rnd(6,16):rnd(50,110)*RANGE,ay:st?rnd(6,16):rnd(40,90)*RANGE,
   fx:rnd(.12,.3)*SPEED,fy:rnd(.1,.28)*SPEED,a:rnd(0,6.28),b:rnd(0,6.28),k:st?.5:1}});
 measure();addEventListener("resize",measure);addEventListener("load",measure);
 const pos=(x,y)=>{const r=hero.getBoundingClientRect();mx=x-r.left;my=y-r.top};
 hero.addEventListener("pointermove",e=>pos(e.clientX,e.clientY));
 hero.addEventListener("touchmove",e=>{const t=e.touches[0];if(t)pos(t.clientX,t.clientY)},{passive:true});
 const leave=()=>{mx=my=-1e4};
 hero.addEventListener("pointerleave",leave);hero.addEventListener("touchend",leave);hero.addEventListener("pointercancel",leave);
 /* لمسة سريعة = دفعة قوية للأجسام القريبة */
 hero.addEventListener("pointerdown",e=>{pos(e.clientX,e.clientY);const t=performance.now()/1000;
  bodies.forEach(b=>{const x=b.cx+Math.sin(t*b.fx+b.a)*b.ax+b.px,y=b.cy+Math.cos(t*b.fy+b.b)*b.ay+b.py,dx=x-mx,dy=y-my,d=Math.hypot(dx,dy)||1;
   if(d<320){const f=(1-d/320)*900*PUSH*(b.st?.4:1);b.vx+=dx/d*f;b.vy+=dy/d*f}})});
 const frame=now=>{
  if(!run)return;
  const dt=Math.min(.05,(now-last)/1000),t=now/1000;last=now;
  let p1x=0,p1y=0;
  for(const b of bodies){
   if(!b.r&&!b.st)continue;
   const gx=Math.sin(t*b.fx+b.a)*b.ax,gy=Math.cos(t*b.fy+b.b)*b.ay;
   const dx=b.cx+gx+b.px-mx,dy=b.cy+gy+b.py-my,d=Math.hypot(dx,dy)-b.r;
   if(d<R&&d>-b.r){const f=Math.pow(1-Math.max(d,0)/R,2)*2600*PUSH*dt*(b.st?.3:1),n=Math.hypot(dx,dy)||1;b.vx+=dx/n*f;b.vy+=dy/n*f}
   b.vx-=b.px*6*dt*b.k;b.vy-=b.py*6*dt*b.k;
   const dm=Math.exp(-3*dt);b.vx*=dm;b.vy*=dm;b.px+=b.vx*dt;b.py+=b.vy*dt;
   const tx=gx+b.px,ty=gy+b.py;
   b.el.style.transform=`translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0)`;
   if(b.p1){p1x=b.cx+tx;p1y=b.cy+ty}
  }
  /* قمر يدور حول الكوكب الأحمر */
  if(p1x){const a=t*1.1*SPEED,h=moon.offsetWidth/2;
   moon.style.transform=`translate3d(${(p1x+Math.cos(a)*95-h).toFixed(1)}px,${(p1y+Math.sin(a)*38-h).toFixed(1)}px,0)`}
  requestAnimationFrame(frame)};
 new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!run){run=true;last=performance.now();requestAnimationFrame(frame)}run=v}).observe(hero);
 requestAnimationFrame(frame);
})();
