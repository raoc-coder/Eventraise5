"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[333],{797:function(e,t,r){r.r(t),r.d(t,{Providers:function(){return c},useAuth:function(){return l}});var a=r(7437),s=r(2265),i=r(7440),o=r(5925);let n=(0,s.createContext)({user:null,loading:!0,signOut:async()=>{}}),l=()=>{let e=(0,s.useContext)(n);if(!e)throw Error("useAuth must be used within an AuthProvider");return e};function c(e){let{children:t}=e,[r,l]=(0,s.useState)(null),[c,d]=(0,s.useState)(!0),[u,f]=(0,s.useState)(null);(0,s.useEffect)(()=>{try{let e="https://yxzypekwyuopbanroobr.supabase.co",t="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4enlwZWt3eXVvcGJhbnJvb2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NjI3NDksImV4cCI6MjA3NDAzODc0OX0.37JNu4brGevL3VDd9In3vxSFY49Jw6CtMZw5SZ6uaEA";if(!e||!t){console.error("Missing Supabase environment variables"),d(!1);return}let r=(0,i.eI)(e,t);f(r)}catch(e){console.error("Failed to initialize Supabase client:",e),d(!1)}},[]),(0,s.useEffect)(()=>{if(!u)return;(async()=>{try{let{data:{user:e}}=await u.auth.getUser();l(e),d(!1)}catch(e){console.error("Failed to get user:",e),d(!1)}})();let{data:{subscription:e}}=u.auth.onAuthStateChange(async(e,t)=>{var r;l(null!==(r=null==t?void 0:t.user)&&void 0!==r?r:null),d(!1)});return()=>e.unsubscribe()},[u]);let p=async()=>{u&&await u.auth.signOut()};return(0,a.jsxs)(n.Provider,{value:{user:r,loading:c,signOut:p},children:[t,(0,a.jsx)(o.x7,{position:"top-right"})]})}},9434:function(e,t,r){r.d(t,{W:function(){return c}});var a=r(7437),s=r(1396),i=r.n(s),o=r(5754),n=r(7810),l=r(797);function c(e){let{showAuth:t=!0,className:r=""}=e,{user:s,signOut:c}=(0,l.useAuth)();return(0,a.jsx)("nav",{className:"bg-black/80 backdrop-blur-md border-b border-cyan-500/20 relative z-10 ".concat(r),children:(0,a.jsx)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,a.jsxs)("div",{className:"flex justify-between h-16",children:[(0,a.jsx)("div",{className:"flex items-center",children:(0,a.jsxs)(i(),{href:"/",className:"flex items-center space-x-2",children:[(0,a.jsx)("div",{className:"w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center",children:(0,a.jsx)(n.Z,{className:"h-5 w-5 text-white"})}),(0,a.jsx)("span",{className:"text-xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent",children:"EventraiseHub"})]})}),(0,a.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,a.jsx)(i(),{href:"/events",children:(0,a.jsx)(o.z,{variant:"ghost",className:"text-cyan-400 hover:text-white hover:bg-cyan-500/20",children:"Events"})}),(0,a.jsx)(i(),{href:"/campaigns",children:(0,a.jsx)(o.z,{variant:"ghost",className:"text-cyan-400 hover:text-white hover:bg-cyan-500/20",children:"Campaigns"})}),t&&(0,a.jsx)(a.Fragment,{children:s?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(i(),{href:"/dashboard",children:(0,a.jsx)(o.z,{variant:"ghost",className:"text-cyan-400 hover:text-white hover:bg-cyan-500/20",children:"Dashboard"})}),(0,a.jsx)(o.z,{variant:"ghost",onClick:c,className:"text-cyan-400 hover:text-white hover:bg-cyan-500/20",children:"Sign Out"})]}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(i(),{href:"/auth/login",children:(0,a.jsx)(o.z,{variant:"ghost",className:"text-cyan-400 hover:text-white hover:bg-cyan-500/20",children:"Login"})}),(0,a.jsx)(i(),{href:"/auth/register",children:(0,a.jsx)(o.z,{className:"btn-primary",children:"Sign Up"})})]})})]})]})})})}},5754:function(e,t,r){r.d(t,{z:function(){return l}});var a=r(7437),s=r(2265),i=r(6061),o=r(1657);let n=(0,i.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105",destructive:"bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-400/40",outline:"border border-cyan-400/50 bg-transparent text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300",secondary:"bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-300 hover:to-orange-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-400/40",ghost:"text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300",link:"text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),l=s.forwardRef((e,t)=>{let{className:r,variant:s,size:i,asChild:l=!1,...c}=e;return(0,a.jsx)("button",{className:(0,o.cn)(n({variant:s,size:i,className:r})),ref:t,...c})});l.displayName="Button"},7815:function(e,t,r){r.d(t,{Ol:function(){return n},SZ:function(){return c},Zb:function(){return o},aY:function(){return d},ll:function(){return l}});var a=r(7437),s=r(2265),i=r(1657);let o=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("rounded-lg border border-cyan-500/20 bg-gray-800/50 backdrop-blur-sm text-white shadow-lg shadow-cyan-500/10",r),...s})});o.displayName="Card";let n=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("flex flex-col space-y-1.5 p-6",r),...s})});n.displayName="CardHeader";let l=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("h3",{ref:t,className:(0,i.cn)("text-2xl font-semibold leading-none tracking-tight text-white",r),...s})});l.displayName="CardTitle";let c=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("p",{ref:t,className:(0,i.cn)("text-sm text-gray-300",r),...s})});c.displayName="CardDescription";let d=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("p-6 pt-0",r),...s})});d.displayName="CardContent",s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("flex items-center p-6 pt-0",r),...s})}).displayName="CardFooter"},5179:function(e,t,r){r.d(t,{I:function(){return o}});var a=r(7437),s=r(2265),i=r(1657);let o=s.forwardRef((e,t)=>{let{className:r,type:s,...o}=e;return(0,a.jsx)("input",{type:s,className:(0,i.cn)("flex h-10 w-full rounded-md border border-cyan-500/30 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-cyan-400/50 focus:border-cyan-400",r),ref:t,...o})});o.displayName="Input"},1657:function(e,t,r){r.d(t,{cn:function(){return i}});var a=r(7042),s=r(4769);function i(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,s.m6)((0,a.W)(t))}},5925:function(e,t,r){let a,s;r.d(t,{x7:function(){return ef},ZP:function(){return ep}});var i,o=r(2265);let n={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||n,c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,f=(e,t)=>{let r="",a="",s="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+o+";":a+="f"==i[1]?f(o,i):i+"{"+f(o,"k"==i[1]?"":t)+"}":"object"==typeof o?a+=f(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=f.p?f.p(i,o):i+":"+o+";")}return r+(t&&s?t+"{"+s+"}":s)+a},p={},m=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+m(e[r]);return t}return e},h=(e,t,r,a,s)=>{var i;let o=m(e),n=p[o]||(p[o]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(o));if(!p[n]){let t=o!==e?e:(e=>{let t,r,a=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);p[n]=f(s?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&p.g?p.g:null;return r&&(p.g=p[n]),i=p[n],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),n},g=(e,t,r)=>e.reduce((e,a,s)=>{let i=t[s];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":f(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function y(e){let t=this||{},r=e.call?e(t.p):e;return h(r.unshift?r.raw?g(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}y.bind({g:1});let b,x,v,w=y.bind({k:1});function j(e,t){let r=this||{};return function(){let a=arguments;function s(i,o){let n=Object.assign({},i),l=n.className||s.className;r.p=Object.assign({theme:x&&x()},n),r.o=/ *go\d+/.test(l),n.className=y.apply(r,a)+(l?" "+l:""),t&&(n.ref=o);let c=e;return e[0]&&(c=n.as||e,delete n.as),v&&c[0]&&v(n),b(c,n)}return t?t(s):s}}var N=e=>"function"==typeof e,k=(e,t)=>N(e)?e(t):e,C=(a=0,()=>(++a).toString()),E=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},I="default",z=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return z(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},O=[],A={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},D={},$=(e,t=I)=>{D[t]=z(D[t]||A,e),O.forEach(([e,r])=>{e===t&&r(D[t])})},S=e=>Object.keys(D).forEach(t=>$(e,t)),F=e=>Object.keys(D).find(t=>D[t].toasts.some(t=>t.id===e)),J=(e=I)=>t=>{$(t,e)},P={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},R=(e={},t=I)=>{let[r,a]=(0,o.useState)(D[t]||A),s=(0,o.useRef)(D[t]);(0,o.useEffect)(()=>(s.current!==D[t]&&a(D[t]),O.push([t,a]),()=>{let e=O.findIndex(([e])=>e===t);e>-1&&O.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,a,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||P[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...r,toasts:i}},Z=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||C()}),M=e=>(t,r)=>{let a=Z(t,e,r);return J(a.toasterId||F(a.id))({type:2,toast:a}),a.id},L=(e,t)=>M("blank")(e,t);L.error=M("error"),L.success=M("success"),L.loading=M("loading"),L.custom=M("custom"),L.dismiss=(e,t)=>{let r={type:3,toastId:e};t?J(t)(r):S(r)},L.dismissAll=e=>L.dismiss(void 0,e),L.remove=(e,t)=>{let r={type:4,toastId:e};t?J(t)(r):S(r)},L.removeAll=e=>L.remove(void 0,e),L.promise=(e,t,r)=>{let a=L.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?k(t.success,e):void 0;return s?L.success(s,{id:a,...r,...null==r?void 0:r.success}):L.dismiss(a),e}).catch(e=>{let s=t.error?k(t.error,e):void 0;s?L.error(s,{id:a,...r,...null==r?void 0:r.error}):L.dismiss(a)}),e};var T=1e3,H=(e,t="default")=>{let{toasts:r,pausedAt:a}=R(e,t),s=(0,o.useRef)(new Map).current,i=(0,o.useCallback)((e,t=T)=>{if(s.has(e))return;let r=setTimeout(()=>{s.delete(e),n({type:4,toastId:e})},t);s.set(e,r)},[]);(0,o.useEffect)(()=>{if(a)return;let e=Date.now(),s=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&L.dismiss(r.id);return}return setTimeout(()=>L.dismiss(r.id,t),a)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let n=(0,o.useCallback)(J(t),[t]),l=(0,o.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),c=(0,o.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),d=(0,o.useCallback)(()=>{a&&n({type:6,time:Date.now()})},[a,n]),u=(0,o.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:i}=t||{},o=r.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=o.findIndex(t=>t.id===e.id),l=o.filter((e,t)=>t<n&&e.visible).length;return o.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=s.get(e.id);t&&(clearTimeout(t),s.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:d,calculateOffset:u}}},_=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,U=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,V=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,X=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${_} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${U} 0.15s ease-out forwards;
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
    animation: ${V} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Y=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,B=j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Y} 1s linear infinite;
`,G=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,W=w`
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
}`,q=j("div")`
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
    animation: ${W} 0.2s ease-out forwards;
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
`,Q=j("div")`
  position: absolute;
`,K=j("div")`
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
}`,et=j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,er=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?o.createElement(et,null,t):t:"blank"===r?null:o.createElement(K,null,o.createElement(B,{...a}),"loading"!==r&&o.createElement(Q,null,"error"===r?o.createElement(X,{...a}):o.createElement(q,{...a})))},ea=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,es=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,ei=j("div")`
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
`,eo=j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=E()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ea(r),es(r)];return{animation:t?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=o.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},i=o.createElement(er,{toast:e}),n=o.createElement(eo,{...e.ariaProps},k(e.message,e));return o.createElement(ei,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:i,message:n}):o.createElement(o.Fragment,null,i,n))});i=o.createElement,f.p=void 0,b=i,x=void 0,v=void 0;var ec=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let i=o.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return o.createElement("div",{ref:i,className:t,style:r},s)},ed=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:E()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},eu=y`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ef=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,toasterId:i,containerStyle:n,containerClassName:l})=>{let{toasts:c,handlers:d}=H(r,i);return o.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},c.map(r=>{let i=r.position||t,n=ed(i,d.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return o.createElement(ec,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?eu:"",style:n},"custom"===r.type?k(r.message,r):s?s(r):o.createElement(el,{toast:r,position:i}))}))},ep=L}}]);