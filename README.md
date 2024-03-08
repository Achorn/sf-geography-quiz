# SF Neighborhood Quiz

A fun interactive map of San Francisco where your knowledge of SF is tested. Try guessing all 117 neighborhoods in time to get on the leaderboard!

<img src="https://github.com/Achorn/sf-geography-quiz/assets/28990037/c6bf9eac-8e07-486b-ab46-a82244291243)" width="500" />

## Description

this app is for people who enjoy testing their knowledge of geography and San Francisco.

### Why

I became addicted to geography quizzes in my free time, and after learning about every country's location, I wanted to do the same for SF. I realized there weren't any quizes to my liking so I decided to make my own.

along with an interest in the subject, my projects also involve learning a new technology or reinforcing fundamentals. this project helped me learn more about D3.js libary and GeoJSON data.

FUN FACT

depending on who you ask, you might get conflicting answers about how many neighborhoods are in SF. Even SF's city departments can't agree on Neighborhood Boundaries!

## How to install

No installation needed. just follow the link and start playing.

## How to use

The quiz starts once you visit the site. The name of the current neighborhood will be displayed, and your task is to click on the corresponding location.

### Take your turn
you get three guesses for each neighborhood. Once you've depleted all your guesses, the correct location will glow red and white. click on it to continue to the next location.

<img src="https://github.com/Achorn/sf-geography-quiz/assets/28990037/4b52c576-8b55-433d-b448-4872c780e2ff)" width="300" />

### Moving to the next turn 
depending on if you answered correctly or wrong, your answer will be marked by 3 colors: 
- WHITE: you answered correctly the first time.
- YELLOW: you answered correctly after 1-2 guesses.
- RED: you used up all your guesses incorrectly.
<img src="https://github.com/Achorn/sf-geography-quiz/assets/28990037/fd9ca271-4f8f-41aa-90f0-427c0b75c56e)" width="300"  />


### Game over
Once you complete the quiz, the game is over and you will be prompted for a username to submit your scores. the percentage of correct answers plus the time it took to finish the game will be used to calculate your position on the leaderboard.

<img width="500" alt="Screenshot 2024-03-07 at 5 19 07 PM" src="https://github.com/Achorn/sf-geography-quiz/assets/28990037/1460dea8-bee4-4358-a41d-182e6fe22c59">

## Credits

## Features

this app uses the D3.js library to construct the map out of GeoJSON data and makes it easy to layer multiple files on top of each other, such as neighborhoods, streets, and ferry paths in the water.

## Future Goals

Transfer client from vanilla js HTML and CSS to React or Vue.

Add material UI for uniformity.

Add a quiz to guess all San Francisco Parks
