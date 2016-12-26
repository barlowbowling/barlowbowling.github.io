$(function() {
  $.getJSON("scores.json?p=json", function(scores) {
    for(var [name, person] of Object.entries(scores)) {
      var grade = person.grade;
      console.log(name, grade);
      for(var [date, games] of Object.entries(person.scores)) {
        console.log(date, games.join(" "));
      }
    }
  });
});
