const CONFIG = {
  USER: "snow-cracker",
  REPO: "snowcracker"
};

let data = [];

/* ========== 加载数据 ========== */
async function load(){
  const res = await fetch("photo.json");
  data = await res.json();

  render(data);
  buildMenu();
}

/* ========== 渲染磁贴 ========== */
function render(list){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  list.forEach(p=>{
    grid.innerHTML += `
      <div class="card" onclick="openPhoto('${p.id}')">
        < img src="${p.images?.[0] || ''}">
        <div class="info">${p.airline} | ${p.type}</div>
        <div class="info">${p.airport} | ${p.date}</div>
      </div>
    `;
  });
}

/* ========== 分类构建 ========== */
function buildMenu(){
  fill("model", [...new Set(data.map(i=>i.type))], "type");
  fill("airline", [...new Set(data.map(i=>i.airline))], "airline");
  fill("airport", [...new Set(data.map(i=>i.airport))], "airport");
  fill("date", [...new Set(data.map(i=>i.date?.slice(0,7)))], "date");
}

function fill(id, arr, key){
  const el = document.getElementById(id);
  el.innerHTML = "";

  arr.forEach(v=>{
    el.innerHTML += `<div class="subItem" onclick="filter('${key}','${v}')">${v}</div>`;
  });
}

/* ========== 分类筛选 ========== */
function filter(key,value){
  render(data.filter(i=>i[key]==value));
}

/* ========== 下拉菜单 ========== */
function toggle(id){
  document.querySelectorAll(".subMenu").forEach(e=>e.style.display="none");

  const el = document.getElementById(id);
  el.style.display = el.style.display==="block" ? "none" : "block";
}

/* ========== 搜索 ========== */
document.addEventListener("input",e=>{
  if(e.target.id !== "search") return;

  const v = e.target.value.toLowerCase();
  render(data.filter(i=>JSON.stringify(i).toLowerCase().includes(v)));
});

/* ========== 上传（稳定版） ========== */
async function upload(){

  const files = document.getElementById("files").files;
  if(!files.length) return alert("请选择图片");

  let images = [];

  for(let file of files){

    const base64 = await toBase64(file);
    const path = "images/" + Date.now() + "_" + file.name;

    await fetch(`https://api.github.com/repos/${CONFIG.USER}/${CONFIG.REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + CONFIG.TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "upload image",
        content: base64.split(",")[1]
      })
    });

    images.push(path);
  }

  const jsonUrl = `https://api.github.com/repos/${CONFIG.USER}/${CONFIG.REPO}/contents/photo.json`;

  const old = await fetch(jsonUrl, {
    headers: { "Authorization": "Bearer " + CONFIG.TOKEN }
  });

  const oldData = await old.json();
  const list = JSON.parse(atob(oldData.content));

  list.push({
    id: Date.now(),
    airline: document.getElementById("airline").value,
    type: document.getElementById("type").value,
    airport: document.getElementById("airport").value,
    date: document.getElementById("date").value,
    images: images
  });

  await fetch(jsonUrl, {
    method: "PUT",
    headers: {
      "Authorization": "Bearer " + CONFIG.TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "update json",
      content: btoa(JSON.stringify(list, null, 2)),
      sha: oldData.sha
    })
  });

  alert("上传成功！");
  location.reload();
}

/* base64工具 */
function toBase64(file){
  return new Promise(resolve=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/* ========== 详情页跳转 ========== */
function openPhoto(id){
  window.location.href = "photo.html?id=" + id;
}

load();
