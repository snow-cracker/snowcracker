async function upload(){

  const files = document.getElementById("files").files;
  if(!files.length) return alert("请选择图片");

  let images = [];

  for(let file of files){

    const base64 = await toBase64(file);
    const path = "images/" + Date.now() + "_" + file.name;

    // 1️⃣ 上传图片
    const imgRes = await fetch(
      `https://api.github.com/repos/${CONFIG.USER}/${CONFIG.REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + CONFIG.TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "upload image",
          content: base64.split(",")[1]
        })
      }
    );

    const imgData = await imgRes.json();
    images.push(imgData.content ? path : path);
  }

  // 2️⃣ 读取旧 JSON
  const jsonUrl = `https://api.github.com/repos/${CONFIG.USER}/${CONFIG.REPO}/contents/photo.json`;

  const old = await fetch(jsonUrl, {
    headers: { "Authorization": "Bearer " + CONFIG.TOKEN }
  });

  const oldData = await old.json();
  const content = atob(oldData.content);
  const list = JSON.parse(content);

  // 3️⃣ 新数据
  list.push({
    airline: airline.value,
    type: type.value,
    airport: airport.value,
    date: date.value,
    images: images
  });

  // 4️⃣ 写回 JSON
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
