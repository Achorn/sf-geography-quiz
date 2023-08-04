let projection = d3.geoMercator();
let geoGenerator = d3.geoPath().projection(projection);
let svg = d3.select("svg");
svg.attr("display", "none");
// let game = new Game();
// state = PLAYING, REVIEWING, OVER, LOADING
let allNeighborhoodNames = [];
let nameToIdMap = new Map();

class Game {
  // variables

  resetGame = () => {};
  guessNeighborhood = () => {
    console.log("guessing neighborhood in class!!!");
  };
}

let game = new Game();
//filtered map for multiple game modes
let selectedMap = [];

let handleNeighborhoodClicked = () => {
  console.log("clicked neighborhooed");
};
let resetBoard = (allPiecesNames, selectedPiecesNames) => {
  allPiecesNames.forEach((piece) => {
    let pieceElement = document.getElementById(nameToIdMap.get(piece));
    pieceElement.setAttribute("class", "unplayable");
    removeSelectorToSelectableGamePiece(piece, game.guessNeighborhood);
  });
  selectedPiecesNames.forEach((piece) => {
    let pieceElement = document.getElementById(nameToIdMap.get(piece));
    pieceElement.setAttribute("class", "playable");
    addSelectorToSelectableSingleGamePiece(piece, game.guessNeighborhood);
  });
};

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
        resetBoard(allNeighborhoodNames, allNeighborhoodNames);

        // playGame([...allNeighborhoodNames]);
        // playGame(allNeighborhoodNames.slice(0, 20));
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
console.log("called after function");
let filterMap = (e) => {
  let value = e.target.value;
  let [centerX, centerY] = getCenterOfNeighborhood("Eureka Valley");
  let newMap = [];

  if (value == "all") newMap = [...allNeighborhoodNames];
  if (value == "top-left") {
    newMap = allNeighborhoodNames.filter((neighborhood) => {
      let [x, y] = getCenterOfNeighborhood(neighborhood);
      if (x < centerX && y < centerY) return true;
      else return false;
    });
  }
  if (value == "bottom-right") {
    newMap = allNeighborhoodNames.filter((neighborhood) => {
      let [x, y] = getCenterOfNeighborhood(neighborhood);
      if (x >= centerX && y >= centerY) return true;
      else return false;
    });
  }
  if (value == "bottom-left") {
    newMap = allNeighborhoodNames.filter((neighborhood) => {
      let [x, y] = getCenterOfNeighborhood(neighborhood);
      if (x < centerX && y >= centerY) return true;
      else return false;
    });
  }
  if (value == "top-right") {
    newMap = allNeighborhoodNames.filter((neighborhood) => {
      let [x, y] = getCenterOfNeighborhood(neighborhood);
      if (x >= centerX && y < centerY) return true;
      else return false;
    });
  }

  selectedMap = [...newMap];
};

let getCenterOfNeighborhood = (nName) => {
  let element = document.getElementById(nameToIdMap.get(nName));
  let { x, y, width, height } = element.getBoundingClientRect();
  let cx = width / 2 + x;
  let cy = height / 2 + y;
  return [cx, cy];
};

///map selection dropdown menu
var mapSelection = document.getElementById("mapSelect");
mapSelection.addEventListener("change", (event) => {
  filterMap(event);
  resetBoard(allNeighborhoodNames, selectedMap);
  //reset game?
});

let removeSelectorToSelectableGamePiece = (neighborhoodName, method) => {
  let nbhID = nameToIdMap.get(neighborhoodName);
  let selectedNeighborhoodElement = document.getElementById(nbhID);
  selectedNeighborhoodElement.removeEventListener("click", method);
};

let addSelectorToSelectableSingleGamePiece = (neighborhoodName, method) => {
  let nbhID = nameToIdMap.get(neighborhoodName);
  let selectedNeighborhoodElement = document.getElementById(nbhID);
  selectedNeighborhoodElement.addEventListener("click", method);
};

// let addSelectorToSelectableGamePieces = (
//   selectedNeighborhoodsNames,
//   method
// ) => {
//   selectedNeighborhoodsNames.forEach((neighborhoodName) => {
//     let nbhID = nameToIdMap.get(neighborhoodName);
//     let selectedNeighborhoodElement = document.getElementById(nbhID);
//     selectedNeighborhoodElement.addEventListener("click", function (event) {
//       method(event, selectedNeighborhoodElement, nbhID);
//     });
//   });
// };

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
  let allPlayablePieces = [...selectedNeighborhoodsNames];
  let correctAnswers = [];
  let maybeAnswers = [];
  let wrongAnswers = [];

  let tries = 3;

  const dataDisplay = document.getElementById("dataDisplay");
  let answerPath;
  let answer = getNewAnswer(allPlayablePieces);
  dataDisplay.innerHTML = `0/${selectedNeighborhoodsNames.length} | Click on ${answer}`;

  resetBoard(allNeighborhoodNames, selectedNeighborhoodsNames);
  addSelectorToSelectableGamePieces(allPlayablePieces, guessNeighborhood);

  let getGamePercentage = () => {
    let percentage = 0;
    percentage += correctAnswers.length;
    if (maybeAnswers.length != 0) percentage += maybeAnswers.length / 2;

    if (percentage != 0) {
      percentage = percentage / selectedNeighborhoodsNames.length;
      percentage = percentage * 100;
    }
    percentage = Math.floor(percentage);
    return percentage + "%";
  };
  function guessNeighborhood(event, neighborhood) {
    let guess = neighborhood.getAttribute("name");
    if (guess === answer) {
      let answerElement = document.getElementById(nameToIdMap.get(answer));

      // let color;
      if (tries == 3) {
        correctAnswers.push(answer);
        answerElement.setAttribute("class", "correctGuess");
      } else if (tries <= 0) {
        wrongAnswers.push(answer);
        answerElement.setAttribute("class", "wrongGuess");
        document.getElementById(nameToIdMap.get(answer));
        answerPath.classList.remove("map-question_blink");
      } else {
        maybeAnswers.push(answer);
        answerElement.setAttribute("class", "almostGuess");
      }
      allPlayablePieces = removeAnswerFromGuesses(answer, allPlayablePieces);

      //gameOver
      if (allPlayablePieces.length == 0) {
        let gameScore = getGamePercentage();
        console.log(`You got ${gameScore}%`);

        return;
      }

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
