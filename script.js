const mcuMovieIds = [1726,10138,10195,24428,68721,76338,100402,118340,99861,299536,299534,497698,566525,315635,634649,284052];
let mcuActors = new Map();

async function loadMcuActors() {
  for (const movieId of mcuMovieIds) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=03736f4f029a78812c48af853569b298`);
    const data = await res.json();
    for (const actor of data.cast) {
      if (!mcuActors.has(actor.name)) {
        mcuActors.set(actor.name, {
          id: actor.id,
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path
        });
      }
    }
  }

  for (const alias in knownAliases) {
    if (!mcuActors.has(alias)) {
      mcuActors.set(alias, {
        id: null,
        name: alias,
        character: knownAliases[alias].character,
        profile_path: null,
        future: true
      });
    }
  }
}

async function searchMovie() {
  const query = document.getElementById("movieInput").value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Searching...</p>";

  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=03736f4f029a78812c48af853569b298&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    resultsDiv.innerHTML = "<p>No movie found.</p>";
    return;
  }

  const movieId = data.results[0].id;
  const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=03736f4f029a78812c48af853569b298`);
  const creditsData = await creditsRes.json();

  const matches = creditsData.cast.filter(actor => mcuActors.has(actor.name));
  resultsDiv.innerHTML = "";

  if (matches.length === 0) {
    resultsDiv.innerHTML = "<p>No MCU actors found in that film.</p>";
  } else {
    const list = document.createElement("div");
    list.style.display = "grid";
    list.style.gridTemplateColumns = "repeat(auto-fit, minmax(150px, 1fr))";
    list.style.gap = "20px";

    matches.forEach(actor => {
      const mcuData = mcuActors.get(actor.name);
      const card = document.createElement("div");
      card.style.textAlign = "center";

      const img = document.createElement("img");
      img.src = mcuData.profile_path ? `https://image.tmdb.org/t/p/w185${mcuData.profile_path}` : "https://via.placeholder.com/150x225?text=No+Image";
      img.alt = mcuData.name;
      img.style.width = "100px";
      img.style.borderRadius = "8px";

      const link = document.createElement("a");
      link.href = mcuData.id ? `actor.html?id=${mcuData.id}` : "#";
      link.appendChild(img);

      const label = document.createElement("div");
      label.textContent = `${mcuData.name} → ${mcuData.character || "Unknown"}`;
      label.style.fontSize = "14px";

      card.appendChild(link);
      card.appendChild(label);
      list.appendChild(card);
    });

    resultsDiv.appendChild(list);
  }
}

window.onload = () => {
  loadMcuActors();
};