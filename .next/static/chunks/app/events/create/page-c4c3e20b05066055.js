(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[135],{3067:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(2898).Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},3671:function(e,t,r){Promise.resolve().then(r.bind(r,6024))},6024:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return g}});var a=r(7437),s=r(2265),i=r(4033),n=r(797),o=r(7815),l=r(5754),d=r(5179),c=r(9842),u=r(7810),p=r(3067),m=r(1396),f=r.n(m),h=r(5925);function g(){let{user:e,loading:t}=(0,n.useAuth)(),r=(0,i.useRouter)(),[m,g]=(0,s.useState)(!1),[x,v]=(0,s.useState)({title:"",description:"",event_type:"walkathon",start_date:"",end_date:"",registration_deadline:"",goal_amount:"",max_participants:"",registration_fee:"0",location:"",is_public:!0}),y=(e,t)=>{v(r=>({...r,[e]:t}))},b=async e=>{e.preventDefault(),g(!0);try{await new Promise(e=>setTimeout(e,2e3)),h.ZP.success("Event created successfully!"),r.push("/dashboard")}catch(e){h.ZP.error("Failed to create event. Please try again.")}finally{g(!1)}};return t?(0,a.jsx)("div",{className:"min-h-screen flex items-center justify-center",children:(0,a.jsx)("div",{className:"animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"})}):e?(0,a.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,a.jsx)("nav",{className:"bg-white shadow-sm border-b",children:(0,a.jsx)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,a.jsxs)("div",{className:"flex justify-between h-16",children:[(0,a.jsxs)("div",{className:"flex items-center",children:[(0,a.jsx)(u.Z,{className:"h-8 w-8 text-primary-600"}),(0,a.jsx)("span",{className:"ml-2 text-xl font-bold text-gray-900",children:"EventRaise"})]}),(0,a.jsx)("div",{className:"flex items-center space-x-4",children:(0,a.jsx)(f(),{href:"/dashboard",children:(0,a.jsx)(l.z,{variant:"ghost",children:"Dashboard"})})})]})})}),(0,a.jsxs)("div",{className:"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[(0,a.jsxs)("div",{className:"mb-8",children:[(0,a.jsxs)(f(),{href:"/dashboard",className:"inline-flex items-center text-primary-600 hover:text-primary-700 mb-4",children:[(0,a.jsx)(p.Z,{className:"h-4 w-4 mr-2"}),"Back to Dashboard"]}),(0,a.jsx)("h1",{className:"text-3xl font-bold text-gray-900",children:"Create New Event"}),(0,a.jsx)("p",{className:"text-gray-600",children:"Set up your fundraising campaign"})]}),(0,a.jsxs)(o.Zb,{children:[(0,a.jsxs)(o.Ol,{children:[(0,a.jsx)(o.ll,{children:"Event Details"}),(0,a.jsx)(o.SZ,{children:"Provide information about your fundraising event"})]}),(0,a.jsx)(o.aY,{children:(0,a.jsxs)("form",{onSubmit:b,className:"space-y-6",children:[(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"title",children:"Event Title *"}),(0,a.jsx)(d.I,{id:"title",placeholder:"Enter event title",value:x.title,onChange:e=>y("title",e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"event_type",children:"Event Type *"}),(0,a.jsxs)("select",{id:"event_type",value:x.event_type,onChange:e=>y("event_type",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500",required:!0,children:[(0,a.jsx)("option",{value:"walkathon",children:"Walk-a-thon"}),(0,a.jsx)("option",{value:"auction",children:"Auction"}),(0,a.jsx)("option",{value:"product_sale",children:"Product Sale"}),(0,a.jsx)("option",{value:"direct_donation",children:"Direct Donation"}),(0,a.jsx)("option",{value:"raffle",children:"Raffle"})]})]})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"description",children:"Description *"}),(0,a.jsx)("textarea",{id:"description",placeholder:"Describe your event and its purpose",value:x.description,onChange:e=>y("description",e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]",required:!0})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"start_date",children:"Start Date *"}),(0,a.jsx)(d.I,{id:"start_date",type:"datetime-local",value:x.start_date,onChange:e=>y("start_date",e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"end_date",children:"End Date *"}),(0,a.jsx)(d.I,{id:"end_date",type:"datetime-local",value:x.end_date,onChange:e=>y("end_date",e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"registration_deadline",children:"Registration Deadline"}),(0,a.jsx)(d.I,{id:"registration_deadline",type:"datetime-local",value:x.registration_deadline,onChange:e=>y("registration_deadline",e.target.value)})]})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"goal_amount",children:"Fundraising Goal ($) *"}),(0,a.jsx)(d.I,{id:"goal_amount",type:"number",placeholder:"10000",value:x.goal_amount,onChange:e=>y("goal_amount",e.target.value),required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"max_participants",children:"Max Participants"}),(0,a.jsx)(d.I,{id:"max_participants",type:"number",placeholder:"100",value:x.max_participants,onChange:e=>y("max_participants",e.target.value)})]})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"registration_fee",children:"Registration Fee ($)"}),(0,a.jsx)(d.I,{id:"registration_fee",type:"number",placeholder:"0",value:x.registration_fee,onChange:e=>y("registration_fee",e.target.value)})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c._,{htmlFor:"location",children:"Location"}),(0,a.jsx)(d.I,{id:"location",placeholder:"Event location",value:x.location,onChange:e=>y("location",e.target.value)})]})]}),(0,a.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,a.jsx)("input",{type:"checkbox",id:"is_public",checked:x.is_public,onChange:e=>y("is_public",e.target.checked.toString()),className:"rounded border-gray-300"}),(0,a.jsx)(c._,{htmlFor:"is_public",children:"Make this event public"})]}),(0,a.jsxs)("div",{className:"flex justify-end space-x-4 pt-6",children:[(0,a.jsx)(f(),{href:"/dashboard",children:(0,a.jsx)(l.z,{type:"button",variant:"outline",children:"Cancel"})}),(0,a.jsx)(l.z,{type:"submit",disabled:m,children:m?"Creating Event...":"Create Event"})]})]})})]})]})]}):(r.push("/auth/login"),null)}},797:function(e,t,r){"use strict";r.r(t),r.d(t,{Providers:function(){return d},useAuth:function(){return l}});var a=r(7437),s=r(2265),i=r(7440),n=r(5925);let o=(0,s.createContext)({user:null,loading:!0,signOut:async()=>{}}),l=()=>{let e=(0,s.useContext)(o);if(!e)throw Error("useAuth must be used within an AuthProvider");return e};function d(e){let{children:t}=e,[r,l]=(0,s.useState)(null),[d,c]=(0,s.useState)(!0),[u,p]=(0,s.useState)(null);(0,s.useEffect)(()=>{try{let e="https://placeholder.supabase.co",t="placeholder_anon_key";if(!e||!t){console.error("Missing Supabase environment variables"),c(!1);return}let r=(0,i.eI)(e,t);p(r)}catch(e){console.error("Failed to initialize Supabase client:",e),c(!1)}},[]),(0,s.useEffect)(()=>{if(!u)return;(async()=>{try{let{data:{user:e}}=await u.auth.getUser();l(e),c(!1)}catch(e){console.error("Failed to get user:",e),c(!1)}})();let{data:{subscription:e}}=u.auth.onAuthStateChange(async(e,t)=>{var r;l(null!==(r=null==t?void 0:t.user)&&void 0!==r?r:null),c(!1)});return()=>e.unsubscribe()},[u]);let m=async()=>{u&&await u.auth.signOut()};return(0,a.jsxs)(o.Provider,{value:{user:r,loading:d,signOut:m},children:[t,(0,a.jsx)(n.x7,{position:"top-right"})]})}},5754:function(e,t,r){"use strict";r.d(t,{z:function(){return l}});var a=r(7437),s=r(2265),i=r(6061),n=r(1657);let o=(0,i.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),l=s.forwardRef((e,t)=>{let{className:r,variant:s,size:i,asChild:l=!1,...d}=e;return(0,a.jsx)("button",{className:(0,n.cn)(o({variant:s,size:i,className:r})),ref:t,...d})});l.displayName="Button"},7815:function(e,t,r){"use strict";r.d(t,{Ol:function(){return o},SZ:function(){return d},Zb:function(){return n},aY:function(){return c},ll:function(){return l}});var a=r(7437),s=r(2265),i=r(1657);let n=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",r),...s})});n.displayName="Card";let o=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("flex flex-col space-y-1.5 p-6",r),...s})});o.displayName="CardHeader";let l=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("h3",{ref:t,className:(0,i.cn)("text-2xl font-semibold leading-none tracking-tight",r),...s})});l.displayName="CardTitle";let d=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("p",{ref:t,className:(0,i.cn)("text-sm text-muted-foreground",r),...s})});d.displayName="CardDescription";let c=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("p-6 pt-0",r),...s})});c.displayName="CardContent",s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("div",{ref:t,className:(0,i.cn)("flex items-center p-6 pt-0",r),...s})}).displayName="CardFooter"},5179:function(e,t,r){"use strict";r.d(t,{I:function(){return n}});var a=r(7437),s=r(2265),i=r(1657);let n=s.forwardRef((e,t)=>{let{className:r,type:s,...n}=e;return(0,a.jsx)("input",{type:s,className:(0,i.cn)("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",r),ref:t,...n})});n.displayName="Input"},9842:function(e,t,r){"use strict";r.d(t,{_:function(){return n}});var a=r(7437),s=r(2265),i=r(1657);let n=s.forwardRef((e,t)=>{let{className:r,...s}=e;return(0,a.jsx)("label",{ref:t,className:(0,i.cn)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",r),...s})});n.displayName="Label"},1657:function(e,t,r){"use strict";r.d(t,{cn:function(){return i}});var a=r(7042),s=r(4769);function i(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,s.m6)((0,a.W)(t))}},4033:function(e,t,r){e.exports=r(5313)},5925:function(e,t,r){"use strict";let a,s;r.d(t,{x7:function(){return ep},ZP:function(){return em}});var i,n=r(2265);let o={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||o,d=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,c=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,p=(e,t)=>{let r="",a="",s="";for(let i in e){let n=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+n+";":a+="f"==i[1]?p(n,i):i+"{"+p(n,"k"==i[1]?"":t)+"}":"object"==typeof n?a+=p(n,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=n&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=p.p?p.p(i,n):i+":"+n+";")}return r+(t&&s?t+"{"+s+"}":s)+a},m={},f=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+f(e[r]);return t}return e},h=(e,t,r,a,s)=>{var i;let n=f(e),o=m[n]||(m[n]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(n));if(!m[o]){let t=n!==e?e:(e=>{let t,r,a=[{}];for(;t=d.exec(e.replace(c,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);m[o]=p(s?{["@keyframes "+o]:t}:t,r?"":"."+o)}let l=r&&m.g?m.g:null;return r&&(m.g=m[o]),i=m[o],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),o},g=(e,t,r)=>e.reduce((e,a,s)=>{let i=t[s];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":p(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function x(e){let t=this||{},r=e.call?e(t.p):e;return h(r.unshift?r.raw?g(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}x.bind({g:1});let v,y,b,j=x.bind({k:1});function w(e,t){let r=this||{};return function(){let a=arguments;function s(i,n){let o=Object.assign({},i),l=o.className||s.className;r.p=Object.assign({theme:y&&y()},o),r.o=/ *go\d+/.test(l),o.className=x.apply(r,a)+(l?" "+l:""),t&&(o.ref=n);let d=e;return e[0]&&(d=o.as||e,delete o.as),b&&d[0]&&b(o),v(d,o)}return t?t(s):s}}var N=e=>"function"==typeof e,_=(e,t)=>N(e)?e(t):e,k=(a=0,()=>(++a).toString()),C=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},E="default",D=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return D(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},F=[],I={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},$={},O=(e,t=E)=>{$[t]=D($[t]||I,e),F.forEach(([e,r])=>{e===t&&r($[t])})},P=e=>Object.keys($).forEach(t=>O(e,t)),S=e=>Object.keys($).find(t=>$[t].toasts.some(t=>t.id===e)),A=(e=E)=>t=>{O(t,e)},z={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},R=(e={},t=E)=>{let[r,a]=(0,n.useState)($[t]||I),s=(0,n.useRef)($[t]);(0,n.useEffect)(()=>(s.current!==$[t]&&a($[t]),F.push([t,a]),()=>{let e=F.findIndex(([e])=>e===t);e>-1&&F.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,a,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||z[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...r,toasts:i}},Z=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||k()}),M=e=>(t,r)=>{let a=Z(t,e,r);return A(a.toasterId||S(a.id))({type:2,toast:a}),a.id},T=(e,t)=>M("blank")(e,t);T.error=M("error"),T.success=M("success"),T.loading=M("loading"),T.custom=M("custom"),T.dismiss=(e,t)=>{let r={type:3,toastId:e};t?A(t)(r):P(r)},T.dismissAll=e=>T.dismiss(void 0,e),T.remove=(e,t)=>{let r={type:4,toastId:e};t?A(t)(r):P(r)},T.removeAll=e=>T.remove(void 0,e),T.promise=(e,t,r)=>{let a=T.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?_(t.success,e):void 0;return s?T.success(s,{id:a,...r,...null==r?void 0:r.success}):T.dismiss(a),e}).catch(e=>{let s=t.error?_(t.error,e):void 0;s?T.error(s,{id:a,...r,...null==r?void 0:r.error}):T.dismiss(a)}),e};var L=1e3,q=(e,t="default")=>{let{toasts:r,pausedAt:a}=R(e,t),s=(0,n.useRef)(new Map).current,i=(0,n.useCallback)((e,t=L)=>{if(s.has(e))return;let r=setTimeout(()=>{s.delete(e),o({type:4,toastId:e})},t);s.set(e,r)},[]);(0,n.useEffect)(()=>{if(a)return;let e=Date.now(),s=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&T.dismiss(r.id);return}return setTimeout(()=>T.dismiss(r.id,t),a)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let o=(0,n.useCallback)(A(t),[t]),l=(0,n.useCallback)(()=>{o({type:5,time:Date.now()})},[o]),d=(0,n.useCallback)((e,t)=>{o({type:1,toast:{id:e,height:t}})},[o]),c=(0,n.useCallback)(()=>{a&&o({type:6,time:Date.now()})},[a,o]),u=(0,n.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:i}=t||{},n=r.filter(t=>(t.position||i)===(e.position||i)&&t.height),o=n.findIndex(t=>t.id===e.id),l=n.filter((e,t)=>t<o&&e.visible).length;return n.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[r]);return(0,n.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=s.get(e.id);t&&(clearTimeout(t),s.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:d,startPause:l,endPause:c,calculateOffset:u}}},H=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,B=j`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,U=j`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Y=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${H} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
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
    animation: ${U} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,W=j`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,G=w("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${W} 1s linear infinite;
`,V=j`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,J=j`
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
}`,K=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${V} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
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
`,Q=w("div")`
  position: absolute;
`,X=w("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ee=j`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,et=w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,er=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?n.createElement(et,null,t):t:"blank"===r?null:n.createElement(X,null,n.createElement(G,{...a}),"loading"!==r&&n.createElement(Q,null,"error"===r?n.createElement(Y,{...a}):n.createElement(K,{...a})))},ea=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,es=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,ei=w("div")`
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
`,en=w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,eo=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=C()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ea(r),es(r)];return{animation:t?`${j(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${j(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},el=n.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?eo(e.position||t||"top-center",e.visible):{opacity:0},i=n.createElement(er,{toast:e}),o=n.createElement(en,{...e.ariaProps},_(e.message,e));return n.createElement(ei,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:i,message:o}):n.createElement(n.Fragment,null,i,o))});i=n.createElement,p.p=void 0,v=i,y=void 0,b=void 0;var ed=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let i=n.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return n.createElement("div",{ref:i,className:t,style:r},s)},ec=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:C()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},eu=x`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ep=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,toasterId:i,containerStyle:o,containerClassName:l})=>{let{toasts:d,handlers:c}=q(r,i);return n.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...o},className:l,onMouseEnter:c.startPause,onMouseLeave:c.endPause},d.map(r=>{let i=r.position||t,o=ec(i,c.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return n.createElement(ed,{id:r.id,key:r.id,onHeightUpdate:c.updateHeight,className:r.visible?eu:"",style:o},"custom"===r.type?_(r.message,r):s?s(r):n.createElement(el,{toast:r,position:i}))}))},em=T}},function(e){e.O(0,[250,758,440,971,458,744],function(){return e(e.s=3671)}),_N_E=e.O()}]);