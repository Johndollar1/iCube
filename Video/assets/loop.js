$(document).ready(function() {
	
	var imageContainer;
	var glassWithBubbles;	  
	
	glassWithBubbles = new GlassWithBubbles();
	imageContainer = $('#videoContainer');
	imageContainer.append(glassWithBubbles.getView());
	glassWithBubbles.start();
});


function GlassWithBubbles()
{
	var renderInterval = 0;
	
	var view = $('<div id="glassWithBubbles"></div>');
	
	var videoElement		= $('<video id="video" width="400" height="580" poster="assets/loop.png" style="display:none;" autoplay><source src="assets/loop.mp4"/></video>');
	var videoPlayerElement	= $('<div id="video-player"></div>');
	
	var bufferElement 		= $('<canvas width="400" height="580" id="buffer"></canvas>');
	var outputElement 		= $('<canvas width="200" height="580" id="output"></canvas>');
	
	videoElement.bind("loadeddata", handleDataLoaded);
	
	view.append(videoElement);
	view.append(videoPlayerElement);
	view.append(bufferElement);
	view.append(outputElement);
	
	function handleDataLoaded() {
		this.addEventListener('ended', function() {
			this.play();
		}, false);
	}
	
	function processFrame() {
		var outputCanvas = outputElement.get(0);
		var output = outputCanvas.getContext('2d');
		var bufferCanvas = bufferElement.get(0);
		var buffer = bufferCanvas.getContext('2d');
		var video = videoElement.get(0);
		var width = outputCanvas.width;
		var height = outputCanvas.height;
		
		buffer.drawImage(video, 0, 0);
		
		var	image = buffer.getImageData(0, 0, width, height);
		var imageData = image.data;
		var alphaData = buffer.getImageData(width, 0, width, height).data;
		
		for (var i = 3, len = imageData.length; i < len; i = i + 4) {
			imageData[i] = alphaData[i-1];
		}
	output.putImageData(image, 0, 0, 0, 0, width, height);
	}
	
	this.start = function() {
		renderInterval = setInterval(processFrame, 30);
	};
	
	this.stop = function() {
		clearInterval(renderInterval);
	};
		this.getView = function() {
		return view;
	};
}
	

