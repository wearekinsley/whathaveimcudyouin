
const mcuActors = [
    { name: "Chris Evans", character: "Steve Rogers / Captain America" },
    { name: "Scarlett Johansson", character: "Natasha Romanoff / Black Widow" },
    { name: "Robert Downey Jr.", character: "Tony Stark / Iron Man" },
    { name: "Samuel L. Jackson", character: "Nick Fury" },
    { name: "Tom Holland", character: "Peter Parker / Spider-Man" },
    { name: "Brie Larson", character: "Carol Danvers / Captain Marvel" },
    { name: "Benedict Cumberbatch", character: "Doctor Strange" },
    { name: "Chris Hemsworth", character: "Thor" },
    { name: "Mark Ruffalo", character: "Bruce Banner / Hulk" },
    { name: "Jeremy Renner", character: "Clint Barton / Hawkeye" }
];

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
        const matches = cast.filter(name =>
            mcuActors.some(actor => actor.name.toLowerCase() === name.toLowerCase())
        );

        resultsDiv.innerHTML = "";

        if (matches.length === 0) {
            resultsDiv.innerHTML = "<p>No MCU actors found in that film.</p>";
        } else {
            const list = document.createElement("ul");
            matches.forEach(name => {
                const actor = mcuActors.find(a => a.name.toLowerCase() === name.toLowerCase());
                const item = document.createElement("li");
                item.textContent = `${actor.name} → ${actor.character}`;
                list.appendChild(item);
            });
            resultsDiv.appendChild(list);
        }
    } catch (err) {
        resultsDiv.innerHTML = "<p>Error fetching data.</p>";
        console.error(err);
    }
}
