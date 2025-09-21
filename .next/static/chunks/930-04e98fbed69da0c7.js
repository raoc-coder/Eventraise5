"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[930],{8203:function(e,t,r){r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(2898).Z)("Calendar",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}]])},9883:function(e,t,r){r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(2898).Z)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])},2851:function(e,t,r){r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(2898).Z)("Sparkles",[["path",{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",key:"17u4zn"}],["path",{d:"M5 3v4",key:"bklmnn"}],["path",{d:"M19 17v4",key:"iiml17"}],["path",{d:"M3 5h4",key:"nem4j1"}],["path",{d:"M17 19h4",key:"lbex7p"}]])},797:function(e,t,r){r.r(t),r.d(t,{Providers:function(){return d},useAuth:function(){return l}});var a=r(7437),i=r(2265),o=r(7440),s=r(5925);let n=(0,i.createContext)({user:null,loading:!0,signOut:async()=>{}}),l=()=>{let e=(0,i.useContext)(n);if(!e)throw Error("useAuth must be used within an AuthProvider");return e};function d(e){let{children:t}=e,[r,l]=(0,i.useState)(null),[d,c]=(0,i.useState)(!0),[u,p]=(0,i.useState)(null);(0,i.useEffect)(()=>{try{let e="https://placeholder.supabase.co",t="placeholder_anon_key";if(!e||!t){console.error("Missing Supabase environment variables"),c(!1);return}let r=(0,o.eI)(e,t);p(r)}catch(e){console.error("Failed to initialize Supabase client:",e),c(!1)}},[]),(0,i.useEffect)(()=>{if(!u)return;(async()=>{try{let{data:{user:e}}=await u.auth.getUser();l(e),c(!1)}catch(e){console.error("Failed to get user:",e),c(!1)}})();let{data:{subscription:e}}=u.auth.onAuthStateChange(async(e,t)=>{var r;l(null!==(r=null==t?void 0:t.user)&&void 0!==r?r:null),c(!1)});return()=>e.unsubscribe()},[u]);let f=async()=>{u&&await u.auth.signOut()};return(0,a.jsxs)(n.Provider,{value:{user:r,loading:d,signOut:f},children:[t,(0,a.jsx)(s.x7,{position:"top-right"})]})}},5754:function(e,t,r){r.d(t,{z:function(){return l}});var a=r(7437),i=r(2265),o=r(6061),s=r(1657);let n=(0,o.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),l=i.forwardRef((e,t)=>{let{className:r,variant:i,size:o,asChild:l=!1,...d}=e;return(0,a.jsx)("button",{className:(0,s.cn)(n({variant:i,size:o,className:r})),ref:t,...d})});l.displayName="Button"},7815:function(e,t,r){r.d(t,{Ol:function(){return n},SZ:function(){return d},Zb:function(){return s},aY:function(){return c},ll:function(){return l}});var a=r(7437),i=r(2265),o=r(1657);let s=i.forwardRef((e,t)=>{let{className:r,...i}=e;return(0,a.jsx)("div",{ref:t,className:(0,o.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",r),...i})});s.displayName="Card";let n=i.forwardRef((e,t)=>{let{className:r,...i}=e;return(0,a.jsx)("div",{ref:t,className:(0,o.cn)("flex flex-col space-y-1.5 p-6",r),...i})});n.displayName="CardHeader";let l=i.forwardRef((e,t)=>{let{className:r,...i}=e;return(0,a.jsx)("h3",{ref:t,className:(0,o.cn)("text-2xl font-semibold leading-none tracking-tight",r),...i})});l.displayName="CardTitle";let d=i.forwardRef((e,t)=>{let{className:r,...i}=e;return(0,a.jsx)("p",{ref:t,className:(0,o.cn)("text-sm text-muted-foreground",r),...i})});d.displayName="CardDescription";let c=i.forwardRef((e,t)=>{let{className:r,...i}=e;return(0,a.jsx)("div",{ref:t,className:(0,o.cn)("p-6 pt-0",r),...i})});c.displayName="CardContent",i.forwardRef((e,t)=>{let{className:r,...i}=e;return(0,a.jsx)("div",{ref:t,className:(0,o.cn)("flex items-center p-6 pt-0",r),...i})}).displayName="CardFooter"},1657:function(e,t,r){r.d(t,{cn:function(){return o}});var a=r(7042),i=r(4769);function o(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,i.m6)((0,a.W)(t))}},5925:function(e,t,r){let a,i;r.d(t,{x7:function(){return ep},ZP:function(){return ef}});var o,s=r(2265);let n={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||n,d=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,c=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,p=(e,t)=>{let r="",a="",i="";for(let o in e){let s=e[o];"@"==o[0]?"i"==o[1]?r=o+" "+s+";":a+="f"==o[1]?p(s,o):o+"{"+p(s,"k"==o[1]?"":t)+"}":"object"==typeof s?a+=p(s,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=s&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=p.p?p.p(o,s):o+":"+s+";")}return r+(t&&i?t+"{"+i+"}":i)+a},f={},m=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+m(e[r]);return t}return e},y=(e,t,r,a,i)=>{var o;let s=m(e),n=f[s]||(f[s]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(s));if(!f[n]){let t=s!==e?e:(e=>{let t,r,a=[{}];for(;t=d.exec(e.replace(c,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);f[n]=p(i?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&f.g?f.g:null;return r&&(f.g=f[n]),o=f[n],l?t.data=t.data.replace(l,o):-1===t.data.indexOf(o)&&(t.data=a?o+t.data:t.data+o),n},h=(e,t,r)=>e.reduce((e,a,i)=>{let o=t[i];if(o&&o.call){let e=o(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":p(e,""):!1===e?"":e}return e+a+(null==o?"":o)},"");function g(e){let t=this||{},r=e.call?e(t.p):e;return y(r.unshift?r.raw?h(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}g.bind({g:1});let b,v,x,w=g.bind({k:1});function k(e,t){let r=this||{};return function(){let a=arguments;function i(o,s){let n=Object.assign({},o),l=n.className||i.className;r.p=Object.assign({theme:v&&v()},n),r.o=/ *go\d+/.test(l),n.className=g.apply(r,a)+(l?" "+l:""),t&&(n.ref=s);let d=e;return e[0]&&(d=n.as||e,delete n.as),x&&d[0]&&x(n),b(d,n)}return t?t(i):i}}var E=e=>"function"==typeof e,C=(e,t)=>E(e)?e(t):e,N=(a=0,()=>(++a).toString()),j=()=>{if(void 0===i&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");i=!e||e.matches}return i},$="default",O=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return O(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||void 0===i?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},A=[],z={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},D={},M=(e,t=$)=>{D[t]=O(D[t]||z,e),A.forEach(([e,r])=>{e===t&&r(D[t])})},P=e=>Object.keys(D).forEach(t=>M(e,t)),S=e=>Object.keys(D).find(t=>D[t].toasts.some(t=>t.id===e)),I=(e=$)=>t=>{M(t,e)},Z={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},L=(e={},t=$)=>{let[r,a]=(0,s.useState)(D[t]||z),i=(0,s.useRef)(D[t]);(0,s.useEffect)(()=>(i.current!==D[t]&&a(D[t]),A.push([t,a]),()=>{let e=A.findIndex(([e])=>e===t);e>-1&&A.splice(e,1)}),[t]);let o=r.toasts.map(t=>{var r,a,i;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||Z[t.type],style:{...e.style,...null==(i=e[t.type])?void 0:i.style,...t.style}}});return{...r,toasts:o}},R=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||N()}),_=e=>(t,r)=>{let a=R(t,e,r);return I(a.toasterId||S(a.id))({type:2,toast:a}),a.id},F=(e,t)=>_("blank")(e,t);F.error=_("error"),F.success=_("success"),F.loading=_("loading"),F.custom=_("custom"),F.dismiss=(e,t)=>{let r={type:3,toastId:e};t?I(t)(r):P(r)},F.dismissAll=e=>F.dismiss(void 0,e),F.remove=(e,t)=>{let r={type:4,toastId:e};t?I(t)(r):P(r)},F.removeAll=e=>F.remove(void 0,e),F.promise=(e,t,r)=>{let a=F.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let i=t.success?C(t.success,e):void 0;return i?F.success(i,{id:a,...r,...null==r?void 0:r.success}):F.dismiss(a),e}).catch(e=>{let i=t.error?C(t.error,e):void 0;i?F.error(i,{id:a,...r,...null==r?void 0:r.error}):F.dismiss(a)}),e};var T=1e3,H=(e,t="default")=>{let{toasts:r,pausedAt:a}=L(e,t),i=(0,s.useRef)(new Map).current,o=(0,s.useCallback)((e,t=T)=>{if(i.has(e))return;let r=setTimeout(()=>{i.delete(e),n({type:4,toastId:e})},t);i.set(e,r)},[]);(0,s.useEffect)(()=>{if(a)return;let e=Date.now(),i=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&F.dismiss(r.id);return}return setTimeout(()=>F.dismiss(r.id,t),a)});return()=>{i.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let n=(0,s.useCallback)(I(t),[t]),l=(0,s.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),d=(0,s.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),c=(0,s.useCallback)(()=>{a&&n({type:6,time:Date.now()})},[a,n]),u=(0,s.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:i=8,defaultPosition:o}=t||{},s=r.filter(t=>(t.position||o)===(e.position||o)&&t.height),n=s.findIndex(t=>t.id===e.id),l=s.filter((e,t)=>t<n&&e.visible).length;return s.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+i,0)},[r]);return(0,s.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=i.get(e.id);t&&(clearTimeout(t),i.delete(e.id))}})},[r,o]),{toasts:r,handlers:{updateHeight:d,startPause:l,endPause:c,calculateOffset:u}}},U=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,B=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Y=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,q=k("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${U} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${B} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Y} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,V=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,W=k("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${V} 1s linear infinite;
`,G=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,J=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,K=k("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${G} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${J} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Q=k("div")`
  position: absolute;
`,X=k("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ee=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,et=k("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,er=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?s.createElement(et,null,t):t:"blank"===r?null:s.createElement(X,null,s.createElement(W,{...a}),"loading"!==r&&s.createElement(Q,null,"error"===r?s.createElement(q,{...a}):s.createElement(K,{...a})))},ea=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ei=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,eo=k("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,es=k("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[a,i]=j()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ea(r),ei(r)];return{animation:t?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=s.memo(({toast:e,position:t,style:r,children:a})=>{let i=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},o=s.createElement(er,{toast:e}),n=s.createElement(es,{...e.ariaProps},C(e.message,e));return s.createElement(eo,{className:e.className,style:{...i,...r,...e.style}},"function"==typeof a?a({icon:o,message:n}):s.createElement(s.Fragment,null,o,n))});o=s.createElement,p.p=void 0,b=o,v=void 0,x=void 0;var ed=({id:e,className:t,style:r,onHeightUpdate:a,children:i})=>{let o=s.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return s.createElement("div",{ref:o,className:t,style:r},i)},ec=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:j()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},eu=g`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ep=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:i,toasterId:o,containerStyle:n,containerClassName:l})=>{let{toasts:d,handlers:c}=H(r,o);return s.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:c.startPause,onMouseLeave:c.endPause},d.map(r=>{let o=r.position||t,n=ec(o,c.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return s.createElement(ed,{id:r.id,key:r.id,onHeightUpdate:c.updateHeight,className:r.visible?eu:"",style:n},"custom"===r.type?C(r.message,r):i?i(r):s.createElement(el,{toast:r,position:o}))}))},ef=F}}]);