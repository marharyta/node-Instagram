const http = require("http");
const https = require("https");
const querystring = require('querystring');
var bufferArray = [];
var vision = "";
var output = " ";
const outfitRegex = /(hot|cold|outfit|skirt|shorts|sweater|jacket|jeans|dress|coat|shirt|trousers|look)/i;
function checkInstaTags(imageLinks, regex){
  return imageLinks.filter(obj => obj.tags.some(s => regex.test(s)));
}

function checkImageForAdultContentAsync(imgUrl) {
  console.log("check", imgUrl);
  return new Promise(function(resolve, reject){
	    var options = {
	      protocol: "https:",
	      hostname: "westus.api.cognitive.microsoft.com",
	      path: "/vision/v1.0/analyze?visualFeatures=Adult&language=en",
	      method: "POST",
	      headers: {
		      'Content-Type': 'application/json',
		      'Ocp-Apim-Subscription-Key': 'a03d0d045e2b436fbc8c7b89d15b0e3d'
		    }
	    };

	    let postdata = {
		    "url": imgUrl
		};

	    var visionRequest = https.request(options);
	     visionRequest.on("response", function(res){

	      res.on("data", function(data){
	        console.log("data as buffer");
	        res.setEncoding('utf8');
	        vision  = vision  + data;
	      });
      
	      res.on("end", function(data){
	      	console.log("vision data", data);
	      	console.log(vision );
	      	//resolve(data);
	        console.log("end");

	      });
	      console.log("response");
	      console.log("response from vision", res.statusCode);
	      console.log("response from vision", res.statusMessage);
	      console.log("response from vision", res.headers);
	    });

	    let dataToSend = JSON.stringify(postdata);
	    console.log("dataToSend", dataToSend);

	    visionRequest.write(dataToSend,'utf8');
	    visionRequest.end();
 	});
}
 
 function requestInstagramData(){
 	return new Promise(function(resolve, reject){
 		var imageLinks = [];
	    var options = {
	      protocol: "https:",
	      hostname: "api.instagram.com",
	      path: "/v1/tags/summer/media/recent?access_token=3681332213.81b69f2.88020902f003411196c3f4423912f547",
	      method: "GET"
	    };

	    var instaRequest = https.request(options);
	     instaRequest.on("response", function(res){
	      res.on("data", function(data){
	        console.log("data as buffer");
	        res.setEncoding('utf8');
	        bufferArray.push(data);
	        output = output + data;
	      });
      
	      res.on("readable", function(data){
	        console.log("redable");
	      });
	      res.on("end", function(data){
	      	
	      
	      	var fashionData = JSON.parse(output);
	      	//console.log(fashionData);
	      	//console.log(fashionData.data);
	      	imageLinks = fashionData.data.map(function(item){
	      		return {
	      			link: item.images.low_resolution.url,
	      			tags: item.tags
	      		}
	      	});
	      	 resolve(imageLinks);
	        console.log("end");

	      });
	      console.log("response");
	      console.log(res.statusCode);
	      console.log(res.statusMessage);
	    });
	    
	    instaRequest.end();
 	});
 }

 

requestInstagramData()
.then(function(data){
	console.log(data);
	console.log(data.length);
	console.log("Yes");
	return checkInstaTags(data, outfitRegex);
})
.then(function(data){
	console.log(data.length);
	console.log(data);
	return checkImageForAdultContentAsync(data[3].link);
})
.then(function(data){
	console.log(data);
})
.catch(function(error){
	console.log("error", error);
});

function getApprovedPicsAsync(imageLinks) {
  const promises = imageLinks.map(imgLink => checkImageForAdultContentAsync(imgLink));
  return Promise.all(promises)
    .then(adultArr => imageLinks.filter((imgLink, i) => isApproved(imgLink.adult = adultArr[i])));
}




/*
var requestSearchTags = axios.get(config.instagramApi.searchTags(req.query.weather))
    .then(resp => resp.data.data.filter(tag => outfitRegex.test(tag.name)))
    .then(tags => (console.log(tags[0].name), requestFashionAsync(tags[0].name)))
    .then(function(data){
      data.map(item =>  addImageToCollection(item));
      //addImageToCollection(image)
      res.status(200).json(data);
    })
    .catch(function (error) {
      res.status(404).send(error);
      console.log(error);
    }); 

*/

