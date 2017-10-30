  $(document).ready(function() {
     
	var imagesContainer;
	var twitterContainer;
	var imageContent;
	var glassWithBubbles;
	  
	  $( "#btn1" ).click(function() {
		  
		  
		  	  		  $.ajax({
    url: 'http://192.168.1.1:1880/roboarm',
			  data: {
				  'action':'start-left'
			  },
    complete : function(){
    },
    success: function(result){
		$.notify("Start left","success");		
    },
				  error: function(){
					  $.notify("Connection to innoCube failed","error");
					  $('#loading').fadeOut();
					  $('#locked').fadeIn();
				  }
});	 
		  
		  $('#choose').fadeOut();
		  $('#generating').fadeIn();
		  
		setTimeout(
  function() 
  {
	  $('#generating').fadeOut();
	  $('#ready').fadeIn();
	  $('#beroccaspot').get(0).play();
var video = $("#beroccaspot").get(0).addEventListener("ended", function() {
   			$('#ready').fadeOut();
			$('#choose').fadeIn();
		});	
    //do something special
  }, 15000);
		 		  
		  
});
	  
	  
	    $( "#btn2" ).click(function() {
		  
		  
		  	  		  $.ajax({
    url: 'http://192.168.1.1:1880/roboarm',
			  data: {
				  'action':'start-right'
			  },
    complete : function(){
    },
    success: function(result){
		$.notify("Start right","success");		
    },
				  error: function(){
					  $.notify("Connection to innoCube failed","error");
					  $('#loading').fadeOut();
					  $('#locked').fadeIn();
				  }
});	 
		  
		  $('#choose').fadeOut();
		  $('#generating').fadeIn();
		  
		setTimeout(
  function() 
  {
	  $('#generating').fadeOut();
	  $('#ready').fadeIn();
	  $('#beroccaspot').get(0).play();
var video = $("#beroccaspot").get(0).addEventListener("ended", function() {
   			$('#ready').fadeOut();
			$('#choose').fadeIn();
		});	
    //do something special
  }, 15000);
		 		  
		  
});
	  
	  		  $.ajax({
    url: 'http://192.168.1.1:1880/roboarm',
			  data: {
				  'action':'status'
			  },
    complete : function(){
    },
    success: function(result){
		$.notify("Connection to innoCube successful","success");
		
		
		if (result["status"] == "ready") {
			$.notify("Status "+result["status"],"success");
			$('#choose').fadeIn();	
		} else if (result["status"] == "locked") {
			$.notify("Status "+result["status"],"error");
			$('#locked').fadeIn();
		}
		
		
		
    },
				  error: function(){
					  $.notify("Connection to innoCube failed","error");
					  $('#loading').fadeOut();
					  $('#locked').fadeIn();
				  }
});	  
	  
	  
glassWithBubbles = new GlassWithBubbles();
imagesContainer = $('#splashImagesContainer');
imagesContainer.append(glassWithBubbles.getView());
glassWithBubbles.start();
	  

      });
		

function GlassWithBubbles()
{
	var renderInterval = 0;
	
	var view = $('<div id="glassWithBubbles"></div>');
	
	var videoElement		= $('<video id="video" width="400" height="580" poster="img/glas_solo.png" style="display:none;" autoplay><source src="vid/glas_loop_sbs_blend_v003.mp4"/></video>');
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
	


