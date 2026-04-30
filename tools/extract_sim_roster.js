
const fs=require("fs"), vm=require("vm");
const file=process.argv[2] || "tools/simulate_balance_smart_ai_only.js";
let code=fs.readFileSync(file,"utf8");
// strip main execution from "const charStats" onwards to avoid running sim
const cut=code.indexOf("const charStats=");
if(cut>0) code=code.slice(0,cut);
const sandbox={console, require, __dirname:".", process:{argv:["node","x"], exit(){}}, Math, JSON, Array, Object, String, Number, Boolean, RegExp, Date, Set, Map};
vm.createContext(sandbox);
vm.runInContext(code+"\nglobalThis.__ROSTER=ROSTER;", sandbox);
console.log(JSON.stringify(sandbox.__ROSTER,null,2));
