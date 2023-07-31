const streetToggle = document.getElementById("smallStreetSelector");
const result = document.querySelector(".result");
const dataDisplay = document.getElementById("dataDisplay");
streetToggle.addEventListener("change", (event) => {
  let display = document.getElementById("layer2");
  display.style.display = display.style.display == "inline" ? "none" : "inline";
});

function showTooltip(evt) {
  let tooltip = document.getElementById("tooltip");
  if (allNeighborhoods == 0) tooltip.style.display = "none";
  tooltip.style.display = "block";
  tooltip.innerHTML = `Find: ${answer}`;
  tooltip.style.left = evt.pageX + 10 + "px";
  tooltip.style.top = evt.pageY + 10 + "px";
}

function hideTooltip() {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
}
let neighborhoodNames = [];
let nameToIdMap = new Map();
let neighborhoods = document
  .getElementById("combined")
  .getElementsByTagName("path");
Array.from(neighborhoods).forEach((neighborhood) => {
  neighborhoodNames.push(neighborhood.getAttribute("name"));
  nameToIdMap.set(neighborhood.getAttribute("name"), neighborhood.id);
  neighborhood.addEventListener("click", function (event) {
    guessNeighborhood(event, neighborhood, neighborhood.id);
  });
});

// entireMap = document.getElementsByClassName("mapsContainer")[0];
// entireMap.addEventListener("mousemove", function (event) {
//   console.log("mousemove?");
//   showTooltip(event);
// });
// entireMap.addEventListener("mouseout", function (event) {
//   hideTooltip();
// });

function guessNeighborhood(event, neighborhood, id) {
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
    document.getElementById("tooltip").innerHTML = `Find: ${answer}`;
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
  }, "2000");
  // answerBox.addEventListener("transitionend", () => {
  //   answerBox.remove();
  // });
  // let answerTooltip = document.getElementById("answerTooltip");
  // answerTooltip.style.display = "block";
  // answerTooltip.innerHTML = neighborhood.getAttribute("name");

  // const pathBBox = neighborhood.getBBox();
  // answerTooltip.style.left = event.pageX - 40 + "px";
  // answerTooltip.style.top = event.pageY + -30 + "px";

  // setTimeout(() => {
  //   console.log("end");
  //   answerTooltip.style.display = "none";
  // }, "3000");
};

let removeAnswerFromGuesses = (name) => {
  allNeighborhoods = allNeighborhoods.filter((e) => e !== name);
};
let getNewAnswer = () => {
  return allNeighborhoods[Math.floor(Math.random() * allNeighborhoods.length)];
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
