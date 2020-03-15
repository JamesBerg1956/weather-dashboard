// START document ready function - runs javascript after document render
$(document).ready(function() {

  // START #search-button click event listener - sends current input to weather API via searchWeather function
  $("#search-button").on("click", function() {

    // get text of #search-value input
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");

    //call searchWeather function with text of #search-value input
    searchWeather(searchValue);

  });
  // END #search-button click event listener

  // START .history click event listener
  $(".history").on("click", "li", function() {

    //call searchWeather function with text of current .history list item
    searchWeather($(this).text());

  });
  // END .history click event listener

  // START makeRow function - called by searchWeather function to add list items to .history ul
  function makeRow(text) {

    //create new list item, add bootstrap class, and assign city name to text
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);

    //append list item to .history ul
    $(".history").append(li);

  }
  // END makeRow function - called by searchWeather function to add list items to .history ul

  // START searchWeather function - calls weather API and appends elements to #today div
  function searchWeather(searchValue) {
    // START searchWeather api via ajax
    $.ajax({
      //use GET to return api data
      type: "GET",
      //queryString url
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      //data return will be in json format
      dataType: "json",
      // START anonymous callback function run on GET success
      success: function(data) {

        // START IF the current city name does not already exist in the history array 
        if (history.indexOf(searchValue) === -1) {
          
          // create history link for this search
          history.push(searchValue);

          // stringify an array called history in local storage
          window.localStorage.setItem("history", JSON.stringify(history));
    
          // call makeRow function to add current city name to #history ul as list items
          makeRow(searchValue);

        }
        // END IF the current city name does not already exist in the history array
        
        // clear any old content from #today div
        $("#today").empty();

        // create h3 tag with .card-title bootstrap class, and text as name of city from API response, plus and current date
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        // create div with .card bootstrap class
        var card = $("<div>").addClass("card");
        // create p tag with .card-text bootstrap class and text as wind speed from API response
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        // create p tag with .card-text bootstrap class and text as humidity from API response
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        // create p tag with .card-text bootstrap class and text as temperature from API response
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        // create div ta with .card-body as bootstrap class
        var cardBody = $("<div>").addClass("card-body");
        // create img tag with src as icon from API response
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // add weather icon to city name h3
        title.append(img);
        
        // add content to cardBody
        cardBody.append(title, temp, humid, wind);
        // add cardBody to card
        card.append(cardBody);
        //add card to forecast div
        $("#today").append(card);

        // call getForecast function - appends 5-day forecast elements to #forecast div
        getForecast(searchValue);
        // TODO: describe this
        getUVIndex(data.coord.lat, data.coord.lon);
      }
      // END anonymous callback function run on GET success
    });
    // END searchWeather api via ajax
  }
  // END searchWeather function - calls weather API and appends elements to #today div

  // START getForecast functionc- calls weather API and appends elements to #forecast div
  function getForecast(searchValue) {
    
    // START ajax call to weather API
    $.ajax({
      
      // API request gets information
      type: "GET",
      // queryString URL for API request
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      // API request returned in json format
      dataType: "json",

      //START anonymous callback function on succesfull API call
      success: function(data) {

        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {

          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

            // create div element as a bootstrap column using 2 grid cols
            var col = $("<div>").addClass("col-md-2");
            // create div element as a bootstrap card component 
            var card = $("<div>").addClass("card bg-primary text-white");
            // create div element as a bootstrap card body for the card component
            var body = $("<div>").addClass("card-body p-2");

            // create a h5 element as a bootstrap card title for the card component with the current date as text
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            // create an img element with a weather icon from the API response
            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            // create a p element as a bootstrap card text for the card component with temperature from the API response
            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            // create a p element as a bootstrap card text for the card component with humidity from the API response
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // append elements to bootstrap card and append card to bootstrap column
            col.append(card.append(body.append(title, img, p1, p2)));

            // append botstrap column to a bootstrap row in #forecast div 
            $("#forecast .row").append(col);
          }
        }
      }
      //END anonymous callback function on succesfull API call
    });
    // END ajax call to weather API
  }
  // END getForecast function - calls weather API and appends elements to #forecast div

  //START getUVIndex function - calls weather API and appends uv index info to #today div
  function getUVIndex(lat, lon) {

    // START getUVIndex ajax call
    $.ajax({

      // API request gets information
      type: "GET",
      // queryString URL for API request
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=600327cb1a9160fea2ab005509d1dc6d&lat=" + lat + "&lon=" + lon,
      // API request returned in json format
      dataType: "json",

      //START anonymous callback function on succesfull API call
      success: function(data) {

        // create p element with text
        var uv = $("<p>").text("UV Index: ");
        // create span element as bootstrap button with response as text
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // if uvIndex response is less than 3, color span green
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        // else if uvIndex response is less than 7, color span orange
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        // else color span red
        else {
          btn.addClass("btn-danger");
        }
        
        // append colored span to p element and append p to #today div
        $("#today .card-body").append(uv.append(btn));
      }
      //END anonymous callback function on succesfull API call
    });
    // END getUVIndex ajax call
  }
  //END getUVIndex function - calls weather API and appends uv index info to #today div

  // create history array out parsed local storage variable
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  // START IF history did not exist in local storage
  if (history.length > 0) {
    // call searchWeather function with null parameter, which will create the history array and add it to local storage
    searchWeather(history[history.length-1]);
  }
  // END IF history did not exist in local storage

  // loop through history array
  for (var i = 0; i < history.length; i++) {
    // re-create city name list items
    makeRow(history[i]);
  }

});
// END document ready function - runs javascript after document render
