  $(document).ready(function() {
     
	  
	  $( "#btn1" ).click(function() {

		 		  
		  window.location.href = 'video.html';
});
	  
	  		  $.ajax({
    url: 'http://127.0.0.1:1880/test',
			  data: "stop",
    complete : function(){
    },
    success: function(result){
    }
});	  
	  
	  

	  
      });
		