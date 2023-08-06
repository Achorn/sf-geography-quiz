let projection = d3.geoMercator();
let geoGenerator = d3.geoPath().projection(projection);
let svg = d3.select("svg");
svg.attr("display", "none");
let allNeighborhoodNames = [];
let nameToIdMap = new Map();
let selectedMap = [];

var modalPlayAgainBtn = document.getElementById("playAgainButton");
var modalReviewBtn = document.getElementById("reviewButton");
var span = document.getElementsByClassName("close")[0];
var modal = document.getElementById("myModal");

modalPlayAgainBtn.onclick = function () {
  modal.style.display = "none";
};
span.onclick = function () {
  modal.style.display = "none";
};
class Game {
  allNeighborhoods = []; //all neighborhoods on the board
  playableNeighborhoods = []; //selected map of filtered neighborhoods
  neighborhoodsLeftToSelect = []; //neighborhoods left to select during game

  correctAnswers = [];
  maybeAnswers = [];
  wrongAnswers = [];

  tries = 3;
  answer = "";
  dataDisplay = document.getElementById("dataDisplay");

  updateBoardWithPlayableNeighborhoods(newNeighborhoods) {
    console.log("updating playableNeighborhoods");
    this.playableNeighborhoods = newNeighborhoods;
    this.resetGame();
  }

  resetGame = () => {
    console.log("resetting game");
    this.allNeighborhoods.forEach((piece) => {
      let pieceElement = document.getElementById(nameToIdMap.get(piece));
      pieceElement.setAttribute("class", "unplayable");
    });
    this.playableNeighborhoods.forEach((piece) => {
      let pieceElement = document.getElementById(nameToIdMap.get(piece));
      pieceElement.setAttribute("class", "playable");
    });
    this.neighborhoodsLeftToSelect = this.playableNeighborhoods;
    this.correctAnswers = [];
    this.maybeAnswers = [];
    this.wrongAnswers = [];
    this.tries = 3;
    this.answer = this.getNewAnswer();
    this.startGame();
  };

  set allNeighborhoods(newNeighborhoods) {
    console.log("setting all neighborhoods");
    this.allNeighborhoods = newNeighborhoods;
  }

  updateDataDisplay = () => {
    this.dataDisplay.innerHTML = `${
      this.playableNeighborhoods.length - this.neighborhoodsLeftToSelect.length
    }/${this.playableNeighborhoods.length} | Click on ${this.answer}`;
  };
  startGame = () => {
    this.answer = this.getNewAnswer();
    console.log("starting game!");
    this.updateDataDisplay();
    //start timer
  };
  getNewAnswer = () => {
    return this.neighborhoodsLeftToSelect[
      Math.floor(Math.random() * this.neighborhoodsLeftToSelect.length)
    ];
  };
  removeAnswerFromGuesses = (name) => {
    this.neighborhoodsLeftToSelect = this.neighborhoodsLeftToSelect.filter(
      (e) => e !== name
    );
  };
  getGamePercentage = () => {
    let percentage = 0;
    percentage += this.correctAnswers.length;
    if (this.maybeAnswers.length != 0)
      percentage += this.maybeAnswers.length / 2;

    if (percentage != 0) {
      percentage = percentage / this.playableNeighborhoods.length;
      percentage = percentage * 100;
    }
    percentage = Math.floor(percentage);
    return percentage;
  };

  guessNeighborhood(event, neighborhood) {
    if (this.neighborhoodsLeftToSelect.length === 0) return;
    //show name of neighborhood regardless...
    let guess = neighborhood.getAttribute("name");
    if (guess === this.answer) {
      let answerElement = document.getElementById(nameToIdMap.get(this.answer));
      if (this.tries == 3) {
        this.correctAnswers.push(this.answer);
        answerElement.setAttribute("class", "correctGuess");
      } else if (this.tries <= 0) {
        this.wrongAnswers.push(this.answer);
        answerElement.setAttribute("class", "wrongGuess");
        document.getElementById(nameToIdMap.get(this.answer));
        // answerPath.classList.remove("map-question_blink");
      } else {
        this.maybeAnswers.push(this.answer);
        answerElement.setAttribute("class", "almostGuess");
      }
      this.removeAnswerFromGuesses(this.answer);

      //gameOver
      if (this.neighborhoodsLeftToSelect.length == 0) {
        //TODO: fix game score
        let gameScore = this.getGamePercentage();
        console.log(`You got ${gameScore}%`);
        showGameOverModal(`You got ${gameScore}%`);
        return;
      }

      this.answer = this.getNewAnswer();
      this.updateDataDisplay();
      this.tries = 3;
    } else {
      //wrong answer
      this.tries -= 1;
      showSelectedNeighborhoodName(event, neighborhood);
      if (this.tries == 0) {
        let answerPath = document.getElementById(nameToIdMap.get(this.answer));
        answerPath.classList.add("map-question_blink");
      }
    }
    this.printGameStats();
  }
  printGameStats = () => {
    console.log(`
    all neighborhoods: ${this.playableNeighborhoods.length};
    neighborhoods left ${this.neighborhoodsLeftToSelect.length};

    correct answers: ${this.correctAnswers.length}
    close answers: ${this.maybeAnswers.length}
    wrong answers: ${this.wrongAnswers.length}
    `);
  };
}
let game = new Game();

let showGameOverModal = (text) => {
  modal.style.display = "block";
  modalText.innerHTML = text;
  if (game.playableNeighborhoods.length == game.correctAnswers.length) {
    modalReviewBtn.style.display = "none";
  } else modalReviewBtn.style.display = "inline";

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};
modalPlayAgainBtn.addEventListener("click", game.resetGame);
let resetGameButton = document.getElementById("resetGameButton");
resetGameButton.addEventListener("click", game.resetGame);

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
          neighborhood.addEventListener("click", (e) =>
            game.guessNeighborhood(e, neighborhood)
          );
        });

        game.allNeighborhoods = allNeighborhoodNames;
        game.updateBoardWithPlayableNeighborhoods(allNeighborhoodNames);
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

  if (value == "tester") {
    newMap = ["Eureka Valley", "Corona Heights"];
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
  // resetBoard(allNeighborhoodNames, selectedMap);
  //reset game?
  // game.neighborhoods = selectedMap;
  game.updateBoardWithPlayableNeighborhoods(selectedMap);
  // game.resetGame();
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

// SVG MAP FEATURES TOGGLE
document.getElementById("streetToggle").addEventListener("change", (e) => {
  let display = document.getElementById("streets");
  display.style.display = display.style.display == "inline" ? "none" : "inline";
});

// document.getElementById("freewayToggle").addEventListener("change", (e) => {
//   let display = document.getElementById("freeways");
//   display.style.display = display.style.display == "inline" ? "none" : "inline";
// });

// document.getElementById("ferryToggle").addEventListener("change", (e) => {
//   let display = document.getElementById("ferries");
//   display.style.display = display.style.display == "inline" ? "none" : "inline";
// });

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
