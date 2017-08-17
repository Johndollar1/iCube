  $(document).ready(function() {
     

	  		  $.ajax({
    url: 'http://127.0.0.1:1880/roboarm',
			  data: {
				  'action':'start-left'
			  },
				  datatype: 'jsonp',
    complete : function(){
				alert("TEST");
	
    },
    success: function(result){
		alert("TEST22");
		//alert(result.message);
    }
});	  

	  
	  

	  
      });
		