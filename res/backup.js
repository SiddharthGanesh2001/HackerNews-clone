
// window.onload = function(){
// 	document.getElementById("loadingmask").style.display = "none";
// }


//url of top stories
var topstoriesurl = "https://hacker-news.firebaseio.com/v0/topstories.json";

//url of particular news item
var newsitemurl = "https://hacker-news.firebaseio.com/v0/item/";

var newsIDs = [];
var newsJSONs = [];
var newsHTMLs = [];

function main() {
	
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
			document.getElementById("loadingmask").style.display = "none";
			// document.getElementById("content").style.display = "block";
			renderHTML(newsHTMLs);
		});






}

//fetching the data


function getNewsIDs() {
	return fetch(topstoriesurl)
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
		if(story.hasOwnProperty('url')){
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
	});


	// document.querySelector(".itemlist").appendChild(ol);

	// ol.insertAdjacentHTML("beforeend", newsitem);

	// console.log(newsItems);

	return newsItems;

}

function renderHTML(newsHTMLs){
	var ol = document.createElement("ol");

	document.querySelector(".itemlist").appendChild(ol);
	const renderArr = newsHTMLs.slice(0,25);
	ol.insertAdjacentHTML("beforeend", renderArr);

}

main();
// Promise.all(newsJSONs)
// 		.then(values => console.log(values));

if(itemlist){
	itemlist.addEventListener('scroll', function() {
		// if(processing)
		// 	return;
		// if (itemlist.scrollTop() >= itemlist.height() - window.height() - 700){
		// 	processing = true;
		// 	getNewsIDs().then((newsIDs) => {
		// 		console.log(newsIDs);

		// 	})
		// 	.then(() => {
		// 		processing = false;
		// 	})
		// }

		console.log(itemlist.scrollTop+""+itemlist.scrollHeight);
	});
	}