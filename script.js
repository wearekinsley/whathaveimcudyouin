
// Predefined MCU movie IDs from TMDb (you can expand this list)
const mcuMovieIds = [
    1726,   // Iron Man
    10138,  // Iron Man 2
    10195,  // Thor
    24428,  // The Avengers
    68721,  // Iron Man 3
    76338,  // Thor: The Dark World
    100402, // Captain America: The Winter Soldier
    118340, // Guardians of the Galaxy
    99861,  // Avengers: Age of Ultron
    299536, // Avengers: Infinity War
    299534, // Avengers: Endgame
    497698, // Black Widow
    566525, // Shang-Chi
    315635, // Spider-Man: Homecoming
    634649, // Spider-Man: No Way Home
    284052  // Doctor Strange
];

let mcuActors = new Map();

async function loadMcuActors() {
    for (const movieId of mcuMovieIds) {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=03736f4f029a78812c48af853569b298`);
            const data = await res.json();
            for (const castMember of data.cast) {
                if (!mcuActors.has(castMember.name)) {
                    mcuActors.set(castMember.name, {
                        id: castMember.id,
                        name: castMember.name,
                        character: castMember.character,
                        profile_path: castMember.profile_path
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch MCU credits for movie ID", movieId, err);
        }
    }
    console.log("Loaded MCU actor list:", Array.from(mcuActors.keys()));
}

async function searchMovie() {
    const query = document.getElementById("movieInput").value;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Searching...</p>";

    try {
        const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=03736f4f029a78812c48af853569b298&query=${encodeURIComponent(query)}`);
        const searchData = await searchRes.json();

        if (!searchData.results || searchData.results.length === 0) {
            resultsDiv.innerHTML = "<p>No movie found.</p>";
            return;
        }

        const movieId = searchData.results[0].id;

        const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=03736f4f029a78812c48af853569b298`);
        const creditsData = await creditsRes.json();

        const cast = creditsData.cast.map(actor => actor.name);
        const matches = cast.filter(name => mcuActors.has(name));

        resultsDiv.innerHTML = "";

        if (matches.length === 0) {
            resultsDiv.innerHTML = "<p>No MCU actors found in that film.</p>";
        } else {
            const list = document.createElement("div");
            list.style.display = "grid";
            list.style.gridTemplateColumns = "repeat(auto-fit, minmax(150px, 1fr))";
            list.style.gap = "20px";

            matches.forEach(name => {
                const actor = mcuActors.get(name);
                const card = document.createElement("div");
                card.style.textAlign = "center";

                const img = document.createElement("img");
                img.src = actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : "https://via.placeholder.com/150x225?text=No+Image";
                img.alt = actor.name;
                img.style.width = "100px";
                img.style.borderRadius = "8px";
                img.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";

                const label = document.createElement("div");
                label.textContent = `${actor.name} → ${actor.character}`;
                label.style.marginTop = "8px";
                label.style.fontSize = "14px";

                card.appendChild(img);
                card.appendChild(label);
                list.appendChild(card);
            });
            resultsDiv.appendChild(list);
        }
    } catch (err) {
        resultsDiv.innerHTML = "<p>Error fetching data.</p>";
        console.error(err);
    }
}

// Preload MCU actor data
window.onload = () => {
    loadMcuActors();
};
