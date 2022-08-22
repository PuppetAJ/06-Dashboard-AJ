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

// change api keys later
// one call api documentation https://openweathermap.org/api/one-call-api

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
    for (n=1; n<6; n++) {

        var unixTime = dailyStats[n].dt;
        var formattedTime = moment.unix(unixTime).format('L');
        console.log(formattedTime);

        var imgEl = document.createElement("img");
        var forecastCardEl = document.createElement("div");
        var divEl = document.createElement("div");
        var h2El = document.createElement("h2");

        forecastCardEl.classList.add("forecastCard");
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
}

var citySearchInput = function(event) {

    event.preventDefault();
    var csText = cityInputEl.value.trim();
    if (csText === null || csText === "") {
        alert("Invalid city");
    } else {
        console.log(csText);
    }

};

citySubmitEl.addEventListener("click", citySearchInput);

/* 
    To DO:
    - Use input from form button to call a fetch function
    - change API keys
    - style the page better
    - add recent searches to local storage
    - add clear button to said local storage stuff
*/ 
