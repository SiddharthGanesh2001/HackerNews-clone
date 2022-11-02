


//url of top stories
const TOPSTORIESURL="https://hacker-news.firebaseio.com/v0/topstories.json";

//url of particular news item
const NEWSITEMURL="https://hacker-news.firebaseio.com/v0/item/";

//url of jobstories
const JOBSTORIESURL="https://hacker-news.firebaseio.com/v0/jobstories.json";

let newsIDs=[];
let newsJSONs=[];
let newsHTMLs=[];
let scrollProcessing=false;
let newsRequests=0;
const ol=document.createElement("ol");
const ul=document.createElement("ul");
document.querySelector("#topstories").appendChild(ol);
document.querySelector("#jobstories").appendChild(ul);


function main(url, listType=ol) {
	
	newsRequests=0;
	let buttonProcessing=false;

	//SCROLLING MODULE	

	document.addEventListener("scroll", function (event) {
	
		if (scrollProcessing) {
			return;
		}

		if ((0.9 * this.documentElement.scrollHeight) - this.documentElement.scrollTop <= this.documentElement.clientHeight) {
			console.log("Ajax hit");
			setLoading(true);
			displayStories(newsIDs, listType);
		}

	});

	//FIRST LOAD	
	
	getNewsIDs(url).then((data) => {
		newsIDs=data;
		console.log(newsIDs);

	})
		.then(() => {

			const requests = [];
			for (let i=0; i<50; i++) {
				requests.push(getNewsByID(newsIDs[i]));
			}

			return Promise.all(requests);
		})
		.then((newsJSONs) => {
			console.log(newsJSONs);
			newsHTMLs=getNewsHTMLContent(newsJSONs);
			console.log(newsHTMLs);
			return newsHTMLs;
		})
		.then((newsHTMLs) => {
			
			renderHTML(newsHTMLs, listType);
			
		});


	//BUTTON MODULE
	let homeButton=document.querySelector("#home");
	let jobsButton=document.querySelector("#jobs");

	homeButton.addEventListener("click", function(event) {
		if(buttonProcessing) {
			return;
		}
			
		console.log("I have been clicked");
		console.log("home");
		buttonProcessing=true;
		document.querySelector("#jobstories").style.display="none";
		setLoading(true);
		document.querySelector("#topstories").style.display="block";
		document.querySelector("ol").innerHTML="";
				
		main(TOPSTORIESURL, ol);
	});

	jobsButton.addEventListener("click", function(event) {
		if(buttonProcessing) {
			return;
		}

		console.log("jobs");
		buttonProcessing=true;
		document.querySelector("#topstories").style.display="none";
		setLoading(true);
		document.querySelector("#jobstories").style.display="block";
		document.querySelector("ul").innerHTML="";
	
		main(JOBSTORIESURL,ul);			
			
	});
	


}




function getNewsIDs(link) {
	return fetch(link)
		.then((response) => response.json());
}

function getNewsByID(newsId) {

	return fetch(`${NEWSITEMURL}${newsId}.json`)
		.then((response) => response.json())
		.catch(() => {
			console.log("No URL only story");
		});

}

function getNewsHTMLContent(newsJSONs) {
	//transforming the array newsJSONs

	let newsItems=newsJSONs.map((story) => {
		if (story.url) {
			let domain=new URL(story.url);
			domain=domain.hostname;
			return `<li>
						<a href="${story.url}">${story.title} </a> 
						<span class="greyscale"> <a href="${domain}" target="_blank">(${domain})</a><br>
						${story.score} by ${story.by} 
						</span>
					</li>`;
		}
	}).join('');

	return newsItems;

}

function renderHTML(newsHTMLs, listType) {

	setLoading(false);
	listType.insertAdjacentHTML("beforeend", newsHTMLs);
	newsRequests++;
	scrollProcessing=false;

}

function displayStories(newsIDs,listType) {
	const requests=[];
	scrollProcessing=true;
	console.log("Number of news requests:" + newsRequests);
	let start=newsRequests*50;
	let end=start+50;
	for (let i=start; i<end; i++) {
		requests.push(getNewsByID(newsIDs[i]));
	}

	newsJSONs =[];
	newsHTMLs =[];

	Promise.all(requests)
	.then((requests) => {

		console.log(requests);
		newsHTMLs=getNewsHTMLContent(requests);
		console.log(newsHTMLs);
		return newsHTMLs;
									
	})
	.then((newsHTMLs) => {

		renderHTML(newsHTMLs,listType);
		
	})
	.catch(() => {
		console.log("End of stories");
		setLoading(false);
	});
}

function setLoading(bool) {
	if(bool) {
		document.querySelector("#loadingmask").style.display="block";		
	}
	else {
		document.querySelector("#loadingmask").style.display="none";
	}
}

main(TOPSTORIESURL);
