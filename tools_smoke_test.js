/* Optional Node smoke test for the frontend route renderer. Run: node tools_smoke_test.js */
const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./assets/js/app.js','utf8');
const routes=['landing','login','register','dashboard','island','land','property','marketplace','businesses','vehicles','events','communities','friends','messages','wallet','profile','settings','notifications','games','admin','investor','business-model','future','why-nexus','alpha','neighbor-drop','flex-card','treasure-hunt','guestbook'];
for(const route of routes){
  const store={}; const app={innerHTML:''}; const els={app};
  const document={body:{dataset:{route}},getElementById:id=>els[id]||null,createElement:()=>({style:{},append(){},remove(){}})};
  const location={pathname:(route==='landing'?'index':route)+'.html',reload(){}};
  const window={location,addEventListener:()=>{},removeEventListener:()=>{}};
  const context={console,document,window,location,Math,Date,JSON,Intl,Number,String,RegExp,Array,Object,Promise,setTimeout:()=>0,clearTimeout:()=>{},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]},navigator:{},Event:function(){}};
  if(!['landing','login','register'].includes(route)) store.nexus_island_mvp_v4=JSON.stringify({auth:true,onboardingComplete:true});
  vm.runInNewContext(code,context,{filename:'assets/js/app.js'});
  if(!app.innerHTML) throw new Error(`Empty render: ${route}`);
  console.log(`PASS ${route} (${app.innerHTML.length} chars)`);
}
