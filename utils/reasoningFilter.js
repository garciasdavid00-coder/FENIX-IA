function createReasoningFilter(){
 let buffer='',output='',closing=null;
 const starts=['<think>','<thinking>','<thought>','<reasoning>'];
 function drain(final=false){
  while(buffer){
   if(closing){const at=buffer.toLowerCase().indexOf(closing);if(at<0){buffer=final?'':buffer.slice(-(closing.length-1));break}buffer=buffer.slice(at+closing.length);closing=null;continue}
   const match=/<(think|thinking|thought|reasoning)>/i.exec(buffer);
   if(match){output+=buffer.slice(0,match.index);buffer=buffer.slice(match.index+match[0].length);closing='</'+match[1].toLowerCase()+'>';continue}
   let hold=0;if(!final)for(let n=1;n<=Math.min(12,buffer.length);n++)if(starts.some(tag=>tag.startsWith(buffer.slice(-n).toLowerCase())))hold=n;
   output+=buffer.slice(0,buffer.length-hold);buffer=hold?buffer.slice(-hold):'';break;
  }
  return output;
 }
 return{push(chunk){buffer+=chunk;return drain()},final(){return drain(true)}};
}
module.exports={createReasoningFilter};
