//url of jobstories
var jobstoriesurl = "https://hacker-news.firebaseio.com/v0/jobstories.json";

//url of individual story
var jobstoryurl = "https://hacker-news.firebaseio.com/v0/item/";

var newsIDs = [];
var newsJSONs = [];
var newsHTMLs = [];
var processing = false;
var newsRequests = 0;
var ul;


function main() {

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

	getNewsIDs().then((data) => {
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
			ul = document.createElement("ul");
			document.querySelector(".itemlist").appendChild(ul);
			// document.getElementById("content").style.display = "block";
			renderHTML(newsHTMLs);

		});






}

//fetching the data


function getNewsIDs() {
	return fetch(jobstoriesurl)
		.then((response) => response.json())
}

// GetNewsId().then((data)=> {
// 	console.log(data);
// 	data.map(async (d) => {
// 		let newsData = await fetchData(`${newsitemurl}${d}.json`);
// 		console.log(newsData);
// 	});
// })




function getNewsByID(newsId) {

	return fetch(`${jobstoryurl}${newsId}.json`)
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
	// const renderArr = newsHTMLs.slice(0,50);
	ul.insertAdjacentHTML("beforeend", newsHTMLs);
	newsRequests++;

}

main();