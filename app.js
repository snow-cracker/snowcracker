const CONFIG = {
  USER: "snow-cracker",
  REPO: "snowcracker"
};

let data = [];

async function load(){
  const res = await fetch("photo.json");
  data = await res.json();
  render(data);
  buildMenu();
}

function render(list){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  list.forEach(p=>{
    grid.innerHTML += `
      <div class="card">
        < img src="${p.images?.[0] || ''}">
        <div class="info">${p.airline} | ${p.type}</div>
        <div class="info">${p.airport} | ${p.date}</div>
      </div>
    `;
  });
}

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

function toggle(id){
  document.querySelectorAll(".subMenu").forEach(e=>e.style.display="none");
  const el = document.getElementById(id);
  el.style.display = el.style.display==="block"?"none":"block";
}

function filter(key,value){
  render(data.filter(i=>i[key]==value));
}

document.getElementById("search").addEventListener("input",e=>{
  const v = e.target.value.toLowerCase();
  render(data.filter(i=>JSON.stringify(i).toLowerCase().includes(v)));
});

async function upload(){
  alert("下一步接GitHub API上传（马上做）");
}

load();
