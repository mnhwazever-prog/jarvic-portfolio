let cfg={name:"S.R.",tag:"",planets:true,sections:[],designs:[],cs:{title:"Case Study",images:[]},socials:[]},list=[],li=0,sound=false;
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const safe=u=>/^(https:|images\/)/.test(u)?u:"#";
function render(){
 $("#nm").textContent=cfg.name;$("#tg").textContent=cfg.tag;
 document.querySelectorAll(".pl").forEach(p=>p.style.display=cfg.planets?"":"none");
 $("#strips").innerHTML=cfg.sections.map(s=>{const t=`<span>${esc(s.name)} ✦</span>`.repeat(8);return `<div class="strip" data-s="${s.id}">${t}${t}</div>`}).join("");
 $("#work").innerHTML=cfg.sections.map(s=>{const ds=cfg.designs.filter(d=>d.sec===s.id).sort((a,b)=>(a.order||0)-(b.order||0));
  return `<div class="sec rv" id="sec-${s.id}"><h2>${esc(s.name)}</h2>`+(ds.length?`<div class="gal">${ds.map((d,i)=>`<figure data-s="${s.id}" data-i="${i}"><img loading="lazy" src="${safe(d.src)}" alt="${esc(d.title)}"><figcaption>${esc(d.title)}</figcaption></figure>`).join("")}</div>`:`<p class="empty">Coming soon</p>`)+`</div>`}).join("");
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
$("#snd").onclick=()=>{sound=!sound;$("#snd").textContent=sound?"🔊 Sound on":"🔇 Sound off"};
function beep(){if(!sound)return;try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.frequency.value=520;g.gain.value=.03;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.08)}catch(e){}}

render();
fetch("data/site.json",{cache:"no-cache"}).then(r=>r.json()).then(j=>{cfg=j;render()}).catch(e=>console.error(e));
