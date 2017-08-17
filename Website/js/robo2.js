  $(document).ready(function() {
     

	  		  $.ajax({
    url: 'http://127.0.0.1:1880/roboarm',
			  data: {
				  'action':'start-left'
			  },
    complete : function(){
    },
    success: function(result){
		alert(result.message);
    }
});	  

	  
	  

	  
      });
		