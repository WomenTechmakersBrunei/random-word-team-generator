var s = SpreadsheetApp.getActiveSpreadsheet()
var shPlayers = s.getSheetByName("Players") 
var shGameboard = s.getSheetByName("Gameboard")
var oddWarning = shGameboard.getRange("G5").getValue()

function randomWordGenerator(apiKey, numberOfWords) {
  var url="https://random-word-api.herokuapp.com/word?key=" + apiKey + "&number=" + numberOfWords
  var response=UrlFetchApp.fetch(url);
  var jsonString = response.getContentText()
  Logger.log(jsonString)
  return jsonString
}

function getAPIKey(){

  var url="https://random-word-api.herokuapp.com/key?"
  var response=UrlFetchApp.fetch(url);
  var apiKey = response.getContentText()
  return apiKey
}

function stringToArray(rawString){
  //remove the brackets
  var rx = /\[([A-Za-z,\W"]*)\]/;
  var matched = rawString.match(rx)
  var allWords = matched[1].split(", ")
  for (var i = 0; i < allWords.length; i++ ){
    var rx2 = /"([A-Za-z]*)"/
    allWords[i] = allWords[i].match(rx2)[1]
  }
  return allWords
}

function getRandomWords(){
  var apiKey = getAPIKey()
  if (oddWarning != "") {
    return
  }

  var rawPlayers = shPlayers.getRange(2,1,shPlayers.getLastRow() - 1,2).getValues() //gets the first two columns, name and experience
  //need to output pairs 
  var numOfPlayers = rawPlayers.length //needs to be an even number
  if (numOfPlayers == 0) {
    return
  }
  var allSkills = []
  var peopleToSkills = {}
  for (var i = 0; i < numOfPlayers; i++) {
    allSkills.push(rawPlayers[i][1].split(","))
    peopleToSkills[rawPlayers[i][0]] = rawPlayers[i][1].split(",")
    rawPlayers[i][1] = rawPlayers[i][1].split(",")
  }
  
  var diverseSkills = {}
  var focussedSkills = {}
  

  var diverseSkills = rawPlayers.filter(function (value) {
    return value[1].length > 1
  });
  var focussedSkills = rawPlayers.filter(function (value) {
    return value[1].length <= 1
  })
  
  var pairs = []
  var maxLength = Math.max(diverseSkills.length, focussedSkills.length)
  var minLength = Math.min(diverseSkills.length, focussedSkills.length)
  for (i = 0; i < minLength; i++) {
    //todo gotta try and get it randomly and remove
    var name1 = diverseSkills.splice(randomNumberUnder(diverseSkills.length),1)[0][0]
    var name2 = focussedSkills.splice(randomNumberUnder(focussedSkills.length),1)[0][0]
    pairs.push(name1 + " & " + name2)
  }

  if (maxLength > minLength) {
    var leftover = diverseSkills.concat(focussedSkills)
    while (leftover.length != 0) {
      var name1 = leftover.splice(randomNumberUnder(leftover.length),1)[0][0]
      var name2 = ""
      if (leftover.length != 0) {
        name2 = leftover.splice(randomNumberUnder(leftover.length),1)[0][0]
      }
      pairs.push(name1 + " & " + name2)
      
    }
  }
  //matched focussed with more diverse skills
  var randomWords = stringToArray(randomWordGenerator(apiKey,pairs.length))
  var finalResult = [["PLAYERS", "WORD"]]
  for (var i = 0; i < randomWords.length; i++) {
    finalResult.push([pairs[i],randomWords[i]])
  }
  var x = 3
  var y = 2
  shGameboard.getRange(x,y,finalResult.length,2).setValues(finalResult)
  
}

function randomNumberUnder(x){
  return Math.floor(Math.random() * x)
}


