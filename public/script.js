console.log("🔥 SCRIPT LOADED");

fetch("/api/news?limit=1000")
.then(r=>r.json())
.then(res=>{
  const list=document.getElementById("news-list");
  if(!list) return;

  const items=res?.data?.items||[];
  list.innerHTML="";

  if(items.length===0){
    list.innerHTML="<p>لا توجد أخبار حاليًا</p>";
    return;
  }

  items.forEach(n=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <h3>${n.title}</h3>
      <div class="time">
        🕒 ${new Date(n.created_at).toLocaleString("ar-PS")}
      </div>
      <a href="${n.link}" target="_blank">🔗 فتح الخبر</a>`
    ;
    list.appendChild(card);
  });
  const toTop=document.getElementById("toTop");

window.addEventListener("scroll",()=>{
  toTop.style.display=scrollY>300?"block":"none";
});

toTop.onclick=()=>scrollTo({top:0,behavior:"smooth"});
});