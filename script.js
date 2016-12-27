$(function() {
  // fix positioning of #name_tabs
  $(window).resize(function() {
    $("#name_tabs").css("top", ($(window).height()-$("#name_tabs").height())/2);
  });
  // get scores from JSON
  $.getJSON("scores.json", function(scores) {
    // create team name_tab
    var team_name_tab = $("<div>")
      .html("<i class='fa fa-users'></i> Team")
      .addClass("name_tab")
      .attr("id","name_tab_-1");
    $("#name_tabs").append(team_name_tab);
    // create name_tabs
    scores = scores.sort(function(a, b) {
      var a_lname = a.name.split(" ").pop();
      var b_lname = b.name.split(" ").pop();
      if(a_lname.localeCompare(b_lname) == 0) {
        return a.name.localeCompare(b.name);
      } else {
        return a_lname.localeCompare(b_lname);
      }
    });
    var average_map = {};
    var average_of_nine_map = {};
    for(var person in scores) {
      var name_tag = $("<div>")
        .html("<i class='fa fa-user'></i> " + scores[person].name)
        .addClass("name_tab")
        .attr("id","name_tab_"+person);
      $("#name_tabs").append(name_tag);
      var overall_scores = 0;
      var overall_matches = 0;
      for(date in scores[person].scores) {
        for(game in scores[person].scores[date]) {
          overall_scores += scores[person].scores[date][game];
          overall_matches++;
        }
      }
      average_map[scores[person].name] = overall_scores/overall_matches;
      var last_nine_total = 0;
      var last_nine_games = 0;
      var reverse_scores = Object.keys(scores[person].scores).reverse();
      for(var date in reverse_scores) {
        for(var game in scores[person].scores[reverse_scores[date]]) {
          if(last_nine_games < 9) {
            last_nine_total += scores[person].scores[reverse_scores[date]][game];
            last_nine_games++;
          }
        }
      }
      var last_nine_average = Math.round(last_nine_total/last_nine_games);
      average_of_nine_map[scores[person].name] = last_nine_average;
    }
    $(window).resize();
    var show_averages = function(sort_function) {
      var sorted_scores;
      switch(sort_function) {
        case "grade":
          sorted_scores = scores.slice().sort(function(a, b) {
            return a.grade - b.grade;
          });
          break;
        case "varsity":
          sorted_scores = scores.slice().sort(function(a, b) {
            if(a.varsity && b.varsity || !a.varsity && !b.varsity)
              return 0;
            if(a.varsity && !b.varsity)
              return -1;
            if(!a.varsity && b.varsity)
              return 1;
          });
          break;
        case "average":
          sorted_scores = scores.slice().sort(function(a, b) {
            return average_map[b.name] - average_map[a.name];
          });
          break;
        case "average_nine":
          sorted_scores = scores.slice().sort(function(a, b) {
            return average_of_nine_map[b.name] - average_of_nine_map[a.name];
          });
          break;
        case "alpha":
        default: // these labels are redundant
          sorted_scores = scores.slice().sort(function(a, b) {
            var a_lname = a.name.split(" ").pop();
            var b_lname = b.name.split(" ").pop();
            if(a_lname.localeCompare(b_lname) == 0) {
              return a.name.localeCompare(b.name);
            } else {
              return a_lname.localeCompare(b_lname);
            }
          });
      }
      var table_elem = $("<table>")
        .attr("id", "averages_table")
        .append($("<tr>")
          .append($("<th>").text("Bowler"))
          .append($("<th>").text("Average"))
        );
      for(var person in sorted_scores) {
        var person_row = $("<tr>")
          .append($("<td>").text(sorted_scores[person].name
            + (sort_function=="grade"?" ("+sorted_scores[person].grade+")":"")
            + (sort_function=="varsity"&&sorted_scores[person].varsity?" (Varsity)":"")
          ))
          .append($("<td>").text(Math.round(average_map[scores[person].name])));
        table_elem.append(person_row);
      }
      $("#main").html(table_elem);
    };
    var show_team_details = function() {
      var name_elem = $("<h1>")
        .text("Team")
        .attr("id", "name");
      var options_elem = $("<select>")
        .append($("<option>").html("Sort by average of last nine games").val("average_nine"))
        .append($("<option>").text("Sort by name").val("alpha"))
        .append($("<option>").text("Sort by average").val("average"))
        .append($("<option>").text("Sort by varsity").val("varsity"))
        .append($("<option>").text("Sort by grade").val("grade"));
      var sort_icon = $("<i>")
        .addClass("fa fa-sort");
      var main_elem = $("<div>").attr("id", "main"); 
      $("#scores").empty()
        .append(name_elem)
        .append(options_elem)
        .append(sort_icon)
        .append(main_elem);
      show_averages("average_nine");
      options_elem.change(function() {
        show_averages($(this).val());
      });
    };
    // handler if clicked on person's name_tab 
    $(".name_tab").click(function() {
      var id = $(this).attr("id").split("_").pop();
      // if team name_tab is clicked, show its details; otherwise continue
      $(".name_tab").removeClass("selected");
      $(this).addClass("selected");
      if(id == -1) {
        show_team_details();
        return;
      }
      var old_scrolltop = $(window).scrollTop();
      var person = scores[id];
      var name_elem = $("<h1>")
        .text(person.name)
        .attr("id", "name");
      var scores_elem = $("<table>")
        .addClass("scores_table")
        .append($("<tr>")
          .append($("<th>").text("Date"))
          .append($("<th>").text("Game 1"))
          .append($("<th>").text("Game 2"))
          .append($("<th>").text("Game 3"))
          .append($("<th>").text("Average"))
        );
      var game_count = 0;
      var high_game = 0;
      var match_averages = [];
      for(var date in person.scores) {
        var games = person.scores[date];
        game_count += games.length;
        var scores_row = $("<tr>")
          .append($("<th>").text(date));
        var match_total = 0;
        for(var i = 0; i < 3; i++) {
          if(games.length > i) {
            game = games[i];
            match_total += game;
            if(game > high_game)
              high_game = game;
            scores_row.append($("<td>").text(game));
          } else {
            scores_row.append($("<td>").html("&nbsp;"));
          }
        }
        var match_average = Math.round(match_total/games.length);
        match_averages.push(match_average);
        scores_row.append($("<th>").text(match_average));
        scores_elem.append(scores_row);
      }
      var last_match_total = 0;
      var last_match_games = 0;
      var last_nine_total = 0;
      var last_nine_games = 0;
      var reverse_scores = Object.keys(person.scores).reverse();
      for(var date in reverse_scores) {
        for(var game in person.scores[reverse_scores[date]]) {
          if(date == 0) {
            last_match_total += person.scores[reverse_scores[date]][game];
            last_match_games++;
          }
          if(last_nine_games < 9) {
            last_nine_total += person.scores[reverse_scores[date]][game];
            last_nine_games++;
          }
        }
      }
      var last_match_average = Math.round(last_match_total/last_match_games);
      var last_nine_average = average_of_nine_map[person.name];
      var x_total = 0;
      var y_total = 0;
      for(var value in match_averages) {
        x_total += parseInt(value);
        y_total += match_averages[value];
      }
      var x_mean = x_total/match_averages.length;
      var y_mean = y_total/match_averages.length;
      var numerator = 0;
      var denominator = 0;
      for(var value in match_averages) {
        numerator += (parseInt(value) - x_mean) * (match_averages[value] - y_mean);
        denominator += Math.pow((parseInt(value) - x_mean), 2);
      }
      var m_slope = numerator/denominator;
      var b_intercept = y_mean - (m_slope * x_mean);
      var best_fit_data = [];
      for(var datapoint in Object.keys(person.scores)) {
        best_fit_data.push(b_intercept + m_slope * datapoint);
      }
      var data_elem = $("<div>").html(
        "Grade: " + person.grade
        + "<br>Varsity: " + (person.varsity?"true":"false")
        + "<br>Number of games: " + game_count
        + "<br>High game: " + high_game
        + "<br>Last match average: " + last_match_average
        + "<br>Last nine game average: " + last_nine_average
        + "<br>Overall average: " + Math.round(average_map[person.name])
        + "<br>Average improvement per week: " + (Math.round(m_slope) || 0)
        + "<br>Predicted next week average: " + (Math.round(b_intercept + m_slope* match_averages.length) || match_averages[match_averages.length-1])
      );
      var chart_elem = $("<canvas>")
        .attr("height", "250");
      $("#scores").empty()
        .append(name_elem)
        .append(data_elem)
        .append(scores_elem)
        .append(chart_elem);
      var default_dataset = {
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        pointHoverRadius: 5,
        pointBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointRadius: 1,
        pointHitRadius: 10,
        spanGaps: true
      };
      var average_dataset = jQuery.extend({
        label: "Match averages",
        data: match_averages,
        pointBorderWidth: 10,
        pointHoverBorderWidth: 10,
        borderWidth: 10,
        borderColor: "rgba(75,192,192,1)",
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointBorderColor: "rgba(75,192,192,1)"
      }, default_dataset);
      var best_fit_dataset = jQuery.extend({
        label: "Best fit line",
        data: best_fit_data,
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        borderColor: "rgba(192, 57, 43,1.0)",
        pointHoverBackgroundColor: "rgba(192, 57, 43,1.0)",
        pointBorderColor: "rgba(192, 57, 43,1.0)"
      }, default_dataset);
      var game1s_data = [];
      for(var match in person.scores) {
        game1s_data.push(person.scores[match][0]);
      }
      var game1s_dataset = jQuery.extend({
        label: "Game 1",
        data: game1s_data,
        pointBorderWidth: 5,
        borderColor: "transparent",
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: "rgba(142,68,173,1)",
        pointBorderColor: "rgba(142,68,173,1)"
      }, default_dataset);
      var game2s_data = [];
      for(var match in person.scores) {
        game2s_data.push(person.scores[match][1]);
      }
      var game2s_dataset = jQuery.extend({
        label: "Game 2",
        data: game2s_data,
        pointBorderWidth: 5,
        borderColor: "transparent",
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: "rgba(211,84,0,1)",
        pointBorderColor: "rgba(211,84,0,1)"
      }, default_dataset);
      var game3s_data = [];
      for(var match in person.scores) {
        game3s_data.push(person.scores[match][2]);
      }
      var game3s_dataset = jQuery.extend({
        label: "Game 3",
        data: game3s_data,
        pointBorderWidth: 5,
        borderColor: "transparent",
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: "rgba(39,174,96,1)",
        pointBorderColor: "rgba(39,174,96,1)"
      }, default_dataset);
      var line_chart = new Chart(chart_elem, {
        type: "line",
        data: {
          labels: Object.keys(person.scores),
          datasets: [
            average_dataset,
            best_fit_dataset,
            game1s_dataset,
            game2s_dataset,
            game3s_dataset
          ]
        },
        options: {
          animation: false,
          scales: {
            yAxes: [
              {
                display: true,
                ticks: {
                  min: 0,
                  max: 300,
                  stepsize: 20
                }
              }
            ]
          }
        }
      });
      $(window).scrollTop(old_scrolltop);
    });
    $(".name_tab").first().click();
  })
});
