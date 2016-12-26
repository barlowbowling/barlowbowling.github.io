$(function() {
  // get scores from JSON
  $.getJSON("scores.json", function(scores) {
    // create team name_tab
    var team_name_tab = $("<div>")
      .text("Team")
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
    for(var person in scores) {
      var name_tag = $("<div>")
        .text(scores[person].name)
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
    }
    var show_team_details = function() {
      var options = $("<select>")
        .append($("<option>").text("Sort by name").val("alpha"))
        .append($("<option>").text("Sort by average").val("average"))
        .append($("<option>").text("Sort by varsity").val("varsity"))
        .append($("<option>").text("Sort by grade").val("grade"));
      $("#scores").empty()
        .append(options);
    };
    // handler if clicked on person's name_tab 
    $(".name_tab").click(function() {
      var id = $(this).attr("id").split("_").pop();
      // if team name_tab is clicked, show its details; otherwise continue
      if(id == -1) {
        show_team_details();
        return;
      }
      var person = scores[id];
      var name_elem = $("<h1>").text("Bowler: "+person.name);
      var scores_elem = $("<table>")
        .append($("<tr>")
          .append($("<th>").text("Date"))
          .append($("<th>").text("Game 1"))
          .append($("<th>").text("Game 2"))
          .append($("<th>").text("Game 3"))
          .append($("<th>").text("Average"))
        );
      var game_count = 0;
      var high_game = 0;
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
        scores_row.append($("<th>").text(Math.round(match_total/games.length)));
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
      var last_nine_average = Math.round(last_nine_total/last_nine_games);
      var data_elem = $("<div>").html(
        "Grade: " + person.grade
        + "<br>Varsity: " + (person.varsity?"true":"false")
        + "<br>Number of games: " + game_count
        + "<br>High game: " + high_game
        + "<br>Last match average: " + last_match_average
        + "<br>Last nine game average: " + last_nine_average
        + "<br>Overall average: " + Math.round(average_map[person.name])
      );
      $("#scores").empty()
        .append(name_elem)
        .append(data_elem)
        .append(scores_elem);
    });
    $(".name_tab").first().click();
  })
});
