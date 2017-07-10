var fs = require('fs');
var path = require('path');
var spell = require('spell');
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');
var htmlToText = require('html-to-text');
// instantiate a new dictionary
var dict = spell();
// load text into dictionary so we can train the dictionary to know
// which words exists and which ones are more frequent than others

var dic_loaded = false;//make false for spellcheck to work


app.get('/', (req, res) => {
	// if(!dic_loaded){
	// 	fs.readFile('big.txt', 'utf8', function (err,data) {
	// 		dict.load(data);
	// 		dic_loaded = true;
	// 		console.log('dictionary loaded');

	// 		console.log(dict.suggest('politicx'));
	// 		res.render('index.ejs');
	// 	});
	// }
	// else{
	// 	res.render('index.ejs');
	// }
	res.render('index.ejs');
});

app.get('/getcsv', (req, res) => {
	fs.readFile('mapNBCNewsDataFile.csv', 'utf8', function (err,data) {
		if(err){
			console.log('error reading csv file');
			res.send("error,error");
		}
		else {
			//console.log(data);
			res.send(data);
		}
	});
});

app.get('/getcorrected/:word', (req, res) => {
	res.send(JSON.stringify(dict.suggest(word)));
});

app.get('/getsnippet', (req, res) => {
	console.log(req.query.url)
	// request(req.query.url, function (error, response, body) {
	// 	if(response.statusCode!=200) res.send("Error fetching content");
	// 	var text = htmlToText.fromString(body, {
	// 		wordwrap: false
	// 	});
	// 	res.send(text);
	// });

	htmlToText.fromFile(path.join(__dirname, 'tikaoutput/'+req.query.url+".txt"), {
		tables: true
	}, (err, text) => {
		if (err) return console.error(err);
		//console.log(text);
		res.send(text);
	});
});

app.post('/getcorrectedsentence', (req, res) => {
	//res.send(JSON.stringify(dict.suggest(word)));
	var sentence = req.query.sentence.trim().split(/[ ]+/);
	console.log(sentence);
	if(sentence[0]==="*:*"){
		res.send("*:*");
	}
	else {
		var corrected_words = [];
		for(var i=0;i<sentence.length;i++){
			var dict_suggest = dict.suggest(sentence[i]);
			console.log(dict_suggest);
			if(dict_suggest.length>0)
				corrected_words.push(dict_suggest);
			else 
				corrected_words.push([{ word: sentence[i], score: 1 }]);
		}
		var corrected_sentence = "";
		for(var i=0;i<corrected_words.length;i++){
			corrected_sentence+=corrected_words[i][0].word+" ";
		}
		console.log(corrected_sentence)
		res.send(corrected_sentence.trim());
	}
});

//CORS middleware
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	next();
}

// set up our express application
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
	extended: true
}));

app.set('views', __dirname + '/views');
app.use(express.static(__dirname));
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(cors());
// Start the server
const PORT = process.env.PORT || 8090;

fs.readFile('big.txt', 'utf8', function (err,data) {
	dict.load(data);
	dic_loaded = true;
	console.log('dictionary loaded');

	console.log(dict.suggest('politicx'));
	app.listen(PORT, () => {
		console.log(`App listening on port ${PORT}`);
		console.log('Press Ctrl+C to quit.');
	});
});
// [END app]
