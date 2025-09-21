(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[716],{196:function(e,t,r){Promise.resolve().then(r.bind(r,4743))},4743:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return h}});var a=r(7437),s=r(2265),i=r(4033),o=r(1396),n=r.n(o),l=r(7440),c=r(5754),d=r(7815),u=r(5179),f=r(9842),p=r(7810),m=r(5925);function h(){let[e,t]=(0,s.useState)(""),[r,o]=(0,s.useState)(""),[h,y]=(0,s.useState)(!1),g=(0,i.useRouter)(),[b,x]=(0,s.useState)(null);(0,s.useEffect)(()=>{try{let e="https://yxzypekwyuopbanroobr.supabase.co",t="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4enlwZWt3eXVvcGJhbnJvb2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NjI3NDksImV4cCI6MjA3NDAzODc0OX0.37JNu4brGevL3VDd9In3vxSFY49Jw6CtMZw5SZ6uaEA";if(!e||!t){console.error("Missing Supabase environment variables");return}let r=(0,l.eI)(e,t);x(r)}catch(e){console.error("Failed to initialize Supabase client:",e)}},[]);let v=async t=>{if(t.preventDefault(),!b){m.ZP.error("Authentication service is not available. Please try again.");return}y(!0);try{let{error:t}=await b.auth.signInWithPassword({email:e,password:r});t?t.message.includes("email not confirmed")?m.ZP.error("Please check your email and click the confirmation link before signing in."):m.ZP.error(t.message):(m.ZP.success("Login successful!"),g.push("/dashboard"))}catch(e){m.ZP.error("An unexpected error occurred")}finally{y(!1)}};return(0,a.jsx)("div",{className:"min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4",children:(0,a.jsxs)(d.Zb,{className:"w-full max-w-md card-soft",children:[(0,a.jsxs)(d.Ol,{className:"text-center",children:[(0,a.jsx)("div",{className:"flex justify-center mb-4",children:(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsx)("div",{className:"w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center",children:(0,a.jsx)(p.Z,{className:"h-5 w-5 text-white"})}),(0,a.jsx)("span",{className:"text-lg font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent",children:"EventraiseHub"})]})}),(0,a.jsx)(d.ll,{className:"text-2xl text-white",children:"Welcome Back!"}),(0,a.jsx)(d.SZ,{className:"text-gray-300",children:"Sign in to your EventraiseHub account"})]}),(0,a.jsxs)(d.aY,{children:[(0,a.jsxs)("form",{onSubmit:v,className:"space-y-4",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(f._,{htmlFor:"email",children:"Email"}),(0,a.jsx)(u.I,{id:"email",type:"email",placeholder:"Enter your email",value:e,onChange:e=>t(e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(f._,{htmlFor:"password",children:"Password"}),(0,a.jsx)(u.I,{id:"password",type:"password",placeholder:"Enter your password",value:r,onChange:e=>o(e.target.value),required:!0})]}),(0,a.jsx)(c.z,{type:"submit",className:"w-full btn-primary",disabled:h,children:h?"Signing in...":"Sign In"})]}),(0,a.jsx)("div",{className:"mt-6 text-center",children:(0,a.jsxs)("p",{className:"text-sm text-gray-300",children:["Don't have an account?"," ",(0,a.jsx)(n(),{href:"/auth/register",className:"text-cyan-400 hover:underline",children:"Sign up"})]})})]})]})})}},5754:function(e,t,r){"use strict";r.d(t,{z:function(){return l}});var a=r(7437),s=r(2265),i=r(6061),o=r(1657);let n=(0,i.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105",destructive:"bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-400/40",outline:"border border-cyan-400/50 bg-transparent text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300",secondary:"bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-300 hover:to-orange-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-400/40",ghost:"text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300",link:"text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),l=s.forwardRef((e,t)=>{let{className:r,variant:s,size:i,asChild:l=!1,...c}=e;return(0,a.jsx)("button",{className:(0,o.cn)(n({variant:s,size:i,className:r})),ref:t,...c})});l.displayName="Button"},7815:function(e,t,r){"use strict";r.d(t,{Ol:function(){return n},SZ:function(){return c},Zb:function(){return o},aY:function(){return d},ll:function(){return l}});var a=r(7437),s=r(2265),i=r(1657);let o=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("rounded-lg border border-cyan-500/20 bg-gray-800/50 backdrop-blur-sm text-white shadow-lg shadow-cyan-500/10",r),...s})});o.displayName="Card";let n=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("flex flex-col space-y-1.5 p-6",r),...s})});n.displayName="CardHeader";let l=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("h3",{ref:t,className:(0,i.cn)("text-2xl font-semibold leading-none tracking-tight text-white",r),...s})});l.displayName="CardTitle";let c=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("p",{ref:t,className:(0,i.cn)("text-sm text-gray-300",r),...s})});c.displayName="CardDescription";let d=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("p-6 pt-0",r),...s})});d.displayName="CardContent",s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("flex items-center p-6 pt-0",r),...s})}).displayName="CardFooter"},5179:function(e,t,r){"use strict";r.d(t,{I:function(){return o}});var a=r(7437),s=r(2265),i=r(1657);let o=s.forwardRef((e,t)=>{let{className:r,type:s,...o}=e;return(0,a.jsx)("input",{type:s,className:(0,i.cn)("flex h-10 w-full rounded-md border border-cyan-500/30 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-cyan-400/50 focus:border-cyan-400",r),ref:t,...o})});o.displayName="Input"},9842:function(e,t,r){"use strict";r.d(t,{_:function(){return o}});var a=r(7437),s=r(2265),i=r(1657);let o=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("label",{ref:t,className:(0,i.cn)("text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70",r),...s})});o.displayName="Label"},1657:function(e,t,r){"use strict";r.d(t,{cn:function(){return i}});var a=r(7042),s=r(4769);function i(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,s.m6)((0,a.W)(t))}},4033:function(e,t,r){e.exports=r(5313)},5925:function(e,t,r){"use strict";let a,s;r.d(t,{x7:function(){return ef},ZP:function(){return ep}});var i,o=r(2265);let n={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||n,c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,f=(e,t)=>{let r="",a="",s="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+o+";":a+="f"==i[1]?f(o,i):i+"{"+f(o,"k"==i[1]?"":t)+"}":"object"==typeof o?a+=f(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=f.p?f.p(i,o):i+":"+o+";")}return r+(t&&s?t+"{"+s+"}":s)+a},p={},m=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+m(e[r]);return t}return e},h=(e,t,r,a,s)=>{var i;let o=m(e),n=p[o]||(p[o]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(o));if(!p[n]){let t=o!==e?e:(e=>{let t,r,a=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);p[n]=f(s?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&p.g?p.g:null;return r&&(p.g=p[n]),i=p[n],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),n},y=(e,t,r)=>e.reduce((e,a,s)=>{let i=t[s];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":f(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function g(e){let t=this||{},r=e.call?e(t.p):e;return h(r.unshift?r.raw?y(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}g.bind({g:1});let b,x,v,w=g.bind({k:1});function N(e,t){let r=this||{};return function(){let a=arguments;function s(i,o){let n=Object.assign({},i),l=n.className||s.className;r.p=Object.assign({theme:x&&x()},n),r.o=/ *go\d+/.test(l),n.className=g.apply(r,a)+(l?" "+l:""),t&&(n.ref=o);let c=e;return e[0]&&(c=n.as||e,delete n.as),v&&c[0]&&v(n),b(c,n)}return t?t(s):s}}var j=e=>"function"==typeof e,k=(e,t)=>j(e)?e(t):e,E=(a=0,()=>(++a).toString()),I=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},C="default",O=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return O(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},S=[],D={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},z={},P=(e,t=C)=>{z[t]=O(z[t]||D,e),S.forEach(([e,r])=>{e===t&&r(z[t])})},$=e=>Object.keys(z).forEach(t=>P(e,t)),Z=e=>Object.keys(z).find(t=>z[t].toasts.some(t=>t.id===e)),A=(e=C)=>t=>{P(t,e)},R={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},F=(e={},t=C)=>{let[r,a]=(0,o.useState)(z[t]||D),s=(0,o.useRef)(z[t]);(0,o.useEffect)(()=>(s.current!==z[t]&&a(z[t]),S.push([t,a]),()=>{let e=S.findIndex(([e])=>e===t);e>-1&&S.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,a,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||R[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...r,toasts:i}},J=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||E()}),_=e=>(t,r)=>{let a=J(t,e,r);return A(a.toasterId||Z(a.id))({type:2,toast:a}),a.id},L=(e,t)=>_("blank")(e,t);L.error=_("error"),L.success=_("success"),L.loading=_("loading"),L.custom=_("custom"),L.dismiss=(e,t)=>{let r={type:3,toastId:e};t?A(t)(r):$(r)},L.dismissAll=e=>L.dismiss(void 0,e),L.remove=(e,t)=>{let r={type:4,toastId:e};t?A(t)(r):$(r)},L.removeAll=e=>L.remove(void 0,e),L.promise=(e,t,r)=>{let a=L.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?k(t.success,e):void 0;return s?L.success(s,{id:a,...r,...null==r?void 0:r.success}):L.dismiss(a),e}).catch(e=>{let s=t.error?k(t.error,e):void 0;s?L.error(s,{id:a,...r,...null==r?void 0:r.error}):L.dismiss(a)}),e};var M=1e3,H=(e,t="default")=>{let{toasts:r,pausedAt:a}=F(e,t),s=(0,o.useRef)(new Map).current,i=(0,o.useCallback)((e,t=M)=>{if(s.has(e))return;let r=setTimeout(()=>{s.delete(e),n({type:4,toastId:e})},t);s.set(e,r)},[]);(0,o.useEffect)(()=>{if(a)return;let e=Date.now(),s=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&L.dismiss(r.id);return}return setTimeout(()=>L.dismiss(r.id,t),a)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let n=(0,o.useCallback)(A(t),[t]),l=(0,o.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),c=(0,o.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),d=(0,o.useCallback)(()=>{a&&n({type:6,time:Date.now()})},[a,n]),u=(0,o.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:i}=t||{},o=r.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=o.findIndex(t=>t.id===e.id),l=o.filter((e,t)=>t<n&&e.visible).length;return o.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=s.get(e.id);t&&(clearTimeout(t),s.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:d,calculateOffset:u}}},T=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Y=w`
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
}`,X=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${T} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Y} 0.15s ease-out forwards;
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
`,B=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,W=N("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${B} 1s linear infinite;
`,q=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,G=w`
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
}`,U=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${q} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${G} 0.2s ease-out forwards;
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
`,Q=N("div")`
  position: absolute;
`,K=N("div")`
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
}`,et=N("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,er=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?o.createElement(et,null,t):t:"blank"===r?null:o.createElement(K,null,o.createElement(W,{...a}),"loading"!==r&&o.createElement(Q,null,"error"===r?o.createElement(X,{...a}):o.createElement(U,{...a})))},ea=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,es=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,ei=N("div")`
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
`,eo=N("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=I()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ea(r),es(r)];return{animation:t?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=o.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},i=o.createElement(er,{toast:e}),n=o.createElement(eo,{...e.ariaProps},k(e.message,e));return o.createElement(ei,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:i,message:n}):o.createElement(o.Fragment,null,i,n))});i=o.createElement,f.p=void 0,b=i,x=void 0,v=void 0;var ec=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let i=o.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return o.createElement("div",{ref:i,className:t,style:r},s)},ed=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:I()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},eu=g`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ef=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,toasterId:i,containerStyle:n,containerClassName:l})=>{let{toasts:c,handlers:d}=H(r,i);return o.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:d.startPause,onMouseLeave:d.endPause},c.map(r=>{let i=r.position||t,n=ed(i,d.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return o.createElement(ec,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?eu:"",style:n},"custom"===r.type?k(r.message,r):s?s(r):o.createElement(el,{toast:r,position:i}))}))},ep=L}},function(e){e.O(0,[250,758,440,971,458,744],function(){return e(e.s=196)}),_N_E=e.O()}]);