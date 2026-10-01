// Native 640 x 360 pixel scenery. No photos, reference cutouts, gradients or filters.
const C = { sky:'#78c8ec', skyHi:'#a9dfed', sea:'#2a8ea6', seaHi:'#43b2bc', cream:'#fbf8ee', sand:'#e1c397', ink:'#172d3b', navy:'#0f3a5e', teal:'#2e6a76', leaf:'#52a869', leafHi:'#9bbe63', leafDark:'#255b45', wood:'#a57a4e', woodDark:'#70533d', woodHi:'#d2a46e', gold:'#f3c653', coral:'#cf795a' };
const r=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const line=(c:CanvasRenderingContext2D,x0:number,y0:number,x1:number,y1:number,color:string,width=1)=>{
  x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;
  for(;;){r(c,x0-Math.floor(width/2),y0-Math.floor(width/2),width,width,color);if(x0===x1&&y0===y1)break;const e2=e*2;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}
};
const ellipse=(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,col:string)=>{for(let yy=-Math.floor(ry);yy<=ry;yy++){const ww=Math.floor(rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))));r(c,x-ww,y+yy,ww*2+1,1,col);}};
const poly=(c:CanvasRenderingContext2D,points:number[][],col:string)=>{const lo=Math.ceil(Math.min(...points.map(p=>p[1]))),hi=Math.floor(Math.max(...points.map(p=>p[1])));for(let y=lo;y<=hi;y++){const xs:number[]=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[j],b=points[i];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)r(c,Math.ceil(xs[i]),y,Math.floor(xs[i+1])-Math.ceil(xs[i])+1,1,col);}};
function cloud(c:CanvasRenderingContext2D,x:number,y:number,s=1){r(c,x,y,44*s,9*s,'#d8f2f4');r(c,x+6*s,y-5*s,30*s,12*s,C.cream);r(c,x+12*s,y-10*s,17*s,11*s,C.cream);}
function foliage(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){poly(c,[[x,y+h*.3],[x+w*.13,y+h*.1],[x+w*.32,y],[x+w*.71,y],[x+w*.92,y+h*.18],[x+w,y+h*.57],[x+w*.86,y+h*.91],[x+w*.22,y+h],[x,y+h*.7]],C.leafDark);poly(c,[[x+3,y+h*.33],[x+w*.16,y+h*.16],[x+w*.37,y+2],[x+w*.7,y+2],[x+w*.9,y+h*.22],[x+w*.94,y+h*.6],[x+w*.76,y+h*.8],[x+w*.2,y+h*.84],[x+3,y+h*.6]],C.leaf);r(c,x+w*.2,y+h*.2,w*.19,3,C.leafHi);r(c,x+w*.6,y+h*.14,w*.15,3,C.leafHi);r(c,x+w*.72,y+h*.42,w*.17,3,C.leafHi);}
function sail(c:CanvasRenderingContext2D,x:number,y:number){poly(c,[[x,y],[x+29,y],[x+22,y+6],[x+7,y+6]],C.navy);line(c,x+15,y-31,x+15,y,C.cream,2);poly(c,[[x+12,y-29],[x+2,y-3],[x+12,y-3]],C.cream);poly(c,[[x+18,y-21],[x+26,y-3],[x+18,y-3]],'#e6f2df');}
function bench(c:CanvasRenderingContext2D,x:number,y:number){for(let i=0;i<4;i++){r(c,x,y-42+i*6,80,4,C.wood);r(c,x,y-42+i*6,80,1,C.woodHi);}r(c,x-4,y-16,88,5,C.woodDark);r(c,x-4,y-16,88,2,C.woodHi);for(const dx of [7,65]){r(c,x+dx,y-9,5,21,C.ink);r(c,x+dx-3,y+10,13,3,C.ink);}line(c,x-5,y-31,x-5,y-11,C.navy,3);line(c,x+84,y-31,x+84,y-11,C.navy,3);}
function bike(c:CanvasRenderingContext2D,x:number,y:number,rider=false,frame=0){
  for(const cx of [x-21,x+22]){ellipse(c,cx,y-13,13,13,C.ink);ellipse(c,cx,y-13,10,10,'#b9c6bd');ellipse(c,cx,y-13,8,8,rider?C.sand:'#e8dbbe');line(c,cx-7,y-20,cx+7,y-6,'#82989b');line(c,cx+7,y-20,cx-7,y-6,'#82989b');ellipse(c,cx,y-13,2,2,C.navy);}
  line(c,x-21,y-13,x-6,y-36,C.teal,3);line(c,x-6,y-36,x+4,y-13,C.teal,3);line(c,x-21,y-13,x+4,y-13,C.teal,3);line(c,x-6,y-36,x+12,y-36,C.teal,3);line(c,x+4,y-13,x+12,y-36,C.teal,3);line(c,x+12,y-36,x+22,y-13,C.teal,3);
  line(c,x-6,y-36,x-8,y-42,C.ink,2);r(c,x-16,y-44,17,3,C.ink);line(c,x+12,y-36,x+10,y-46,C.navy,2);line(c,x+10,y-46,x+20,y-46,C.navy,2);r(c,x+17,y-45,7,3,C.ink);ellipse(c,x+4,y-13,4,4,'#8aa4a4');
  if(rider){const pedal=frame%4;line(c,x-8,y-45,x+(pedal%2?6:-2),y-27,'#426b86',5);line(c,x+(pedal%2?6:-2),y-27,x+(pedal%2?12:-7),y-15,C.cream,3);r(c,x-15,y-66,17,22,'#edf1e1');r(c,x-14,y-64,15,4,'#437b94');r(c,x-14,y-55,15,4,'#437b94');poly(c,[[x-13,y-65],[x-21,y-61],[x-21,y-45],[x-12,y-44]],C.navy);line(c,x+1,y-61,x+10,y-47,'#e6bc91',4);line(c,x+10,y-47,x+17,y-47,'#e6bc91',3);r(c,x-10,y-81,12,14,'#deb98e');r(c,x-12,y-84,15,5,'#41677d');r(c,x-12,y-80,20,3,'#5b8291');r(c,x-12,y-77,3,9,C.ink);r(c,x,y-75,3,3,C.ink);}
}
function ocean(c:CanvasRenderingContext2D,time:number,summit=false){r(c,0,0,640,360,C.sky);r(c,0,154,640,14,C.skyHi);r(c,0,167,640,140,C.sea);r(c,0,207,640,37,C.seaHi);r(c,0,254,640,26,'#5cbcc0');const phase=Math.floor(time/500)%8;for(let i=0;i<21;i++){const x=(i*83+phase*2)%640,y=181+(i*17)%85;r(c,x,y,12+(i%4)*6,1,i%3?'#82d3d2':'#d6f0e4');}cloud(c,194+(time*.003)%32,46,.85);cloud(c,455+(time*.002)%30,70,.65);cloud(c,335+(time*.002)%22,27,.55);sail(c,390,211);if(!summit){poly(c,[[500,167],[539,133],[568,146],[591,119],[640,128],[640,251],[481,221]],'#70a69a');poly(c,[[545,182],[576,143],[614,160],[640,140],[640,260],[516,239]],'#5d9b7d');}else{poly(c,[[640,153],[577,119],[557,135],[510,117],[464,153],[409,157],[368,186],[640,227]],'#75a7a0');poly(c,[[640,178],[587,150],[541,169],[497,145],[459,172],[427,192],[640,239]],'#54978a');}}
function lights(c:CanvasRenderingContext2D){const cord=[[75,57],[108,68],[149,77],[184,79],[224,71]];for(let i=0;i<cord.length-1;i++)line(c,cord[i][0],cord[i][1],cord[i+1][0],cord[i+1][1],C.woodDark,1);for(const [x,y] of [[103,67],[143,76],[184,79],[219,72]]){line(c,x,y,x,y+12,C.woodDark);r(c,x-3,y+12,7,10,C.navy);r(c,x-2,y+13,5,7,C.gold);r(c,x-1,y+14,2,4,'#fff2b9');r(c,x-4,y+22,9,2,C.navy);}}
function tree(c:CanvasRenderingContext2D){poly(c,[[43,54],[60,54],[62,154],[73,220],[68,283],[46,283],[45,209],[51,151]],C.woodDark);poly(c,[[50,63],[56,63],[57,161],[64,220],[59,282],[52,282],[52,208]],C.wood);line(c,54,107,111,57,C.woodDark,9);line(c,54,107,15,59,C.woodDark,10);line(c,99,64,163,67,C.woodDark,6);foliage(c,-18,-14,115,96);foliage(c,55,-8,96,68);foliage(c,114,11,80,62);foliage(c,-36,57,88,64);foliage(c,27,36,83,65);lights(c);}
function flowers(c:CanvasRenderingContext2D,x:number,y:number){for(let i=0;i<7;i++){const xx=x+i*7;line(c,xx,y,xx+1,y-10,C.leafDark);r(c,xx-3,y-11,7,4,i%2?C.coral:C.cream);r(c,xx-1,y-12,3,6,i%2?C.coral:C.cream);r(c,xx,y-10,2,2,C.gold);}}

export type JourneySceneKind='welcome'|'loading'|'ending';
export function drawJourneyScene(c:CanvasRenderingContext2D,kind:JourneySceneKind,time:number,progress=0){
  c.imageSmoothingEnabled=false;ocean(c,time,kind==='ending');
  if(kind==='ending'){
    // Distant coastal town and its observatory, viewed from the summit.
    for(let i=0;i<20;i++){const x=340+(i%7)*36,y=182+Math.floor(i/7)*25+(i%3)*4;const w=17+i%4*4,h=15+i%3*4;r(c,x,y,w,h,i%2?'#efe3c4':C.cream);poly(c,[[x-2,y],[x+w/2,y-7],[x+w+2,y]],i%2?C.coral:'#629bb0');r(c,x+4,y+5,3,5,C.navy);r(c,x+w-7,y+5,3,5,C.navy);}
    r(c,562,136,28,22,C.cream);ellipse(c,576,135,15,12,'#719eaf');r(c,563,135,26,4,'#476b87');r(c,572,145,7,13,C.navy);
    poly(c,[[0,258],[36,244],[79,259],[140,248],[205,266],[279,247],[328,270],[364,298],[425,306],[475,330],[640,344],[640,360],[0,360]],'#697e75');
    poly(c,[[0,281],[57,267],[110,279],[189,272],[254,289],[293,284],[341,306],[386,320],[479,341],[640,353],[640,360],[0,360]],'#4a645d');
    r(c,0,275,298,18,C.sand);r(c,0,275,286,3,'#f3dfb5');r(c,0,293,315,7,'#bc9d75');for(const x of [25,83,253]){r(c,x,270,5,23,C.woodDark);line(c,x+2,270,x+56,280,C.woodHi,2);}
    bike(c,166,288);r(c,223,263,21,27,C.navy);r(c,224,262,18,25,'#537990');r(c,226,265,14,8,'#779ba3');r(c,230,258,8,4,C.ink);r(c,227,278,12,8,'#31556f');r(c,231,277,4,3,C.gold);flowers(c,20,271);flowers(c,264,292);
    foliage(c,-29,270,76,43);foliage(c,581,295,80,49);
  }else{
    // Quiet coastal promenade under a tree, matching the game's street palette.
    r(c,0,265,640,16,'#d9d4bb');r(c,0,265,640,3,C.cream);r(c,0,280,640,4,'#a2aaa2');r(c,0,284,640,76,'#7c979e');r(c,0,287,640,3,'#b2c3bc');r(c,0,329,640,3,'#a4b4aa');r(c,0,346,640,14,'#607e89');
    for(let x=18;x<640;x+=69){r(c,x,294,34,1,'#95b1af');r(c,x+17,322,24,1,'#688690');}
    tree(c);bench(c,101,274);flowers(c,5,283);flowers(c,567,283);foliage(c,-23,275,62,41);
    if(kind==='welcome'){bike(c,244,284);r(c,168,263,12,11,'#739095');r(c,170,257,8,8,C.navy);r(c,127,275,25,8,C.woodDark);}
    else{const x=-50+Math.min(1,progress)*755;for(let i=3;i>0;i--){c.globalAlpha=.16+i*.05;bike(c,x-i*23,318,true,Math.floor(time/140));}c.globalAlpha=1;bike(c,x,318,true,Math.floor(time/140));}
  }
  // A pair of tiny gulls. Integer positions keep animation crisp.
  const gx=320+Math.round(Math.sin(time/2500)*14),gy=91+Math.round(Math.sin(time/900)*2);line(c,gx-7,gy-3,gx,gy,C.cream,2);line(c,gx,gy,gx+7,gy-3,C.cream,2);line(c,gx+80,gy+21,gx+85,gy+23,'#e8f4df');line(c,gx+85,gy+23,gx+90,gy+21,'#e8f4df');
}
