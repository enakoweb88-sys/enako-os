const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const source=fs.readFileSync('src/lib/api/core.ts','utf8').replace(/import\.meta\.env\.VITE_API_URL/g,"'https://fixture.invalid/api/v1'");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const values=new Map([['enako_access_token','old'],['enako_refresh_token','refresh']]);
const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
let refreshes=0,expired=0,mode='refresh';
const context={exports:{},Headers,FormData,AbortSignal,Event,sessionStorage:storage,localStorage:storage,window:{location:{hostname:'enakoos.com',origin:'https://enakoos.com'},dispatchEvent:()=>expired++},fetch:async(url,options)=>{
 assert.ok(url.startsWith('https://enakoos.com/api/v1/'));
 assert.equal(options.credentials,'same-origin');
 if(url.endsWith('/auth/refresh')){refreshes++;await new Promise(r=>setTimeout(r,20));return Response.json({accessToken:'new',refreshToken:'rotated',user:{role:'EMPLOYEE',email:'fixture@invalid.test',fullName:'Fixture'}});}
 if(mode==='forbidden')return Response.json({message:'Denied'},{status:403});
 if(mode==='revoked')return Response.json({message:'Revoked'},{status:401});
 if(mode==='invalid')return new Response('not-json');
 return options.headers.get('Authorization')==='Bearer new'?Response.json({ok:true}):Response.json({},{status:401});
}};
vm.runInNewContext(compiled,context);const api=context.exports;
(async()=>{
 assert.equal(api.SOCKET_BASE_URL,'https://enakoos.com');
 assert.equal(api.resolveApiBaseUrl('https://api.enakoos.com/api/v1',{hostname:'enakoos.com',origin:'https://enakoos.com'}),'https://enakoos.com/api/v1');
 assert.equal(api.resolveApiBaseUrl('http://127.0.0.1:5000/api/v1/',{hostname:'localhost',origin:'http://localhost:3000'}),'http://127.0.0.1:5000/api/v1');
 console.log('PASS production API stays on the OS hostname despite legacy configuration; local development remains configurable');
 const results=await Promise.all(Array.from({length:8},()=>api.apiRequest('/goals')));assert.equal(refreshes,1);assert.equal(results.length,8);console.log('PASS concurrent expired requests share one refresh and retry with the new token');
 mode='forbidden';await assert.rejects(api.apiRequest('/finance'),e=>e.status===403);assert.equal(refreshes,1);assert.equal(values.get('enako_access_token'),'new');console.log('PASS forbidden responses preserve the session and do not refresh');
 mode='invalid';await assert.rejects(api.apiRequest('/goals'),/invalid response/);console.log('PASS malformed successful responses are rejected');
 mode='revoked';await assert.rejects(api.apiRequest('/goals'));assert.equal(values.has('enako_access_token'),false);assert.equal(expired,1);console.log('PASS revoked sessions clear local credentials and notify the dashboard');
})().catch(e=>{console.error(e);process.exitCode=1;});
