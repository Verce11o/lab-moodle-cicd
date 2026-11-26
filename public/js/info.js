async function loadInfo() {
  const response = await fetch("/api/info");
  const info = await response.json();
  document.getElementById("info-version").textContent = info.version;
  document.getElementById("info-place").textContent = info.containerized ? "Docker-контейнер" : "Локальный запуск";
  document.getElementById("info-port").textContent = info.port;
  document.getElementById("info-courses").textContent = info.courses;
}

loadInfo();
