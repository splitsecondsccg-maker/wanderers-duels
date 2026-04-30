
const fs=require("fs"),vm=require("vm");
const code=fs.readFileSync("game.js","utf8");
const el=new Proxy({}, {get(t,p){ if(p==="style")return {}; if(p==="classList")return {add(){},remove(){},toggle(){},contains(){return false}}; if(["appendChild","removeChild","addEventListener","setAttribute","remove","focus","scrollIntoView"].includes(p))return function(){}; if(p==="querySelectorAll")return function(){return []}; if(p==="querySelector")return function(){return el}; if(p==="getBoundingClientRect")return function(){return {left:0,top:0,width:100,height:100,right:100,bottom:100}}; if(p==="children")return []; if(p==="dataset")return {}; return t[p]??""}, set(t,p,v){t[p]=v; return true;}});
const sandbox={console, document:{getElementById(){return el},querySelector(){return el},querySelectorAll(){return []},createElement(){return el},addEventListener(){},body:el,documentElement:el}, window:{addEventListener(){},innerWidth:1200,innerHeight:800,matchMedia(){return {matches:false,addEventListener(){}}}}, localStorage:{getItem(){return null},setItem(){},removeItem(){}}, Audio:function(){return {play(){return Promise.resolve()},pause(){},addEventListener(){}}}, setTimeout(){}, clearTimeout(){}, setInterval(){}, clearInterval(){}, requestAnimationFrame(){}, alert(){}, structuredClone:global.structuredClone, Math, JSON, Array,Object,String,Number,Boolean,RegExp,Date,Set,Map};
sandbox.window=Object.assign(sandbox.window,sandbox); sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(code + `
globalThis.__api={
  getRoster:()=>ROSTER,
  setState:(s)=>{state=s},
  getState:()=>state,
  damage, addStatus, endRound, apply,
  alive, other
};`, sandbox);
console.log(Object.keys(sandbox.__api));
const u={id:"a",name:"A",side:"player",hp:10,maxHp:10,armor:0,shield:0,status:{},buff:{},dead:false};
const t={id:"b",name:"B",side:"enemy",hp:10,maxHp:10,armor:2,shield:0,status:{},buff:{},dead:false};
sandbox.__api.setState({units:[u,t],protects:[],dodges:[],predicts:[],counters:[],guarded:{},attacked:{}});
sandbox.__api.damage(u,t,3,{attack:true,melee:true});
console.log(JSON.stringify(sandbox.__api.getState()));
