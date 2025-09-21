(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[454],{4440:function(e,t,r){Promise.resolve().then(r.bind(r,5971))},5971:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return g}});var a=r(7437),s=r(2265),i=r(4033),o=r(1396),n=r.n(o),l=r(7440),d=r(5754),c=r(7815),u=r(5179),f=r(9842),m=r(7810),p=r(5925);function g(){let[e,t]=(0,s.useState)({email:"",password:"",confirmPassword:"",fullName:"",organizationName:""}),[r,o]=(0,s.useState)(!1),g=(0,i.useRouter)(),[h,y]=(0,s.useState)(null);(0,s.useEffect)(()=>{try{let e="https://placeholder.supabase.co",t="placeholder_anon_key";if(!e||!t){console.error("Missing Supabase environment variables");return}let r=(0,l.eI)(e,t);y(r)}catch(e){console.error("Failed to initialize Supabase client:",e)}},[]);let b=async t=>{if(t.preventDefault(),!h){p.ZP.error("Authentication service is not available. Please try again.");return}if(e.password!==e.confirmPassword){p.ZP.error("Passwords do not match");return}o(!0);try{let{error:t}=await h.auth.signUp({email:e.email,password:e.password,options:{data:{full_name:e.fullName,organization_name:e.organizationName}}});t?p.ZP.error(t.message):(p.ZP.success("Account created! Please check your email to verify your account before signing in."),g.push("/auth/login"))}catch(e){p.ZP.error("An unexpected error occurred")}finally{o(!1)}},x=(e,r)=>{t(t=>({...t,[e]:r}))};return(0,a.jsx)("div",{className:"min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4",children:(0,a.jsxs)(c.Zb,{className:"w-full max-w-md card-soft",children:[(0,a.jsxs)(c.Ol,{className:"text-center",children:[(0,a.jsx)("div",{className:"flex justify-center mb-4",children:(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsx)("div",{className:"w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center",children:(0,a.jsx)(m.Z,{className:"h-5 w-5 text-white"})}),(0,a.jsx)("span",{className:"text-lg font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent",children:"EventraiseHub"})]})}),(0,a.jsx)(c.ll,{className:"text-2xl text-white",children:"Create Account"}),(0,a.jsx)(c.SZ,{className:"text-gray-300",children:"Start your fundraising journey today"})]}),(0,a.jsxs)(c.aY,{children:[(0,a.jsxs)("form",{onSubmit:b,className:"space-y-4",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(f._,{htmlFor:"fullName",children:"Full Name"}),(0,a.jsx)(u.I,{id:"fullName",type:"text",placeholder:"Enter your full name",value:e.fullName,onChange:e=>x("fullName",e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(f._,{htmlFor:"email",children:"Email"}),(0,a.jsx)(u.I,{id:"email",type:"email",placeholder:"Enter your email",value:e.email,onChange:e=>x("email",e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(f._,{htmlFor:"organizationName",children:"Organization Name"}),(0,a.jsx)(u.I,{id:"organizationName",type:"text",placeholder:"Enter your organization name",value:e.organizationName,onChange:e=>x("organizationName",e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(f._,{htmlFor:"password",children:"Password"}),(0,a.jsx)(u.I,{id:"password",type:"password",placeholder:"Create a password",value:e.password,onChange:e=>x("password",e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(f._,{htmlFor:"confirmPassword",children:"Confirm Password"}),(0,a.jsx)(u.I,{id:"confirmPassword",type:"password",placeholder:"Confirm your password",value:e.confirmPassword,onChange:e=>x("confirmPassword",e.target.value),required:!0})]}),(0,a.jsx)(d.z,{type:"submit",className:"w-full btn-primary",disabled:r,children:r?"Creating account...":"Create Account"})]}),(0,a.jsx)("div",{className:"mt-6 text-center",children:(0,a.jsxs)("p",{className:"text-sm text-gray-300",children:["Already have an account?"," ",(0,a.jsx)(n(),{href:"/auth/login",className:"text-cyan-400 hover:underline",children:"Sign in"})]})})]})]})})}},5754:function(e,t,r){"use strict";r.d(t,{z:function(){return l}});var a=r(7437),s=r(2265),i=r(6061),o=r(1657);let n=(0,i.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),l=s.forwardRef((e,t)=>{let{className:r,variant:s,size:i,asChild:l=!1,...d}=e;return(0,a.jsx)("button",{className:(0,o.cn)(n({variant:s,size:i,className:r})),ref:t,...d})});l.displayName="Button"},7815:function(e,t,r){"use strict";r.d(t,{Ol:function(){return n},SZ:function(){return d},Zb:function(){return o},aY:function(){return c},ll:function(){return l}});var a=r(7437),s=r(2265),i=r(1657);let o=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",r),...s})});o.displayName="Card";let n=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("flex flex-col space-y-1.5 p-6",r),...s})});n.displayName="CardHeader";let l=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("h3",{ref:t,className:(0,i.cn)("text-2xl font-semibold leading-none tracking-tight",r),...s})});l.displayName="CardTitle";let d=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("p",{ref:t,className:(0,i.cn)("text-sm text-muted-foreground",r),...s})});d.displayName="CardDescription";let c=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("p-6 pt-0",r),...s})});c.displayName="CardContent",s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("flex items-center p-6 pt-0",r),...s})}).displayName="CardFooter"},5179:function(e,t,r){"use strict";r.d(t,{I:function(){return o}});var a=r(7437),s=r(2265),i=r(1657);let o=s.forwardRef((e,t)=>{let{className:r,type:s,...o}=e;return(0,a.jsx)("input",{type:s,className:(0,i.cn)("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",r),ref:t,...o})});o.displayName="Input"},9842:function(e,t,r){"use strict";r.d(t,{_:function(){return o}});var a=r(7437),s=r(2265),i=r(1657);let o=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("label",{ref:t,className:(0,i.cn)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",r),...s})});o.displayName="Label"},1657:function(e,t,r){"use strict";r.d(t,{cn:function(){return i}});var a=r(7042),s=r(4769);function i(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,s.m6)((0,a.W)(t))}},4033:function(e,t,r){e.exports=r(5313)},5925:function(e,t,r){"use strict";let a,s;r.d(t,{x7:function(){return ef},ZP:function(){return em}});var i,o=r(2265);let n={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||n,d=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,c=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,f=(e,t)=>{let r="",a="",s="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+o+";":a+="f"==i[1]?f(o,i):i+"{"+f(o,"k"==i[1]?"":t)+"}":"object"==typeof o?a+=f(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=f.p?f.p(i,o):i+":"+o+";")}return r+(t&&s?t+"{"+s+"}":s)+a},m={},p=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+p(e[r]);return t}return e},g=(e,t,r,a,s)=>{var i;let o=p(e),n=m[o]||(m[o]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(o));if(!m[n]){let t=o!==e?e:(e=>{let t,r,a=[{}];for(;t=d.exec(e.replace(c,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);m[n]=f(s?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&m.g?m.g:null;return r&&(m.g=m[n]),i=m[n],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),n},h=(e,t,r)=>e.reduce((e,a,s)=>{let i=t[s];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":f(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function y(e){let t=this||{},r=e.call?e(t.p):e;return g(r.unshift?r.raw?h(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}y.bind({g:1});let b,x,v,w=y.bind({k:1});function N(e,t){let r=this||{};return function(){let a=arguments;function s(i,o){let n=Object.assign({},i),l=n.className||s.className;r.p=Object.assign({theme:x&&x()},n),r.o=/ *go\d+/.test(l),n.className=y.apply(r,a)+(l?" "+l:""),t&&(n.ref=o);let d=e;return e[0]&&(d=n.as||e,delete n.as),v&&d[0]&&v(n),b(d,n)}return t?t(s):s}}var j=e=>"function"==typeof e,k=(e,t)=>j(e)?e(t):e,C=(a=0,()=>(++a).toString()),E=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},P="default",z=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return z(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},I=[],O={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},$={},_=(e,t=P)=>{$[t]=z($[t]||O,e),I.forEach(([e,r])=>{e===t&&r($[t])})},A=e=>Object.keys($).forEach(t=>_(e,t)),D=e=>Object.keys($).find(t=>$[t].toasts.some(t=>t.id===e)),S=(e=P)=>t=>{_(t,e)},F={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},R=(e={},t=P)=>{let[r,a]=(0,o.useState)($[t]||O),s=(0,o.useRef)($[t]);(0,o.useEffect)(()=>(s.current!==$[t]&&a($[t]),I.push([t,a]),()=>{let e=I.findIndex(([e])=>e===t);e>-1&&I.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,a,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||F[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...r,toasts:i}},Z=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||C()}),H=e=>(t,r)=>{let a=Z(t,e,r);return S(a.toasterId||D(a.id))({type:2,toast:a}),a.id},L=(e,t)=>H("blank")(e,t);L.error=H("error"),L.success=H("success"),L.loading=H("loading"),L.custom=H("custom"),L.dismiss=(e,t)=>{let r={type:3,toastId:e};t?S(t)(r):A(r)},L.dismissAll=e=>L.dismiss(void 0,e),L.remove=(e,t)=>{let r={type:4,toastId:e};t?S(t)(r):A(r)},L.removeAll=e=>L.remove(void 0,e),L.promise=(e,t,r)=>{let a=L.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?k(t.success,e):void 0;return s?L.success(s,{id:a,...r,...null==r?void 0:r.success}):L.dismiss(a),e}).catch(e=>{let s=t.error?k(t.error,e):void 0;s?L.error(s,{id:a,...r,...null==r?void 0:r.error}):L.dismiss(a)}),e};var M=1e3,T=(e,t="default")=>{let{toasts:r,pausedAt:a}=R(e,t),s=(0,o.useRef)(new Map).current,i=(0,o.useCallback)((e,t=M)=>{if(s.has(e))return;let r=setTimeout(()=>{s.delete(e),n({type:4,toastId:e})},t);s.set(e,r)},[]);(0,o.useEffect)(()=>{if(a)return;let e=Date.now(),s=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&L.dismiss(r.id);return}return setTimeout(()=>L.dismiss(r.id,t),a)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let n=(0,o.useCallback)(S(t),[t]),l=(0,o.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),d=(0,o.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),c=(0,o.useCallback)(()=>{a&&n({type:6,time:Date.now()})},[a,n]),u=(0,o.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:i}=t||{},o=r.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=o.findIndex(t=>t.id===e.id),l=o.filter((e,t)=>t<n&&e.visible).length;return o.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=s.get(e.id);t&&(clearTimeout(t),s.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:d,startPause:l,endPause:c,calculateOffset:u}}},q=w`
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
}`,Y=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,B=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${q} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
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
`,W=N("div")`
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
}`,K=N("div")`
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
`,Q=N("div")`
  position: absolute;
`,X=N("div")`
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
`,er=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?o.createElement(et,null,t):t:"blank"===r?null:o.createElement(X,null,o.createElement(W,{...a}),"loading"!==r&&o.createElement(Q,null,"error"===r?o.createElement(B,{...a}):o.createElement(K,{...a})))},ea=e=>`
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
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=E()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ea(r),es(r)];return{animation:t?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=o.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},i=o.createElement(er,{toast:e}),n=o.createElement(eo,{...e.ariaProps},k(e.message,e));return o.createElement(ei,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:i,message:n}):o.createElement(o.Fragment,null,i,n))});i=o.createElement,f.p=void 0,b=i,x=void 0,v=void 0;var ed=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let i=o.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return o.createElement("div",{ref:i,className:t,style:r},s)},ec=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:E()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},eu=y`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ef=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,toasterId:i,containerStyle:n,containerClassName:l})=>{let{toasts:d,handlers:c}=T(r,i);return o.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:l,onMouseEnter:c.startPause,onMouseLeave:c.endPause},d.map(r=>{let i=r.position||t,n=ec(i,c.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return o.createElement(ed,{id:r.id,key:r.id,onHeightUpdate:c.updateHeight,className:r.visible?eu:"",style:n},"custom"===r.type?k(r.message,r):s?s(r):o.createElement(el,{toast:r,position:i}))}))},em=L}},function(e){e.O(0,[250,758,440,971,458,744],function(){return e(e.s=4440)}),_N_E=e.O()}]);