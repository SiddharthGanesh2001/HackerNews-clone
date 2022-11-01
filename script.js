


//url of top stories
var topstoriesurl = "https://hacker-news.firebaseio.com/v0/topstories.json";

//url of particular news item
var newsitemurl = "https://hacker-news.firebaseio.com/v0/item/";

//url of jobstories
var jobstoriesurl = "https://hacker-news.firebaseio.com/v0/jobstories.json";

var newsIDs = [];
var newsJSONs = [];
var newsHTMLs = [];
var processing = false;
var newsRequests = 0;
var ol;
var ul;


function main(url) {



	document.addEventListener("scroll", function (event) {

		// console.log("scrolltop:"+this.documentElement.scrollTop+" scrollHeight:"+this.documentElement.scrollHeight+" clientHeight:"+this.documentElement.clientHeight);

		if (processing)
			return;

		if ((0.9 * this.documentElement.scrollHeight) - this.documentElement.scrollTop <= this.documentElement.clientHeight) {
			console.log("Ajax hit");
			document.getElementById("loadingmask").style.display = "block";
			const requests = [];
			processing = true;
			console.log("Number of news requests:" + newsRequests);

			for (let i = (50 * newsRequests); i < (50 * newsRequests) + 50; i++) {
				requests.push(getNewsByID(newsIDs[i]));
			}

			newsJSONs = [];
			newsHTMLs = [];

			Promise.all(requests)
				.then((requests) => {
					console.log(requests);
					newsHTMLs = getNewsHTMLContent(requests);
					console.log(newsHTMLs);
					return newsHTMLs;
				})
				.then((newsHTMLs) => {

					renderHTML(newsHTMLs);
					processing = false;
				});
		}
		//console.log(wind);
	});

	

	getNewsIDs(url).then((data) => {
		newsIDs = data;
		console.log(newsIDs);

	})
		.then(() => {

			const requests = [];
			for (let i = 0; i < 50; i++) {
				requests.push(getNewsByID(newsIDs[i]));
			}

			return Promise.all(requests);
		})
		.then((newsJSONs) => {
			console.log(newsJSONs);
			newsHTMLs = getNewsHTMLContent(newsJSONs);
			console.log(newsHTMLs);
			return newsHTMLs;
		})
		.then((newsHTMLs) => {
			ol = document.createElement("ol");
			document.querySelector("#topstories").appendChild(ol);
			// document.getElementById("content").style.display = "block";
			renderHTML(newsHTMLs);

		});



	var buttons = document.querySelectorAll(".button");

	//console.log(buttons);
	buttons.forEach(function(button) {
		button.addEventListener("click", function() {
			console.log("I have been clicked");
			if(button.id == "home"){
				console.log("home");
				document.getElementById("loadingmask").style.display = "block";
				main(topstoriesurl);
			}
			if(button.id == "jobs"){
				console.log("jobs");
				document.getElementById("topstories").style.display = "none";
				document.getElementById("loadingmask").style.display = "block";
				document.getElementById("jobstories").style.display = "block";
	
				main(jobstoriesurl);
				
			}
		});
	});

	


}

//fetching the data


function getNewsIDs(link) {
	return fetch(link)
		.then((response) => response.json());
}





function getNewsByID(newsId) {

	return fetch(`${newsitemurl}${newsId}.json`)
		.then((response) => response.json())
		.catch(() => {
			console.log("No URL only story");
		});

}






function getNewsHTMLContent(newsJSONs) {


	// var ol = document.createElement("ol");



	//transforming the array newsJSONs

	var newsItems = newsJSONs.map((story) => {
		if (story.hasOwnProperty('url')) {
			var title = story.title;
			var link = story.url;
			var domain = new URL(link);

			// console.log('domain:'+domain);
			domain = domain.hostname;
			// console.log('hostname:'+domain);
			var by = story.by;
			var score = story.score;


			return `<li>

						<a href = "${link}">${title} </a> 
						<span class="greyscale"> <a href = "${domain}" target="_blank">(${domain})</a><br>
						${score} by ${by} 
						</span>
					</li>`;
		}
	}).join('');


	// document.querySelector(".itemlist").appendChild(ol);

	// ol.insertAdjacentHTML("beforeend", newsitem);

	// console.log(newsItems);

	return newsItems;

}

function renderHTML(newsHTMLs) {
	document.getElementById("loadingmask").style.display = "none";
	// const renderArr = newsHTMLs.slice(0,25);
	ol.insertAdjacentHTML("beforeend", newsHTMLs);
	newsRequests++;

}

main(topstoriesurl);
// Promise.all(newsJSONs)
// 		.then(values => console.log(values));