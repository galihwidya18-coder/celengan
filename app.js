/* Celengan — perilaku bersama di semua halaman: format rupiah,
   toggle menu mobile, tombol kembali ke atas, dan reveal saat discroll. */
window.Celengan = (function(){
"use strict";
var $=function(s){return document.getElementById(s)};

function rp(n){ if(!isFinite(n))n=0; return "Rp"+Math.round(n).toLocaleString("id-ID"); }
function num(el){ return parseFloat(String(el.value).replace(/[^\d]/g,""))||0; }
function pasangMask(id,onInput){
  var el=$(id); if(!el)return;
  el.addEventListener("input",function(){
    var v=this.value.replace(/[^\d]/g,"");
    this.value = v? Number(v).toLocaleString("id-ID") : "";
    if(onInput)onInput();
  });
}
function bulanKeTeks(m){
  m=Math.max(0,Math.round(m));
  var t=Math.floor(m/12), b=m%12, s=[];
  if(t)s.push(t+" tahun");
  if(b)s.push(b+" bulan");
  return s.length? s.join(" ") : "kurang dari sebulan";
}

/* ---------- navigasi (menu mobile + tombol ke atas) ---------- */
(function(){
  var t=$("navtoggle"), n=$("navlink");
  if(t&&n){
    t.addEventListener("click",function(){
      var buka=n.classList.toggle("buka");
      t.setAttribute("aria-expanded",buka?"true":"false");
    });
    n.addEventListener("click",function(e){
      if(e.target.tagName==="A"){ n.classList.remove("buka"); t.setAttribute("aria-expanded","false"); }
    });
  }
  var k=$("keatas");
  if(k){
    k.addEventListener("click",function(){ window.scrollTo({top:0,behavior:"smooth"}); });
    window.addEventListener("scroll",function(){ k.classList.toggle("tampil",window.scrollY>700); },{passive:true});
  }
})();

/* ---------- reveal halus saat discroll ---------- */
(function(){
  var kurangGerak = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(kurangGerak || !("IntersectionObserver" in window))return;
  var target = document.querySelectorAll(".bab, .alat, .kartu-jalur, .kuis-kartu");
  if(!target.length)return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add("reveal-jalan");
        io.unobserve(e.target);
      }
    });
  },{rootMargin:"0px 0px -8% 0px",threshold:0.1});
  target.forEach(function(el,i){
    el.classList.add("reveal-siap");
    if(el.classList.contains("kartu-jalur"))el.style.transitionDelay=(i%7*0.04)+"s";
    io.observe(el);
  });
})();

return {$:$, rp:rp, num:num, pasangMask:pasangMask, bulanKeTeks:bulanKeTeks};
})();
