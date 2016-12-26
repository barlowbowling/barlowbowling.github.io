$(function() {
  // sort people by last name
  var lname_sort = function(array) {
    return array.sort(function(a, b) {
      var a_lname = a.name.split(" ").pop();
      var b_lname = b.name.split(" ").pop();
      if(a_lname.localeCompare(b_lname) == 0) {
        return a.name.localeCompare(b.name);
      } else {
        return a_lname.localeCompare(b_lname)
      }
    });
  };
  // get scores from JSON
  $.getJSON("scores.json", function(scores) {
    // create name_tabs
    scores = lname_sort(scores);
    for(var person in scores) {
      var name_tag = $("<div>")
        .text(scores[person].name)
        .addClass("name_tab")
        .attr("id","name_tab_"+person);
      $("#name_tabs").append(name_tag);
    }
    // handler if clicked on person's name_tab 
    $(".name_tab").click(function() {
      var person = scores[$(this).attr("id").split("_").pop()];
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
            scores_row.append($("<td>").text(game));
          } else {
            scores_row.append($("<td>").html("&nbsp;"));
          }
        }
        scores_row.append($("<th>").text(Math.round(match_total/games.length)));
        scores_elem.append(scores_row);
      }
      var data_elem = $("<div>").html(
        "Grade: " + person.grade
        + "<br>Varsity: " + (person.varsity?"true":"false")
        + "<br>Number of games: " + game_count
      );
      $("#scores").empty()
        .append(name_elem)
        .append(data_elem)
        .append(scores_elem);
    });
    $("#name_tab_0").click();
  })
});
