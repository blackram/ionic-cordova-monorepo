(self.webpackChunkionic_monorepo=self.webpackChunkionic_monorepo||[]).push([[7089],{7089:(e,s,o)=>{"use strict";o.r(s),o.d(s,{startFocusVisible:()=>c});const t="ion-focused",n=["Tab","ArrowDown","Space","Escape"," ","Shift","Enter","ArrowLeft","ArrowRight","ArrowUp"],c=()=>{let e=[],s=!0;const o=document,c=s=>{e.forEach(e=>e.classList.remove(t)),s.forEach(e=>e.classList.add(t)),e=s},i=()=>{s=!1,c([])};o.addEventListener("keydown",e=>{s=n.includes(e.key),s||c([])}),o.addEventListener("focusin",e=>{if(s&&e.composedPath){const s=e.composedPath().filter(e=>!!e.classList&&e.classList.contains("ion-focusable"));c(s)}}),o.addEventListener("focusout",()=>{o.activeElement===o.body&&c([])}),o.addEventListener("touchstart",i),o.addEventListener("mousedown",i)}}}]);