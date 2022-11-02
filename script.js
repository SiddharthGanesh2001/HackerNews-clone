


//url of top stories
const topstoriesurl = "https://hacker-news.firebaseio.com/v0/topstories.json";

//url of particular news item
const newsitemurl = "https://hacker-news.firebaseio.com/v0/item/";

//url of jobstories
const jobstoriesurl = "https://hacker-news.firebaseio.com/v0/jobstories.json";

let newsIDs = [];
let newsJSONs = [];
let newsHTMLs = [];
let scrollProcessing = false;

let newsRequests = 0;
const ol = document.createElement("ol");
const ul = document.createElement("ul");
document.querySelector("#topstories").appendChild(ol);
document.querySelector("#jobstories").appendChild(ul);


function main(url, listType=ol) {
	
	newsRequests = 0;
	let buttonProcessing = false;

	//SCROLLING MODULE	

	document.addEventListener("scroll", function (event) {

		// console.log("scrolltop:"+this.documentElement.scrollTop+" scrollHeight:"+this.documentElement.scrollHeight+" clientHeight:"+this.documentElement.clientHeight);
	
		if (scrollProcessing) {
			return;
		}

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
					newsHTMLs = getNewsHTMLContent(requests);
					console.log(newsHTMLs);
					return newsHTMLs;
									
				})
				.then((newsHTMLs) => {

					renderHTML(newsHTMLs,listType);
		
				})
				.catch(() => {
					console.log("End of stories");
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
			
			renderHTML(newsHTMLs, listType);
			
		});



	var buttons = document.querySelectorAll(".button");

	buttons.forEach(function(button) {
		button.addEventListener("click", function(event) {
			if(buttonProcessing) {
				return;
			}
			
			console.log("I have been clicked");
			if(button.id == "home") {
				console.log("home");
				buttonProcessing = true;
				document.getElementById("jobstories").style.display = "none";
				document.getElementById("loadingmask").style.display = "block";
				document.getElementById("topstories").style.display = "block";
				document.querySelector("ol").innerHTML = "";
				
				main(topstoriesurl, ol);
			}
			if(button.id == "jobs") {
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

	let newsItems = newsJSONs.map((story) => {
		if (story.url) {
			var title = story.title;
			var link = story.url;
			var domain = new URL(link);
			domain = domain.hostname;
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

function renderHTML(newsHTMLs, listType) {

	document.getElementById("loadingmask").style.display = "none";
	listType.insertAdjacentHTML("beforeend", newsHTMLs);
	newsRequests++;
	scrollProcessing = false;

}

main(topstoriesurl);
