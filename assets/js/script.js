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

// Change api keys later, currently using Jack's
// One call api documentation https://openweathermap.org/api/one-call-api

var citySearch = function(cityName) {

    fetch('https://api.openweathermap.org/data/2.5/weather?q='+ cityName + '&appid=8a42d43f7d7dc180da5b1e51890e67dc')
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            currentCityName = data.name;
            cityInputEl.value = ""
            return fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly&units=imperial&appid=8a42d43f7d7dc180da5b1e51890e67dc`)
        })
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            applyCityStats(data.current);
            forecastContainerEl.remove();
            var newFCEl = document.createElement("div");
            newFCEl.classList.add("d-flex");
            newFCEl.setAttribute("id", "forecastContainer");
            dataContainerEl.appendChild(newFCEl);
            forecastConstructor(data.daily);

            if (cities.length === 0) {

                var cityObject = {
                    name: currentCityName
                }
    
                cities.unshift(cityObject);

                saveCities();
                buttonContainerConstructor();
                buttonHistoryConstructor();

            } else if (cities.length < 8) {

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

        })
        .catch(function () {
            alert("Couldn't process request!");
            currentCityName = "";
            cityInputEl.value = "";

        });

};

var buttonContainerConstructor = function() {
    buttonContainerEl.remove()
    var newBCEl = document.createElement("div");
    newBCEl.setAttribute("id", "buttonContainer");
    formContainerEl.appendChild(newBCEl);
};

var citySearchInput = function(event) {

    event.preventDefault();
    var csText = cityInputEl.value.trim();
    if (csText === null || csText === "") {
        alert("Input must not be empty!");
    } else {
        citySearch(csText);
    }

};

var applyCityStats = function(currentStats) {

    cityTime = moment.unix(currentStats.dt).format('L');
    cityIconEl.setAttribute("src", "http://openweathermap.org/img/wn/"+currentStats.weather[0].icon+".png");
    cityNameEl.textContent = currentCityName + " (" + cityTime + ")";
    cityTempEl.textContent = "Temp: " + currentStats.temp + " °F";
    cityWindEl.textContent = "Wind: " + currentStats.wind_speed + " MPH";
    cityHumidityEl.textContent = "Humidity: " + currentStats.humidity + "%";
    cityUVIEl.textContent = currentStats.uvi;

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

var forecastConstructor = function(dailyStats) {

    forecastContainerEl = document.querySelector("#forecastContainer");

    for (n=1; n<6; n++) {

        var unixTime = dailyStats[n].dt;
        var formattedTime = moment.unix(unixTime).format('L');

        var imgEl = document.createElement("img");
        var forecastCardEl = document.createElement("div");
        var divEl = document.createElement("div");
        var h2El = document.createElement("h2");

        forecastCardEl.classList.add("forecastCard");
        forecastCardEl.classList.add("col");
        divEl.classList.add("p-3");
        h2El.setAttribute("id", "day-" + n);
        imgEl.setAttribute("src", "http://openweathermap.org/img/wn/"+dailyStats[n].weather[0].icon+".png")

        h2El.textContent = formattedTime;

        divEl.appendChild(h2El);
        divEl.appendChild(imgEl);

        for (i=0; i<3; i++) {
            var pEl = document.createElement("p");
            pEl.setAttribute("id", "day-" + n + "-" + i);

            if (i===0) {
                pEl.textContent = "Temp: " + dailyStats[n].temp.day + "°F";
            } else if (i===1) {
                pEl.textContent = "Wind: " + dailyStats[n].wind_speed + " MPH";
            } else {
                pEl.textContent = "Humidity: " + dailyStats[n].humidity + " %";
            }

            divEl.appendChild(pEl);
        }

        forecastCardEl.appendChild(divEl);
        forecastContainerEl.appendChild(forecastCardEl);

    }
};

var saveCities = function() {
    localStorage.setItem("citiesT2b3XQw67Q6n", JSON.stringify(cities));
};

var loadCities = function() {

    var loadedCities = JSON.parse(localStorage.getItem("citiesT2b3XQw67Q6n"));

    if (!loadedCities) {
        return false;
    } else {
        cities = loadedCities;
        buttonHistoryConstructor();
        console.log(cities);
    }
};

var buttonHistoryEvent = function(event) {

    var target = event.target;
    var targetText = target.textContent
    citySearch(targetText);

}

var buttonHistoryConstructor = function() {

    buttonContainerEl = document.querySelector("#buttonContainer");

    if (cities.length > 0 && cities.length < 8) {
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
    } else if (cities.length >= 8) {
        for (i=0; i < 8; i++) {
            var buttonEl = document.createElement("button");
            buttonEl.classList.add("btn");
            buttonEl.classList.add("btnFormat");
            buttonEl.classList.add("btn-secondary");
            buttonEl.classList.add("text-dark");
            buttonEl.textContent = cities[i].name;
            buttonEl.addEventListener("click", buttonHistoryEvent);

            buttonContainerEl.appendChild(buttonEl);
        }
    } else {
        return;
    }

}

var clearHistory = function() {
    cities = [];
    saveCities();
    loadCities();
    buttonContainerConstructor();
}


loadCities();
citySubmitEl.addEventListener("click", citySearchInput);
clearHistoryEl.addEventListener("click", clearHistory);


/* 
    To DO:
    - change API keys
    - style the page better
    - make page responsive
    - https://stackoverflow.com/questions/31944691/bootstrap-5-column-layout
*/ 
