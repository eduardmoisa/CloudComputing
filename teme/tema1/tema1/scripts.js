const app = document.getElementById('root');
const divtitlu = document.getElementById('releaseyear');

const divt = document.createElement('div');
divt.setAttribute('class', 'divt');

const container = document.createElement('div');
container.setAttribute('class', 'container');

app.appendChild(container);
divtitlu.appendChild(divt);
var searchstring = "";
function setstring(x){
	searchstring = x;
};
function replaceSpace(x){
	return x.replace(/ /g, "+");
}
var request = new XMLHttpRequest();
request.open('GET', 'https://ghibliapi.herokuapp.com/films', false);
request.onload = function () {

  var data = JSON.parse(this.response);

  var rez = data[0].release_date;
      setstring(rez);
      //console.log(rez);
    const p = document.createElement('p');
      p.textContent = "Some movies from " + rez + ".";
    divtitlu.appendChild(p);
      //console.log(titlu);
}
request.send();
var lista_filme = [];
var url2 = 'http://api.themoviedb.org/3/discover/movie?primary_release_year=' + searchstring + '&api_key=5837c99899d50c619cf0a7c97ffd3acc';
var request1 = new XMLHttpRequest();
request1.open('GET', url2, false);
//request.setRequestHeader('Ocp-Apim-Subscription-Key', '5837c99899d50c619cf0a7c97ffd3acc');
request1.onload = function () {

    var data = JSON.parse(this.response);
    console.log(data.results);
    for (nume in data.results){
    	lista_filme.push(data.results[nume].title);
    }
}

request1.send();
for (movie in lista_filme){
var request2 = new XMLHttpRequest();
var url = 'https://api.cognitive.microsoft.com/bing/v7.0/images/search?q=' + replaceSpace(lista_filme[movie]);
request2.open('GET', url, false);
request2.setRequestHeader('Ocp-Apim-Subscription-Key', '41407438c94140dda6f2819ac4d0416c');
request2.onload = function () {

    var data = JSON.parse(this.response);

    const p = document.createElement('p');
    p.textContent = data.value[1].contentUrl;
    var string = p.textContent;

    const card = document.createElement('div');
    card.setAttribute('class', 'card');

    const h1 = document.createElement('h1');
    h1.textContent = lista_filme[movie];

    var imagine = document.createElement("IMG");
    imagine.setAttribute("src", string);
    imagine.setAttribute("width", "304");
    imagine.setAttribute("height", "228");
    container.appendChild(card);
    card.appendChild(h1);
    card.appendChild(imagine);
}

request2.send();
}