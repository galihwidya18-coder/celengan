/* Cemerlang.id · perilaku bersama di semua halaman: format rupiah,
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

/* ---------- polesan Motion: umpan-balik tekan & kedip hasil kalkulator ----------
   Progressive enhancement murni: kalau CDN gagal dimuat, browser tak dukung
   dynamic import, atau pengguna minta gerak berkurang, situs tetap berjalan
   persis seperti sebelumnya. Tidak menyentuh logika kalkulator/kuis/nav yang
   sudah ada, dan tidak mengganti sistem reveal-siap/reveal-jalan di atas
   (sebagian besar .catatan/.gulir/.kasus/.dua-kolom sudah ikut muncul halus
   karena berada di dalam .bab yang sudah di-reveal, jadi menambah reveal
   terpisah untuk anak-anaknya cuma bikin dobel animasi). */
(function(){
  var kurangGerak = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(kurangGerak)return;

  import("https://cdn.jsdelivr.net/npm/framer-motion@13.4.0/dom/+esm").then(function(mod){
    var animate = mod.animate;
    if(!animate)return;

    /* umpan-balik tekan: sedikit mengecil saat ditekan, pegas balik saat lepas.
       Delegasi lewat document supaya elemen yang dirender belakangan (opsi kuis,
       hasil kalkulator) tetap kebagian, tanpa perlu pasang ulang listener. */
    var selTekan = ".tombol, .opsi, .modul-nav a, .kartu-jalur, .ke-atas, .progres a, .subnav a";
    function bersihkan(el){ try{ el.style.transform=""; }catch(e){} }
    function tekan(e){
      var el = e.target.closest ? e.target.closest(selTekan) : null;
      if(!el || el.disabled)return;
      animate(el, {scale:0.96}, {type:"spring", stiffness:500, damping:30});
    }
    function lepas(e){
      var el = e.target.closest ? e.target.closest(selTekan) : null;
      if(!el)return;
      var ctrl = animate(el, {scale:1}, {type:"spring", stiffness:400, damping:26});
      if(ctrl && ctrl.finished && ctrl.finished.then) ctrl.finished.then(function(){ bersihkan(el); })["catch"](function(){});
    }
    document.addEventListener("pointerdown", tekan, {passive:true});
    document.addEventListener("pointerup", lepas, {passive:true});
    document.addEventListener("pointerleave", lepas, true);
    document.addEventListener("pointercancel", lepas, {passive:true});

    /* kedip halus saat angka hasil kalkulator berubah, penanda alat "hidup" */
    if("MutationObserver" in window){
      var selHasil = ".hasil-utama, .hasil-baris span:last-child, .verdict";
      var simpulHasil = document.querySelectorAll(selHasil);
      if(simpulHasil.length){
        var terpakai = false;
        var mo = new MutationObserver(function(muts){
          var kena = [];
          muts.forEach(function(m){
            var n = m.target.nodeType===3 ? m.target.parentElement : m.target;
            var el = n && n.closest ? n.closest(selHasil) : null;
            if(el && kena.indexOf(el)===-1)kena.push(el);
          });
          kena.forEach(function(el){
            var ctrl = animate(el, {opacity:[1,0.5,1]}, {duration:0.3, easing:"ease-out"});
            if(ctrl && ctrl.finished && ctrl.finished.then) ctrl.finished.then(function(){ try{el.style.opacity="";}catch(e){} })["catch"](function(){});
          });
        });
        simpulHasil.forEach(function(el){ mo.observe(el,{childList:true,characterData:true,subtree:true}); });
        terpakai = true; void terpakai;
      }
    }
  })["catch"](function(){ /* CDN/dynamic import gagal — abaikan, tak mempengaruhi fitur lain */ });
})();

return {$:$, rp:rp, num:num, pasangMask:pasangMask, bulanKeTeks:bulanKeTeks};
})();
