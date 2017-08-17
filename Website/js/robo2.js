  $(document).ready(function() {
     

	  		  $.ajax({
    url: 'http://127.0.0.1:1880/roboarm',
			  data: {
				  'action':'start-left'
			  },
				  datatype: 'json',
    complete : function(){
				alert("TEST");
	
    },
    success: function(result){
		$.notify("Verbindung zum Roboterarm hergestellt.","success");
		$.notify("Status: "+result["status"] ,"success");
    }
});	  

	  
	  

	  
      });
		