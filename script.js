


//url of top stories
var topstoriesurl = "https://hacker-news.firebaseio.com/v0/topstories.json";

//url of particular news item
var newsitemurl = "https://hacker-news.firebaseio.com/v0/item/";

//url of jobstories
var jobstoriesurl = "https://hacker-news.firebaseio.com/v0/jobstories.json";

var newsIDs = [];
var newsJSONs = [];
var newsHTMLs = [];
var scrollProcessing = false;

var newsRequests = 0;
var ol = document.createElement("ol");
var ul = document.createElement("ul");
document.querySelector("#topstories").appendChild(ol);
document.querySelector("#jobstories").appendChild(ul);


function main(url, lt=ol) {
	
	newsRequests = 0;
	var buttonProcessing = false;
	
	
	//SCROLLING MODULE
	

	document.addEventListener("scroll", function (event) {

		// console.log("scrolltop:"+this.documentElement.scrollTop+" scrollHeight:"+this.documentElement.scrollHeight+" clientHeight:"+this.documentElement.clientHeight);
	
		if (scrollProcessing)
			return;

		if ((0.9 * this.documentElement.scrollHeight) - this.documentElement.scrollTop <= this.documentElement.clientHeight) {
			console.log("Ajax hit");
			document.getElementById("loadingmask").style.display = "block";
			const requests = [];
			scrollProcessing = true;
			console.log("Number of news requests:" + newsRequests);

			for (let i = (50 * newsRequests); i < (50 * newsRequests) + 50; i++) {
				requests.push(getNewsByID(newsIDs[i]));
			}

			newsJSONs = [];
			newsHTMLs = [];

			Promise.all(requests)
				.then((requests) => {
					console.log(requests);
					try{
						newsHTMLs = getNewsHTMLContent(requests);
						console.log(newsHTMLs);
						return newsHTMLs;
					}
					catch(error){
						console.log("End of stories");
					}
					
				})
				.then((newsHTMLs) => {

					renderHTML(newsHTMLs,lt);
					//scrollProcessing = false;
				});
		}

	});

	//FIRST LOAD	
	
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
		
			//document.querySelector("#topstories").appendChild(ol);
			
			renderHTML(newsHTMLs, lt);
			
		});



	var buttons = document.querySelectorAll(".button");

	//console.log(buttons);
	buttons.forEach(function(button) {
		button.addEventListener("click", function(event) {
			if(buttonProcessing)
				return;
			
			
			console.log("I have been clicked");
			if(button.id == "home"){
				console.log("home");
				buttonProcessing = true;
				document.getElementById("jobstories").style.display = "none";
				document.getElementById("loadingmask").style.display = "block";
				document.getElementById("topstories").style.display = "block";
				document.querySelector("ol").innerHTML = "";
				
				main(topstoriesurl, ol);
			}
			if(button.id == "jobs"){
				console.log("jobs");
				buttonProcessing = true;
				document.getElementById("topstories").style.display = "none";
				document.getElementById("loadingmask").style.display = "block";
				document.getElementById("jobstories").style.display = "block";
				document.querySelector("ul").innerHTML = "";
	
				main(jobstoriesurl,ul);
				
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


	return newsItems;

}

function renderHTML(newsHTMLs, lt) {
	document.getElementById("loadingmask").style.display = "none";
	// const renderArr = newsHTMLs.slice(0,25);
	lt.insertAdjacentHTML("beforeend", newsHTMLs);
	
	newsRequests++;
	scrollProcessing = false;
	

}

main(topstoriesurl);