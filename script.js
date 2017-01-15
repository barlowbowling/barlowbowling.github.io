$(function() {
  // fix positioning of #name_tabs
  $(window).resize(function() {
    $("#name_tabs").css("top", ($(window).height()-$("#name_tabs").height())/2);
  });
  // get scores from JSON
  $.getJSON("scores.json", function(scores) {
    // create team info_tab
    var team_name_tab = $("<div>")
      .html("<i class='fa fa-question-circle-o fa-fw'></i> Info")
      .addClass("name_tab")
      .attr("id","name_tab_-2");
    $("#name_tabs").append(team_name_tab);
    // create team name_tab
    var team_name_tab = $("<div>")
      .html("<i class='fa fa-stack fa-fw'><i class='fa fa-fw fa-circle-thin fa-stack-1x'></i><i class='fa fa-users fa-fw fa-stack-1x'></i></i> Team")
      .addClass("name_tab")
      .attr("id","name_tab_-1");
    $("#name_tabs").append(team_name_tab);
    // create name_tabs
    scores.sort(function(a, b) {
      var a_lname = a.name.split(" ").pop();
      var b_lname = b.name.split(" ").pop();
      if(a_lname.localeCompare(b_lname) == 0) {
        return a.name.localeCompare(b.name);
      } else {
        return a_lname.localeCompare(b_lname);
      }
    });
    var average_map = {};
    var weighted_average_map = {};
    var average_of_matches_map = {};
    var dates = [];
    for(var person in scores) {
      for(var match in scores[person].scores) {
        if(dates.indexOf(match) == -1) {
          dates.push(match);
        }
      }
    }
    dates.sort(function(a, b) {
      return Date.parse(a) - Date.parse(b);
    });
    for(var person in scores) {
      var name_tag = $("<div>")
        .html("<i class='fa fa-user-circle-o fa-fw'></i> " + scores[person].name)
        .addClass("name_tab")
        .attr("id","name_tab_"+person);
      $("#name_tabs").append(name_tag);
      var overall_scores = 0;
      var overall_matches = 0;
      average_of_matches_map[scores[person].name] = [];
      var overall_weighted_score = 0;
      var weight = 1;
      var weight_total = 0;
      var weight_scalar = 1.5;
      for(var date in dates) {
        if(scores[person].scores[dates[date]]) {
          var match_scores = 0;
          var match_matches = 0;
          for(var game in scores[person].scores[dates[date]]) {
            overall_scores += scores[person].scores[dates[date]][game];
            overall_matches++;
            match_scores += scores[person].scores[dates[date]][game];
            match_matches++;
            overall_weighted_score += weight * scores[person].scores[dates[date]][game];
            weight_total += weight;
          }
          weight *= weight_scalar;
          average_of_matches_map[scores[person].name].push(Math.round(match_scores/match_matches));
        } else {
          average_of_matches_map[scores[person].name].push(null);
        }
      }
      average_map[scores[person].name] = overall_scores/overall_matches;
            weighted_average_map[scores[person].name] = overall_weighted_score / weight_total;
    }
    $(window).resize();
    // calculating best fit line for overall and overall varsity
    var varsity_team_total = 0;
    var varsity_team_number = 0;
    var varsity_matches_total = 0;
    var team_total = 0;
    var team_number = 0;
    var matches_total = 0;
    for(var player in average_of_matches_map) {
      for(var game in average_of_matches_map[player]) {
        var player_object = scores.find(function(a) {
          return a.name == player;
        });
        if(player_object.varsity) {
          varsity_team_number++;  
          varsity_team_total += average_of_matches_map[player][game];
          varsity_matches_total += parseInt(game);
        }
        team_number++;
        team_total += average_of_matches_map[player][game];
        matches_total += parseInt(game);
      }
    }
    var varsity_team_mean = varsity_team_total/varsity_team_number;
    var varsity_matches_mean = varsity_matches_total/varsity_team_number;
    var team_mean = team_total/team_number;
    var matches_mean = matches_total/team_number;
    var varsity_m_numerator = 0;
    var varsity_m_denominator = 0;
    var m_numerator = 0;
    var m_denominator = 0;
    for(var player in average_of_matches_map) {
      for(var game in average_of_matches_map[player]) {
        var player_object = scores.find(function(a) {
          return a.name == player;
        });
        if(player_object.varsity) {
          varsity_m_numerator += (parseInt(game) - varsity_matches_mean) * (average_of_matches_map[player][game] - varsity_team_mean);
          varsity_m_denominator += Math.pow(parseInt(game) - varsity_matches_mean, 2);
        }
        m_numerator += (parseInt(game) - matches_mean) * (average_of_matches_map[player][game] - team_mean);
        m_denominator += Math.pow(parseInt(game) - matches_mean, 2);
      }
    }
    var varsity_m_slope = varsity_m_numerator/varsity_m_denominator;
    var m_slope = m_numerator/m_denominator;
    var varsity_b_intercept = varsity_team_mean - varsity_m_slope * varsity_matches_mean;
    var b_intercept = team_mean - m_slope * matches_mean;
    var varsity_bestfit_data = [];
    var bestfit_data = [];
    for(var date in dates) {
      varsity_bestfit_data.push(Math.round(varsity_b_intercept + date * varsity_m_slope));
      bestfit_data.push(Math.round(b_intercept + date * m_slope));
    }
    var varsity_number = 0;
    var varsity_total = 0;
    var games_number = 0;
    var games_total = 0;
    for(var person in average_of_matches_map) {
      if(average_of_matches_map[person][dates.length-1]) {
        var person_object = scores.find(function(a) {
          return a.name == person;
        });
        if(person_object.varsity) {
          varsity_number++;
          varsity_total += average_of_matches_map[person][dates.length-1];
        }
        games_number++;
        games_total += average_of_matches_map[person][dates.length-1];
      }
    }
    var varsity_average = varsity_total/varsity_number;
    var team_average = games_total/games_number;
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
        case "weighted":
          sorted_scores = scores.slice().sort(function(a, b) {
            return weighted_average_map[b.name] - weighted_average_map[a.name];
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
          .append($("<th>").text((sort_function=="varsity"||sort_function=="weighted"?"Weighted ":"")+"Average"))
        );
      for(var person in sorted_scores) {
        var person_row = $("<tr>")
          .append($("<td>")
            .append($("<span>").text(sorted_scores[person].name).attr("class", "name_button"))
            .append((sort_function=="grade"?" ("+sorted_scores[person].grade+")":"")
              + (sort_function=="varsity"&&sorted_scores[person].varsity?" (Varsity)":""))
          )
          .append($("<td>").text(
            sort_function == "weighted"
              ? Math.round(weighted_average_map[sorted_scores[person].name])
              : Math.round(average_map[sorted_scores[person].name])
            ));
        table_elem.append(person_row);
      }
      $("#main").html(table_elem);
      if(sort_function == "weighted") {
        $("#main").append($("<p>").attr("id", "empty_disclaimer").html("&dagger; Each week's games are weighted " + weight_scalar + " times as much than the previous week."));
      }
    };
    var show_team_info = function() {
      var info_page_elems = $(`
        <h1>Info</h1>
        <p>Welcome to the Barlow Bowling data site! Read the content below for more information.</p>
        <h3>Varsity</h3>
        <p>Varsity is primarily determiend by weighted average. Weighted average means that the games of each week are weighted ` + weight_scalar + ` times as much as the last week and provides a happy medium between total average (which not beneficial to the rapidly improving bowler) and the last match average (which is not beneficial to for a person with an unlucky last week). This system is especially geared towards taking recent improvement into account, as the most recent games are the most important to a bowler's average. A bowler must also have played over three games to be considered for varsity. Below are the most probably varsity bowlers, discounting injury or other inabilities to play:</p>
        <h3>Resources</h3>
        <ul>
          <li><a href="http://nutmegbowl.com" target="_blank">Nutmeg Bowl website</a></li>
          <li><a href="http://facebook.com/groups/barlowbowling2017" target="_blank">Facebook group</a></li>
          <li><a href="http://nutmegbowl.com/LEAGUES" target="_blank">CIBL league standings</a></li>
        </ul>
      `);
      $("#scores").empty().html(info_page_elems);
    }
    var show_team_details = function() {
      var name_elem = $("<h1>")
        .text("Team")
      var data_elem = $("<div>").html(
        "Last match team average: " + Math.round(team_average)
        + "<br>Last match varsity average: " + Math.round(varsity_average)
        + "<br>Average increase per match: " + Math.round(m_slope)
        + "<br>Varsity average increase per match: " + Math.round(varsity_m_slope)
        + "<br>Predicted next match team average: " + Math.round(b_intercept + m_slope * dates.length)
        + "<br>Predicted next match varsity average: " + Math.round(varsity_b_intercept + varsity_m_slope * dates.length)
      );
      var options_elem = $("<select>")
        .append($("<option>").html("Sort by weighted average").val("weighted"))
        .append($("<option>").text("Sort by name").val("alpha"))
        .append($("<option>").text("Sort by average").val("average"))
        .append($("<option>").text("Sort by varsity").val("varsity"))
        .append($("<option>").text("Sort by grade").val("grade"));
      var sort_icon = $("<i>")
        .addClass("fa fa-sort");
      var main_elem = $("<div>").attr("id", "main"); 
      var canvas_title_elem = $("<h1>").text("Match Averages");
      var canvas_elem = $("<canvas>").attr("height", 250);
      var options_title_elem = $("<h1>").text("Individual Overall Averages");
      $("#scores").empty()
        .append(name_elem)
        .append(data_elem)
        .append(options_title_elem)
        .append(options_elem)
        .append(sort_icon)
        .append(main_elem)
        .append(canvas_title_elem)
        .append(canvas_elem);
      show_averages("weighted");
      options_elem.change(function() {
        show_averages($(this).val());
      });
      var averages_chart_datasets = [];
      var colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#e74c3c", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#f39c12", "#d35400", "#c0392b"];
      var color_pointer = 0;
      for(var person in average_of_matches_map) {
        averages_chart_datasets.push({
          label: person,
          fill: false,
          lineTension: 0.1,
          spanGaps: true,
          pointRadius: 1,
          pointHitRadius: 10,
          pointBorderWidth: 10,
          pointBorderColor: colors[color_pointer],
          borderColor: colors[color_pointer++],
          backgroundColor: "white",
          borderWidth: 2,
          data: average_of_matches_map[person]
        });
      }
      averages_chart_datasets.push({
        label: "Varsity best fit line",
        fill: false,
        lineTension: 0.05,
        spanGaps: true,
        pointRadius: 0,
        pointHitRadius: 10,
        pointBorderWidth: 10,
        pointBorderColor: "transparent",
        borderColor: "darkgrey",
        backgroundColor: "darkgrey",
        borderWidth: 5,
        data: varsity_bestfit_data
      });
      averages_chart_datasets.push({
        label: "Team best fit line",
        fill: false,
        lineTension: 0.05,
        spanGaps: true,
        pointRadius: 1,
        pointHitRadius: 10,
        pointBorderWidth: 10,
        pointBorderColor: "transparent",
        borderColor: "grey",
        backgroundColor: "grey",
        borderWidth: 5,
        data: bestfit_data
      });
      var averages_chart = new Chart(canvas_elem, {
        type: "line",
        data: {
          labels: dates,
          datasets: averages_chart_datasets
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
    };
    // handler if clicked on person's name_button
    $(document).on("click", ".name_button", function() {
      $(".name_tab:contains(" + $(this).text() + ")").click();
    });
    // handler if clicked on person's name_tab 
    $(".name_tab").click(function() {
      var old_scrolltop = $(window).scrollTop();
      var id = $(this).attr("id").split("_").pop();
      // if team name_tab is clicked, show its details; otherwise continue
      $(".name_tab").removeClass("selected");
      $(this).addClass("selected");
      if(id == -1) {
        show_team_details();
        $(window).scrollTop(old_scrolltop);
        return;
      } else if(id == -2) {
        show_team_info();
        $(window).scrollTop(old_scrolltop);
        return;
      }
      var person = scores[id];
      var name_elem = $("<h1>")
        .text(person.name);
      var disclaimer_elem = $("<p>")
        .attr("id","empty_disclaimer")
        .html("&dagger; Empty games indicate absence or inability to play due to player restrictions.");
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
      for(var match_date in dates) {
        var date = dates[match_date];
        if(!person.scores[date]) {
          scores_elem.append($("<tr>")
            .append($("<th>").text(date))
            .append($("<td>").attr("colspan", 4))
          );
          continue;
        }
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
      var weighted_average = weighted_average_map[person.name];
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
        + "<br>Varsity: " + (person.varsity?"yes":"no")
        + "<br>Number of games: " + game_count
        + "<br>High game: " + high_game
        + "<br>Last match average: " + last_match_average
        + "<br>Weighted average: " + Math.round(weighted_average_map[person.name])
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
        .append(disclaimer_elem)
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
    $(".name_tab").get(1).click();
  })
});
