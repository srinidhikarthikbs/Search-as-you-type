var irhw5 = angular.module('irhw5', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);
irhw5.controller('spellauto', ['$scope', '$window', '$document', '$http', function(scope, window, document, http){
    scope.stopwords = ["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone",   "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "inteValuest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];
    scope.index_method = "Lucene";
    scope.q = "";
    scope.corrected_query = "";
    scope.display_corrected_query = false;
    scope.filtered_suggestions = [];

    scope.file_csv = [];

    //fetch the csv file here and store
    http({
        method: 'GET',
        url: '/getcsv'
    }).then(function successCallback(response) {
            //console.log(response.data);
            scope.processCSV(response.data);
            window.file_csv = scope.file_csv;
        }, function errorCallback(response) {
            console.log(response)
        });

    scope.equalQueries = function () {
        // if(scope.corrected_query.split("/\s/").length!=scope.q.trim().split("/\s/").length)
        //     return false;
        // for(var i=0;i<scope.corrected_query.split("[ ]+").length;i++)
        //     if(scope.corrected_query.split("[/\s/")[i]!=scope.q.trim().split("/\s/")[i])
        //         return false;
        // return true;
        if(scope.corrected_query===scope.q)
            return true;
        return false;
    }
    
    scope.handleSubmit = function () {
        console.log('handleSubmit')
        http({
            method: 'POST',
            url: '/getcorrectedsentence',
            params: {
                sentence: scope.q==undefined ? "*:*" : scope.q
            }
        }).then(function successCallback(response) {
            scope.corrected_query = response.data;
            //decide if search instead for option
            console.log(response.data);

            if(scope.equalQueries()){
                console.log("they are equal queries")
                scope.display_corrected_query = false;
            }
            else {
                console.log("they are unequal queries")
                scope.display_corrected_query = true;
                if(scope.corrected_query==="*:*")
                    scope.display_corrected_query = false;
            }
            scope.makeQuery(scope.corrected_query);
        }, function errorCallback(response) {
            console.log(response)
        });
    };

    scope.makeQuery = function (query) {
        http({
            method: 'GET',
            url: scope.index_method==="PageRank" ? encodeURI('http://localhost:8983/solr/nbcnews/select?indent=on&q='+query+'&wt=json&sort=pageRankFile desc') : encodeURI('http://localhost:8983/solr/nbcnews/select?indent=on&q='+query+'&wt=json')
        }).then(function successCallback(response) {
            console.log(response)
            console.log(response.data.response.docs.length)
            scope.docs = response.data.response.docs;
            window.docs = scope.docs;
            scope.data = response.data;
        }, function errorCallback(response) {
            console.log(response)
        });
    }

    scope.processCSV = function(allText) {
        // split content based on new line
        var allTextLines = allText.toString().split(/\r\n|\n/);
        console.log(allTextLines.length)

        for (var i = 0; i < allTextLines.length; i++) {
            // split content based on comma
            var data = allTextLines[i].split(',');
            scope.file_csv[data[0]] = data[1];
        }
        console.log('csv processing done');
    };

    scope.getFileName = function (file_id) {
        return scope.file_csv[file_id];
    }

    scope.getSuggestions = function (val) {
        console.log("val = "+val);
        scope.q = val;
        var autocorrect_word = scope.q;
        var prepend = val.trim().split(/[ ]+/);
        if(prepend.length>1){
            autocorrect_word = prepend[prepend.length-1];
        }
        console.log("autocorrect_word = "+autocorrect_word);
        return http({
            method: 'GET',
            url: "http://localhost:8983/solr/nbcnews/suggest?indent=on&q="+autocorrect_word+"&wt=json"
        }).then(function successCallback(response) {
            console.log("call success")
            console.log(response.data["suggest"]["suggest"][autocorrect_word]["suggestions"]);
            scope.suggestions = response.data["suggest"]["suggest"][autocorrect_word]["suggestions"];
            var filtered_suggestions_with_undefined = scope.filterSuggestions(scope.suggestions);
            var filtered_suggestions = [];
            var multi_word = false;
            if(prepend.length>1){
                prepend.pop();
                multi_word = true;
            }
            console.log("came here");
            prepend = prepend.join(" ");
            console.log("prepend = "+prepend);
            filtered_suggestions_with_undefined.forEach(function (filtered_suggestion) {
                if(filtered_suggestion!=undefined)
                    filtered_suggestions.push(multi_word===true ? prepend+" "+filtered_suggestion : filtered_suggestion);
            })
            console.log(filtered_suggestions)
            scope.filtered_suggestions = filtered_suggestions;
            return filtered_suggestions;
        }, function errorCallback(response) {
            console.log("call failed")
            console.log(response)
        });
    }

    scope.filterSuggestions = function (suggestions) {
        return suggestions.map(function (word) {
            if(!(word.term.indexOf(".")>=0 || word.term.indexOf("_")>=0 || word.term.indexOf(":")>=0 || word.term===scope.q || scope.hasStopWord(word.term))){
                return word.term;
            }
        })
    }

    scope.hasStopWord = function (word) {
        for(var i=0;i<scope.stopwords.length;i++){
            if(word===scope.stopwords[i])
                return true;
        }
        return false;
    }

    scope.getSnippet = function (url) {
        //fetch url into text variable
        return http({
            method: 'GET',
            url: '/getsnippet?url='+url
        }).then(function successCallback(response) {
            var text = response.data;

            var sentences = text.split("/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/");

            var pattern_array = [];
            var query_list = scope.corrected_query.split(/\s/);
            for(var i=0, len = query_list.length; i<len; i++)
                pattern_array.push(".*?(.*? "+query_list[i]+"[\.?| .*?]).*?");
            var max_count = 0;
            var snippet = "", snippet2 = "";
            for(var i=0;i<sentences.length;i++){
                var count = 0;
                for(var j=0;j<pattern_array.length;j++){
                    if(sentences[i].match(pattern_array[j]))
                        count++;
                }
                if(count>max_count){
                    max_count = count;
                    snippet2 = snippet;
                    snippet = sentences[i];
                }
            }
            return "... "+snippet+" ... "+snippet2+" ...";
        }, function errorCallback(response) {
            console.log(response)
        });

        //console.log(url)
        // htmlToText.fromFile(path.join(__dirname, 'tikaoutput/'+url+".txt"), {
        //     tables: ['#invoice', '.address']
        // }, (err, text) => {
        //     if (err) return console.error(err);
        //     console.log(text);
        // });
        //return "text";
    }

}]);