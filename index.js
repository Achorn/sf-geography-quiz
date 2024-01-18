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
var modalScore = document.getElementById("modalScore");
var modalTime = document.getElementById("modalTime");
let darkModeToggle = document.getElementById("darkModeToggle");
var OpenSidebarButton = document.getElementById("OpenSidebarButton");
var closeSidebarButton = document.getElementById("closeSidebarButton");

var sidebar = document.getElementById("sidebar");
var scoreDisplayElement = document.getElementById("scoreDisplay");
var timerDisplayElement = document.getElementById("timerDisplay");
var hintDisplayElement = document.getElementById("answerDisplay");

let localState = localStorage.getItem("toad-state");
document.getElementById("score-username").value =
  localStorage.getItem("username") || "";

let scoreFormDisplay = document.getElementById("scoreFormDisplay");
let scoreForm = document.getElementById("scoreSubmit");
let scoreBtn = document.getElementById("submit-score-btn");
let scoreState = document.getElementById("score-status");

let wakeUpServer = () => {
  fetch("https://sf-neighborhood-scores-api.onrender.com/")
    .then((res) => res.json())
    .then((res) => console.log(res))

    .catch((err) => console.log(err));
};
wakeUpServer();

window.onload = () => {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  toggleDarkMode(isDark);
};

modalPlayAgainBtn.onclick = function () {
  modal.style.display = "none";
};
modalReviewBtn.onclick = function () {
  modal.style.display = "none";
};
span.onclick = function () {
  modal.style.display = "none";
};
class Game {
  allNeighborhoods = []; //all neighborhoods on the board
  mapSelectionNeighborhoods = []; //game mode selection(section of map)
  filteredSelectedNeighborhoods = []; //selected map of filtered neighborhoods for replaying or reviewing
  neighborhoodsLeftToSelect = []; //neighborhoods left to select during game

  correctAnswers = [];
  almostAnswers = [];
  wrongAnswers = [];
  startTime;
  endTime;
  interval;
  tries = 3;
  answer = "";
  dataDisplay = document.getElementById("dataDisplay");

  startTimer(elaspedTimeFunction) {
    let time = elaspedTimeFunction(this.startTime, Date.now());
    timerDisplayElement.innerHTML = time;
  }

  updateBoardWithPlayableNeighborhoods(newNeighborhoods) {
    this.mapSelectionNeighborhoods = newNeighborhoods;
    this.resetGame();
  }
  isReview = () => {
    console.log(this.mapSelectionNeighborhoods.length);
    console.log(this.filteredSelectedNeighborhoods.length);
    return (
      this.filteredSelectedNeighborhoods.length !=
      this.mapSelectionNeighborhoods.length
    );
  };
  resetGame = () => {
    this.filteredSelectedNeighborhoods = this.mapSelectionNeighborhoods;
    this.clearBoard();
  };
  replayGame = () => {
    this.clearBoard();
  };
  reviewGame = () => {
    this.filteredSelectedNeighborhoods = [
      ...this.almostAnswers,
      ...this.wrongAnswers,
    ];
    this.clearBoard();
  };

  clearBoard() {
    this.allNeighborhoods.forEach((piece) => {
      let pieceElement = document.getElementById(nameToIdMap.get(piece));
      pieceElement.setAttribute("class", "unplayable");
    });
    this.filteredSelectedNeighborhoods.forEach((piece) => {
      let pieceElement = document.getElementById(nameToIdMap.get(piece));
      pieceElement.setAttribute("class", "playable");
    });
    this.neighborhoodsLeftToSelect = this.filteredSelectedNeighborhoods;
    this.correctAnswers = [];
    this.almostAnswers = [];
    this.wrongAnswers = [];
    this.tries = 3;
    this.answer = this.getNewAnswer();
    clearInterval(this.interval);
    this.startGame();
  }

  set allNeighborhoods(newNeighborhoods) {
    this.allNeighborhoods = newNeighborhoods;
  }

  updateDataDisplay = () => {
    let score = `${
      this.filteredSelectedNeighborhoods.length -
      this.neighborhoodsLeftToSelect.length
    }/${this.filteredSelectedNeighborhoods.length}`;
    let hint = `Click on ${this.answer}`;
    scoreDisplayElement.innerHTML = score;
    hintDisplayElement.innerHTML = hint;
  };
  startGame = () => {
    this.answer = this.getNewAnswer();
    this.updateDataDisplay();
    this.startTime = Date.now();
    timerDisplayElement.innerHTML = "00:00";

    clearInterval(this.interval);
    this.interval = setInterval(
      () => this.startTimer(this.getTimeElapsedInMinutesSeconds),
      1000
    );
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
    if (this.almostAnswers.length != 0)
      percentage += this.almostAnswers.length / 2;

    if (percentage != 0) {
      percentage = percentage / this.filteredSelectedNeighborhoods.length;
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
        this.almostAnswers.push(this.answer);
        answerElement.setAttribute("class", "almostGuess");
      }
      this.removeAnswerFromGuesses(this.answer);

      //gameOver
      if (this.neighborhoodsLeftToSelect.length == 0) {
        clearTimeout(this.interval);
        let gameScore = this.getGamePercentage();
        this.endTime = Date.now();
        let time = this.getTimeElapsedInMinutesSeconds(
          this.startTime,
          this.endTime
        );
        showGameOverModal(`You got ${gameScore}%`, time);
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
    // this.printGameStats();
  }
  getTimeElapsedInSeconds = () => {
    let time = this.endTime - this.startTime;
    time /= 1000;
    return time;
  };
  getTimeElapsedInMinutesSeconds(start, end) {
    let difference = end - start;
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);
    var fixedDisplaySeconds = ("0" + seconds).slice(-2);
    var fixedDisplayMinutes = ("0" + minutes).slice(-2);
    var fixedStrDisplayTime = fixedDisplayMinutes + ":" + fixedDisplaySeconds;
    return fixedStrDisplayTime;
  }
  printGameStats = () => {
    console.log(`
    allNeighborhoods: ${this.allNeighborhoods.length};

    mapSelectedNeighborhoods: ${this.mapSelectionNeighborhoods.length};
    filtered neighborhoods: ${this.filteredSelectedNeighborhoods.length};
    neighborhoods left ${this.neighborhoodsLeftToSelect.length};

    correct answers: ${this.correctAnswers.length}
    close answers: ${this.almostAnswers.length}
    wrong answers: ${this.wrongAnswers.length}
    `);
  };
}
let game = new Game();

let showGameOverModal = (text, time) => {
  modal.style.display = "block";
  scoreBtn.disabled = false;
  modalScore.innerHTML = text;
  modalTime.innerHTML = `Time: ${time}`;
  if (game.filteredSelectedNeighborhoods.length == game.correctAnswers.length) {
    modalReviewBtn.style.display = "none";
  } else {
    modalReviewBtn.style.display = "inline";
  }
  console.log(game.isReview());
  if (game.isReview()) scoreFormDisplay.style.display = "none";
  else scoreFormDisplay.style.display = "inline";
  scoreState.innerHTML = "";
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};
modalPlayAgainBtn.addEventListener("click", game.replayGame);
let resetGameButton = document.getElementById("resetGameButton");
resetGameButton.addEventListener("click", game.resetGame);
modalReviewBtn.addEventListener("click", game.reviewGame);

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
      .attr("class", "neighborhood");
  })
  .then(() => {
    d3.json("./maps/bay_area_counties.geojson")
      .then(function (districts) {
        svg
          .append("g")
          .attr("id", "districts")
          .selectAll("path")
          .data(districts.features)
          .join("path")
          .attr("d", geoGenerator)
          .attr("id", "district")
          .attr("class", "district")
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

  // if (value == "tester") {
  //   newMap = ["Eureka Valley", "Corona Heights", "Lake Street"];
  // }
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

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    let isDark = e.matches;

    document
      .querySelector("body")
      .setAttribute("data-theme", isDark ? "dark" : "light");
    document.getElementById("darkModeCheck").checked = isDark;
  });

//DARKMODE
let toggleDarkMode = (isDark) => {
  document
    .querySelector("body")
    .setAttribute("data-theme", isDark ? "dark" : "light");
  document.getElementById("darkModeCheck").checked = isDark;
};

darkModeToggle.addEventListener("change", (e) => {
  let checked = e.target.checked;
  document
    .querySelector("body")
    .setAttribute("data-theme", checked ? "dark" : "light");
});

// document.getElementById("freewayToggle").addEventListener("change", (e) => {
//   let display = document.getElementById("freeways");
//   display.style.display = display.style.display == "inline" ? "none" : "inline";
// });

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

//SIDEBAR METHODS
OpenSidebarButton.addEventListener("click", (event) => {
  sidebar.style.display = "block";
});
closeSidebarButton.addEventListener("click", (e) => {
  sidebar.style.display = "none";
});

//SCOREBOARD METHODS

scoreForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let time = game.getTimeElapsedInSeconds();
  let score = game.getGamePercentage() / 100;
  let map = document.getElementById("mapSelect").value;
  const formData = new FormData(scoreForm);
  localStorage.setItem("username", formData.get("username"));

  formData.append("score", score);
  formData.append("time", time);
  formData.append("map", map);

  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: formDataJsonString,
  };

  let uri = "https://sf-neighborhood-scores-api.onrender.com/api/score";
  scoreBtn.disabled = true;
  scoreState.innerHTML = "Submitting...";
  fetch(uri, fetchOptions)
    .then((res) => res.json())
    .then((res) => {
      console.log("response");
      if (res.err) console.log("err: ", res.err.message);
      else console.log("res :", res);
      scoreState.innerHTML = "submitted!";
    })
    .catch((err) => {
      console.log("error");
      console.log(err.message);
      scoreState.innerHTML = "error saving. try again";
      scoreBtn.disabled = false;
    });
});

let scoreBoard = document.getElementById("scores");

let displayScores = (data) => {
  scoreBoard.innerHTML = "";
  let scoreElements = data.map((score) => createScoreElement(score));
  scoreElements.forEach((score) => scoreBoard.appendChild(score));
};

let createScoreElement = (score) => {
  const newScore = document.createElement("div");
  newScore.classList.add("score");

  let name = document.createElement("div");
  name.innerHTML = score.username;
  newScore.appendChild(name);

  let scoreNum = document.createElement("div");
  scoreNum.innerHTML = score.score * 100 + "%";
  newScore.appendChild(scoreNum);

  const minutes = Math.floor(score.time / 60);
  let seconds = ~~(score.time - minutes * 60);
  console.log(seconds);
  seconds = seconds < 10 ? "0" + seconds : seconds;

  let time = document.createElement("div");
  time.innerHTML = minutes + ":" + seconds;
  newScore.appendChild(time);

  return newScore;
};

let uri = "https://sf-neighborhood-scores-api.onrender.com/api/scores";
let getHighScores = () => {
  let limit = 10;
  let orderByScores = "scores";
  let orderByTimes = "time";
  let mapFilter = docuement.getElementById();
  let map = document.getElementById("mapSelect").value;

  fetch(uri)
    .then((data) => data.json())
    .then((data) => {
      displayScores(data);
    })
    .catch((err) => {
      scoreBoard.innerHtml = "error";
      console.log(err);
    });
};

getHighScores();
