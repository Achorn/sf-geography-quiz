// paths = document.getElementsByTagName(path);

// console.log(paths);
//

function handleChange(e, id) {
  console.log(e);
}

const streetToggle = document.getElementById("smallStreetSelector");
const result = document.querySelector(".result");

streetToggle.addEventListener("change", (event) => {
  let display = document.getElementById("layer2");
  display.style.display = display.style.display == "inline" ? "none" : "inline";
});
