// Query Selectors and global variables
var cities = [];
var currentCityName = "";
var cityIconEl = document.querySelector("#currentIcon");
var cityInputEl = document.querySelector("#formInput");
var citySubmitEl = document.querySelector("#citySubmit");
var cityNameEl = document.querySelector("#cityName");
var cityTempEl = document.querySelector("#cityTemp");
var cityWindEl = document.querySelector("#cityWind");
var cityHumidityEl = document.querySelector("#cityHumidity");
var cityUVIEl = document.querySelector("#cityUVI");
var forecastContainerEl = document.querySelector("#forecastContainer");
var dataContainerEl = document.querySelector("#dataContainer");
var formContainerEl = document.querySelector("#formContainer");
var buttonContainerEl = document.querySelector("#buttonContainer");
var clearHistoryEl = document.querySelector("#deleteHistory");

// Initial fetch (displays Atlanta's data onto the page)
fetch('https://api.openweathermap.org/data/2.5/weather?q=Atlanta&appid=8a42d43f7d7dc180da5b1e51890e67dc')
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        currentCityName = data.name;
        return fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly&units=imperial&appid=8a42d43f7d7dc180da5b1e51890e67dc`)
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        applyCityStats(data.current);
        forecastConstructor(data.daily);

    });

/* 
=================================
DISCLAIMER:

In all fetch requests throughout this code I am using my instructor's API key. This is due to the fact that
Open Weather API changed its pricing requirements for one call api (the only api that allows you to view UV indexes)
In order to view UV indexes with my own API key I would have to subscribe to the API.

With the free API key provided I can not access the one call API, and as such I was required to use my instructor's for this project

See here:
https://openweathermap.org/price#weather

=================================

*/

// City search logic
var citySearch = function(cityName) {
    // Using the cityName argument, we call for current weather data of said city
    fetch('https://api.openweathermap.org/data/2.5/weather?q='+ cityName +'&appid=8a42d43f7d7dc180da5b1e51890e67dc')
        .then(function (res) {
            // Parses response into json
            return res.json();
        })
        .then(function (data) {
            // Sets the current city's name for reference
            // Only able to do this if the city is valid, allowing us to verify the user did not enter random characters but an actual city
            currentCityName = data.name;
            // Resets the search bar's value to empty
            cityInputEl.value = ""
            // fetches the one call API for our city, using the longitude and latitude data we got from the current weather API
            return fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly&units=imperial&appid=8a42d43f7d7dc180da5b1e51890e67dc`)
        })
        .then(function (res) {
            // Parses response into json
            return res.json();
        })
        .then(function (data) {
            // Calls the applyCityStats function with the "current" object from our fetched data
            applyCityStats(data.current);

            // Removes the 5 day forecast container and reconstructs it before calling the forecastConstructor function
            forecastContainerEl.remove();
            var newFCEl = document.createElement("div");
            newFCEl.classList.add("d-flex");
            newFCEl.setAttribute("id", "forecastContainer");
            dataContainerEl.appendChild(newFCEl);

            // Calls the forecastConstructor function with the "daily" array from our fetched data
            forecastConstructor(data.daily);

            // Logic for checking city names before adding to saved history buttons
            // If the array has no cities there's no need to check for duplicate cities
            if (cities.length === 0) {

                var cityObject = {
                    name: currentCityName
                }
    
                // Adds it to first index in array and pushes the rest down
                cities.unshift(cityObject);

                // Calls the save cities function and the constructors needed to display the buttons on the page
                saveCities();
                buttonContainerConstructor();
                buttonHistoryConstructor();

            // If longer than 0 but less than 8 then  
            } else if (cities.length < 8) {

                // We loop through our cities array, checking if we find any of the same city name we just searched.
                // If we do then the loop breaks
                // If iterate through the loop and find no duplicates then we add onto our history array
                for (i = 0 ; i < cities.length; i++) {

                   if (cities[i].name == currentCityName) {

                        break;
    
                    } else if (i === cities.length - 1) {

                        var cityObject = {
                            name: currentCityName
                        }
            
                        cities.unshift(cityObject);

                        saveCities();
                        buttonContainerConstructor();
                        buttonHistoryConstructor();
    
                    }
                }
            
            // Once the array grows longer than 7 then we change some of the logic since we want our history to be max 8 length
            // We loop through the array as usual, however, when we want to add a city to the history we remove the last city and
            // push the rest of the cities down, allowing the most recent city to always be the first one in our history

            } else {

                for (i = 0 ; i < cities.length; i++) {

                    if (cities[i].name == currentCityName) {
 
                         break;
     
                    } else if (i === cities.length - 1) {
 
                        var cityObject = {
                            name: currentCityName
                        }

                        cities.pop()
                        cities.unshift(cityObject);

                        saveCities();
                        buttonContainerConstructor();
                        buttonHistoryConstructor();
     
                    }

                }
            }

        // Catches errors and lets the user know their request couldn't be processed. Resets the city input to be empty and the current city name to empty
        })
        .catch(function () {
            alert("Couldn't process request!");
            currentCityName = "";
            cityInputEl.value = "";

        });

};

// Removes and reconstructs the button container
var buttonContainerConstructor = function() {
    buttonContainerEl.remove()
    var newBCEl = document.createElement("div");
    newBCEl.setAttribute("id", "buttonContainer");
    formContainerEl.appendChild(newBCEl);
};

// "Search" button logic
var citySearchInput = function(event) {

    // Since the button is part of a form and is type submit, we prevent its default functionality of reloading the page
    event.preventDefault();

    // Gets the value of the city input element and trims it
    var csText = cityInputEl.value.trim();

    // If it is empty then alert the user, otherwise call the citySearch function
    if (csText === null || csText === "") {
        alert("Input must not be empty!");
    } else {
        citySearch(csText);
    }

};

// Logic for applying city stats to the page
var applyCityStats = function(currentStats) {

    // Uses moment.js to format unix time into a date
    cityTime = moment.unix(currentStats.dt).format('L');
    // Sets the current city's icon to its appropriate icon from fetched data
    cityIconEl.setAttribute("src", "http://openweathermap.org/img/wn/"+currentStats.weather[0].icon+".png");

    // Sets text content of the current city section
    cityNameEl.textContent = currentCityName + " (" + cityTime + ")";
    cityTempEl.textContent = "Temp: " + currentStats.temp + " °F";
    cityWindEl.textContent = "Wind: " + currentStats.wind_speed + " MPH";
    cityHumidityEl.textContent = "Humidity: " + currentStats.humidity + "%";
    cityUVIEl.textContent = currentStats.uvi;

    // Checks UVI index and displays a backgrounbd color appropriate to its level of danger
    if (currentStats.uvi <= 2) {
        cityUVIEl.classList.remove('bg-danger');
        cityUVIEl.classList.remove('bg-warning');
        cityUVIEl.classList.add('bg-success');
    } else if (currentStats.uvi > 2 && currentStats.uvi <= 5 ) {
        cityUVIEl.classList.remove('bg-success');
        cityUVIEl.classList.remove('bg-danger');
        cityUVIEl.classList.add('bg-warning');
    } else {
        cityUVIEl.classList.remove('bg-success');
        cityUVIEl.classList.remove('bg-warning');
        cityUVIEl.classList.add('bg-danger');
    }

};

// 5 day forecast constructor function
var forecastConstructor = function(dailyStats) {

    // Selects the forecastcontainer again since we delete it prior to calling this function

    forecastContainerEl = document.querySelector("#forecastContainer");

    // Loops 5 times
    for (n=1; n<6; n++) {

        // formats unix time from api using moment.js
        var unixTime = dailyStats[n].dt;
        var formattedTime = moment.unix(unixTime).format('L');

        // Creates necessary elements for each day
        var imgEl = document.createElement("img");
        var forecastCardEl = document.createElement("div");
        var divEl = document.createElement("div");
        var h2El = document.createElement("h2");

        // Adds necessary classes and attributes to our elements
        forecastCardEl.classList.add("forecastCard");
        forecastCardEl.classList.add("col");
        divEl.classList.add("p-3");
        h2El.setAttribute("id", "day-" + n);
        imgEl.setAttribute("src", "http://openweathermap.org/img/wn/"+dailyStats[n].weather[0].icon+".png")

        // Sets the content of our h2 to the dates for each day
        h2El.textContent = formattedTime;

        // Appends children
        divEl.appendChild(h2El);
        divEl.appendChild(imgEl);

        // Loops 3 times
        for (i=0; i<3; i++) {
            // Creates p elements for each statistic we want to display in our forecast cards
            var pEl = document.createElement("p");
            pEl.setAttribute("id", "day-" + n + "-" + i);

            // The first p element should display the temperature, the second the wind, and so on
            if (i===0) {
                pEl.textContent = "Temp: " + dailyStats[n].temp.day + "°F";
            } else if (i===1) {
                pEl.textContent = "Wind: " + dailyStats[n].wind_speed + " MPH";
            } else {
                pEl.textContent = "Humidity: " + dailyStats[n].humidity + " %";
            }

            // Lastly we append the elements to our div
            divEl.appendChild(pEl);
        }

        // Appends all elements to display on the page
        forecastCardEl.appendChild(divEl);
        forecastContainerEl.appendChild(forecastCardEl);

    }
};

// Save cities logic
var saveCities = function() {
    // Stringifies our cities array and saves it to our specified key
    localStorage.setItem("citiesT2b3XQw67Q6n", JSON.stringify(cities));
};

// Load cities logic
var loadCities = function() {

    // Parses our cities from our specified key in local storage
    var loadedCities = JSON.parse(localStorage.getItem("citiesT2b3XQw67Q6n"));

    // If there are no cities then return false
    // Otherwise, set our cities array equal to the array from local storage and construct the buttons from our history
    if (!loadedCities) {
        return false;
    } else {
        cities = loadedCities;
        buttonHistoryConstructor();
    }
};

// Logic for clicking on a history button
var buttonHistoryEvent = function(event) {

    // Gets the element clicked
    var target = event.target;
    // Gets the text content of said target (always a city)
    var targetText = target.textContent
    // Calls the city search function with said city name
    citySearch(targetText);

}

// History button constructor logic
var buttonHistoryConstructor = function() {

    // Selects the history button container div since it has been deleted prior to this function being called
    buttonContainerEl = document.querySelector("#buttonContainer");

    // Loops through the length of the array and constructs buttons for each city stored
    // Then appends them and displays them with their appropriate city names
    for (i=0; i < cities.length; i++) {
        var buttonEl = document.createElement("button");
        buttonEl.classList.add("btn");
        buttonEl.classList.add("btnFormat");
        buttonEl.classList.add("btn-secondary");
        buttonEl.classList.add("text-dark");
        buttonEl.textContent = cities[i].name;
        buttonEl.addEventListener("click", buttonHistoryEvent);

        buttonContainerEl.appendChild(buttonEl);
    }

};

// Clear history button logic
var clearHistory = function() {
    // Empties cities array
    cities = [];
    // Saves empty array
    saveCities();
    // Loads empty array onto the page (deletes previous history)
    loadCities();
    buttonContainerConstructor();
};

// Loads cities on page load
loadCities();

// Adds event listeners
citySubmitEl.addEventListener("click", citySearchInput);
clearHistoryEl.addEventListener("click", clearHistory);

