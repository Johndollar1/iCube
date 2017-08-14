  $(document).ready(function() {
     
	  
	  $( "#btn1" ).click(function() {

		  $.ajax({
    url: 'http://127.0.0.1:1880/test',
    complete : function(){
        alert(this.url)
    },
    success: function(result){
    }
});	  
		  
		  window.location.href = 'video.html';
});
	  
	  

	  
      });
		