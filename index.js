let projection = d3.geoMercator();
let geoGenerator = d3.geoPath().projection(projection);
let svg = d3.select("svg");

d3.json("./sf_neighborhoods.geojson").then(function (neighborhoods) {
  projection.fitSize([325, 334], neighborhoods);
  svg
    .append("g")
    .attr("id", "neighborhoods")
    .selectAll("path")
    .data(neighborhoods.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("name", (d) => {
      return d.properties.name;
    })
    .attr("id", (d) => {
      return d.properties.name.replace(/ /g, "");
    })
    .attr("class", "neighborhood")
    .attr("stroke", "#a4d1db")
    .attr("stroke-width", 1);
  playGame();
});

d3.json("./bay_area_counties.geojson").then(function (districts) {
  svg
    .append("g")
    .selectAll("path")
    .data(districts.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("id", "district")
    .attr("stroke-width", 1);
});

d3.json("./streets_of_sf.geojson").then(function (districts) {
  svg
    .append("g")
    .attr("id", "streets")
    .selectAll("path")
    .data(districts.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("id", "street")
    .attr("stroke-width", 1);
});

d3.json("./freeways.json").then(function (districts) {
  svg
    .append("g")
    .attr("id", "freeways")
    .selectAll("path")
    .data(districts.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("id", "freeway")
    .attr("stroke-width", 1);
});

document.getElementById("streetToggle").addEventListener("change", (e) => {
  let display = document.getElementById("streets");
  display.style.display = display.style.display == "inline" ? "none" : "inline";
});

document.getElementById("freewayToggle").addEventListener("change", (e) => {
  let display = document.getElementById("freeways");
  display.style.display = display.style.display == "inline" ? "none" : "inline";
});

// GAME
let playGame = () => {
  // const result = document.querySelector(".result");
  const dataDisplay = document.getElementById("dataDisplay");
  let answerPath;
  let neighborhoodNames = [];
  let nameToIdMap = new Map();
  let neighborhoods = document
    .getElementById("neighborhoods")
    .getElementsByTagName("path");
  Array.from(neighborhoods).forEach((neighborhood) => {
    neighborhoodNames.push(neighborhood.getAttribute("name"));
    nameToIdMap.set(neighborhood.getAttribute("name"), neighborhood.id);
    neighborhood.addEventListener("click", function (event) {
      guessNeighborhood(event, neighborhood, neighborhood.id);
    });
  });
  function guessNeighborhood(event, neighborhood) {
    let guess = neighborhood.getAttribute("name");
    if (guess === answer) {
      let color;
      if (tries == 3) color = "white";
      else if (tries <= 0) {
        color = "red";
        document.getElementById(nameToIdMap.get(answer));
        answerPath.classList.remove("map-question_blink");
      } else color = "yellow";

      neighborhood.style.fill = color;
      removeAnswerFromGuesses(answer);
      answer = getNewAnswer();
      updateDataDisplay();
      tries = 3;
    } else {
      //wrong answer
      tries -= 1;
      showSelectedNeighborhoodName(event, neighborhood);
      if (tries == 0) {
        answerPath = document.getElementById(nameToIdMap.get(answer));
        answerPath.classList.add("map-question_blink");
      }
    }
  }
  let showSelectedNeighborhoodName = (event, neighborhood) => {
    var duplicate = document.getElementById(
      "answer-" + neighborhood.getAttribute("name")
    );
    if (duplicate) duplicate.remove();
    const answerBox = document.createElement("div");
    answerBox.id = "answer-" + neighborhood.getAttribute("name");
    answerBox.className = "answerTooltip";
    document.body.appendChild(answerBox);
    answerBox.innerHTML = neighborhood.getAttribute("name");
    answerBox.style.left = event.pageX - 40 + "px";
    answerBox.style.top = event.pageY + -30 + "px";

    setTimeout(() => {
      answerBox.remove();
    }, "1200");
  };

  let removeAnswerFromGuesses = (name) => {
    allNeighborhoods = allNeighborhoods.filter((e) => e !== name);
  };
  let getNewAnswer = () => {
    return allNeighborhoods[
      Math.floor(Math.random() * allNeighborhoods.length)
    ];
  };

  let allNeighborhoods = [...neighborhoodNames];
  let guessedNeighborhoods = [];
  let answer = getNewAnswer();
  dataDisplay.innerHTML = `0/${allNeighborhoods.length} | Click on ${answer}`;
  let tries = 3;

  let updateDataDisplay = () => {
    dataDisplay.innerHTML = `${
      neighborhoodNames.length - allNeighborhoods.length
    }/${neighborhoodNames.length} | Click on ${answer}`;
  };
};
