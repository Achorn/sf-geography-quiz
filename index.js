const streetToggle = document.getElementById("smallStreetSelector");
const result = document.querySelector(".result");

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

entireMap = document.getElementsByClassName("mapsContainer")[0];
entireMap.addEventListener("mousemove", function (event) {
  showTooltip(event);
});
entireMap.addEventListener("mouseout", function (event) {
  hideTooltip();
});

function guessNeighborhood(event, neighborhood, id) {
  let guess = neighborhood.getAttribute("name");
  if (guess === answer) {
    let color = "white";
    if (tries != 3) color = "yellow";
    neighborhood.style.fill = color;
    removeAnswerFromGuesses(answer);
    answer = getNewAnswer();
    showTooltip(event);
    tries = 3;
  } else {
    tries -= 1;
    if (tries == 0) {
      document.getElementById(nameToIdMap.get(answer)).style.fill = "red";
      removeAnswerFromGuesses(answer);
      answer = getNewAnswer();
      showTooltip(event);
      tries = 3;
    }
  }
}

let removeAnswerFromGuesses = (name) => {
  allNeighborhoods = allNeighborhoods.filter((e) => e !== name);
};
let getNewAnswer = () => {
  return allNeighborhoods[Math.floor(Math.random() * allNeighborhoods.length)];
};

let allNeighborhoods = [...neighborhoodNames];
let guessedNeighborhoods = [];
let answer = getNewAnswer();
let tries = 3;
