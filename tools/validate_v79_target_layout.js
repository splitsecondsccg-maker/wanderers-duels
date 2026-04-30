#!/usr/bin/env node
const fs=require("fs"), vm=require("vm");
const code=fs.readFileSync("game.js","utf8");
const dataset = {};
const handler={get(t,p){if(p==="style")return {}; if(p==="classList")return {add(){},remove(){},toggle(){},contains(){return false}}; if(["appendChild","removeChild","addEventListener","setAttribute","remove","focus","scrollIntoView"].includes(p))return function(){}; if(p==="getBoundingClientRect")return function(){return {left:0,top:0,width:100,height:100,right:100,bottom:100}}; if(p==="querySelector")return function(){return el}; if(p==="querySelectorAll")return function(){return []}; if(p==="children")return []; if(p==="dataset")return dataset; return t[p]??""},set(t,p,v){t[p]=v;return true}};
const el=new Proxy({},handler);
const sandbox={
  console,
  URLSearchParams,
  location:{search:""},
  document:{getElementById(){return el},querySelector(){return el},querySelectorAll(){return []},createElement(){return el},addEventListener(){},body:el,documentElement:el},
  window:{addEventListener(){},innerWidth:480,innerHeight:800,matchMedia(){return {matches:true,addEventListener(){}}}},
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  navigator:{clipboard:{writeText(){return Promise.resolve()}}},
  Audio:function(){return {play(){return Promise.resolve()},pause(){},addEventListener(){}}},
  setTimeout(fn){ if(typeof fn==="function") fn(); return 0},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},
  alert(){},structuredClone:global.structuredClone,Math,JSON,Array,Object,String,Number,Boolean,RegExp,Date,Set,Map
};
sandbox.window=Object.assign(sandbox.window,sandbox); sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(code + `
globalThis.__api={ROSTER, targets, setState:(s)=>{state=s}, alive};
`, sandbox, {timeout:3000});
const yaura=sandbox.__api.ROSTER.find(c=>c.id==="yaura");
const ward=yaura.abilities.find(a=>a.id==="ward");
const enemy={...yaura,side:"enemy",hp:20,maxHp:20,status:{},buff:{},dead:false,row:"front"};
const enemyAlly={...yaura, id:"enemyAlly", side:"enemy", hp:20,maxHp:20,status:{},buff:{},dead:false,row:"front"};
const player={...yaura,id:"playerUnit",side:"player",hp:20,maxHp:20,status:{},buff:{},dead:false,row:"front"};
sandbox.__api.setState({units:[enemy,enemyAlly,player],protects:[],dodges:[],predicts:[],counters:[],guarded:{},attacked:{}});
const ts=sandbox.__api.targets(enemy,ward).map(u=>u.id);
if(ts.includes("playerUnit")) throw new Error("ally-range enemy ability targeted a player unit: "+ts.join(","));
if(!ts.includes("enemyAlly") || !ts.includes("yaura")) throw new Error("ally-range ability did not target enemy allies correctly: "+ts.join(","));
if(dataset.layoutMode!=="mobile") throw new Error("layout mode not set to mobile; got "+dataset.layoutMode);
console.log("v79 target/layout checks passed");
