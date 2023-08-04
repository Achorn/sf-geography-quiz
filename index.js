let projection = d3.geoMercator();
let geoGenerator = d3.geoPath().projection(projection);
let svg = d3.select("svg");
svg.attr("display", "none");

// state = playing, reviewing, finished, loading
let gameState = "playing";
let gameTimer;
let allNeighborhoodNames = [];
let nameToIdMap = new Map();

//LOAD GEOJSON MAPS
d3.json("./maps/sf_neighborhoods.geojson")
  .then(function (neighborhoods) {
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
  })
  .then(() => {
    d3.json("./maps/bay_area_counties.geojson")
      .then(function (districts) {
        svg
          .append("g")
          .selectAll("path")
          .data(districts.features)
          .join("path")
          .attr("d", geoGenerator)
          .attr("id", "district")
          .attr("stroke-width", 1);
      })
      .then(() => {
        svg.attr("display", "inline");

        Array.from(
          document.getElementById("neighborhoods").getElementsByTagName("path")
        ).forEach((neighborhood) => {
          allNeighborhoodNames.push(neighborhood.getAttribute("name"));
          nameToIdMap.set(neighborhood.getAttribute("name"), neighborhood.id);
        });
        playGame([...allNeighborhoodNames]);
      });

    d3.json("./maps/streets_of_sf.geojson").then(function (streets) {
      svg
        .append("g")
        .attr("id", "streets")
        .selectAll("path")
        .data(streets.features)
        .join("path")
        .attr("d", geoGenerator)
        .attr("id", "street")
        .attr("stroke-width", 1);
    });
    d3.json("./maps/Ferry_Routes.geojson").then(function (ferryRoute) {
      svg
        .append("g")
        .attr("id", "ferries")
        .selectAll("path")
        .data(ferryRoute.features)
        .join("path")
        .attr("d", geoGenerator)
        .attr("name", (d) => {
          return d.properties["NAME"].replace(/ /g, "");
        })
        .attr("id", (d) => {
          return d.properties["NAME"].replace(/ /g, "");
        })
        .attr("class", "ferry")
        .attr("stroke-width", 1);
    });

    d3.json("./maps/freeways.json").then(function (freeway) {
      svg
        .append("g")
        .attr("id", "freeways")
        .selectAll("path")
        .data(freeway.features)
        .join("path")
        .attr("d", geoGenerator)
        .attr("id", "freeway")
        .attr("stroke-width", 1);
    });
  });

// GAME

let resetBoard = (allPiecesNames, selectedPiecesNames) => {
  allPiecesNames.forEach((piece) => {
    let pieceElement = document.getElementById(nameToIdMap.get(piece));
    pieceElement.setAttribute("class", "unplayable");
  });
  selectedPiecesNames.forEach((piece) => {
    let pieceElement = document.getElementById(nameToIdMap.get(piece));
    pieceElement.setAttribute("class", "playable");
  });
};
let addSelectorToSelectableGamePieces = (
  selectedNeighborhoodsNames,
  method
) => {
  selectedNeighborhoodsNames.forEach((neighborhoodName) => {
    let nbhID = nameToIdMap.get(neighborhoodName);
    let selectedNeighborhoodElement = document.getElementById(nbhID);
    selectedNeighborhoodElement.addEventListener("click", function (event) {
      method(event, selectedNeighborhoodElement, nbhID);
    });
  });
};

let getNewAnswer = (selectedNeighborhoodsNames) => {
  return selectedNeighborhoodsNames[
    Math.floor(Math.random() * selectedNeighborhoodsNames.length)
  ];
};

let removeAnswerFromGuesses = (name, allPiecesNames) => {
  allPiecesNames = allPiecesNames.filter((e) => e !== name);
  return allPiecesNames;
};

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

let playGame = (selectedNeighborhoodsNames) => {
  // const result = document.querySelector(".result");

  let allPlayablePieces = [...selectedNeighborhoodsNames];
  let correctAnswers = [];
  let maybeAnswers = [];
  let wrongAnswers = [];

  let tries = 3;

  const dataDisplay = document.getElementById("dataDisplay");
  let answerPath;
  let answer = getNewAnswer(allPlayablePieces);
  dataDisplay.innerHTML = `0/${selectedNeighborhoodsNames.length} | Click on ${answer}`;

  //gameMethods

  //set  up board///
  resetBoard(allNeighborhoodNames, selectedNeighborhoodsNames);
  addSelectorToSelectableGamePieces(allPlayablePieces, guessNeighborhood);

  function guessNeighborhood(event, neighborhood) {
    let guess = neighborhood.getAttribute("name");
    if (guess === answer) {
      let color;
      if (tries == 3) color = "var(--answer_correct)";
      else if (tries <= 0) {
        color = "var(--answer_wrong)";
        document.getElementById(nameToIdMap.get(answer));
        answerPath.classList.remove("map-question_blink");
      } else color = "var(--answer_almost)";

      neighborhood.style.fill = color;
      allPlayablePieces = removeAnswerFromGuesses(answer, allPlayablePieces);
      answer = getNewAnswer(allPlayablePieces);
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

  let updateDataDisplay = () => {
    dataDisplay.innerHTML = `${
      selectedNeighborhoodsNames.length - allPlayablePieces.length
    }/${selectedNeighborhoodsNames.length} | Click on ${answer}`;
  };
};
// SVG MAP FEATURES TOGGLE
document.getElementById("streetToggle").addEventListener("change", (e) => {
  let display = document.getElementById("streets");
  display.style.display = display.style.display == "inline" ? "none" : "inline";
});

document.getElementById("freewayToggle").addEventListener("change", (e) => {
  let display = document.getElementById("freeways");
  display.style.display = display.style.display == "inline" ? "none" : "inline";
});

document.getElementById("ferryToggle").addEventListener("change", (e) => {
  let display = document.getElementById("ferries");
  display.style.display = display.style.display == "inline" ? "none" : "inline";
});

//TODO: animate boat on Ferry paths
// let createBoat = () => {
//   console.log("hello boats?");
//   let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
//   document.getElementById("mapSVG").appendChild(circle);
//   circle.setAttribute("id", "boatCircle");
//   circle.setAttribute("r", "5");
//   circle.setAttribute("fill", "purple");

//   const path = document.getElementById("Oakland-SanFrancisco");

//   // Create an object that gsap can animate
//   const val = { distance: 0 };
//   // Create a tween
//   gsap.to(val, {
//     // Animate from distance 0 to the total distance
//     distance: path.getTotalLength(),
//     // Loop the animation
//     repeat: -1,
//     // Make the animation lasts 5 seconds
//     duration: 5,
//     // Function call on each frame of the animation
//     onUpdate: () => {
//       // Query a point at the new distance value
//       const point = path.getPointAtLength(val.distance);
//       // Update the circle coordinates
//       circle.setAttribute("cx", point.x);
//       circle.setAttribute("cy", point.y);
//     },
//   });
// };
