  $(document).ready(function() {
        $('#vertical').lightSlider({
          gallery:true,
          item:1,
          verticalHeight:518,
          vThumbWidth:50,
          thumbItem:5,
          thumbMargin:2,
          slideMargin:0,
		  auto:true,
		  loop:true,
			pauseOnHover: true,
			pause:8000,
			controls:true,

        });  
      });
			
   			function time(show) {
      			Heute = new Date();
      			Stunde  = Heute.getHours();
      			Minute  = Heute.getMinutes();
      			Sekunde = Heute.getSeconds();
      			document.getElementById("time").innerHTML=Stunde+":"+((Minute<=9)?"0"+Minute:Minute)+":"+((Sekunde<=9)?"0"+Sekunde:Sekunde)+" Uhr";
   			}
			  <!--
      function GetDay(intDay){
         var DayArray = new Array("Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag");
         return DayArray[intDay];
      }
      function GetMonth(intMonth){
         var MonthArray = new Array("Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember");
         return MonthArray[intMonth];
      }
      function getDateStrWithDOW(){
         var today = new Date();
         var year = today.getYear();
         if(year<1000) year+=1900
         var todayStr = GetDay(today.getDay()) + ", ";
         todayStr += today.getDate() + ". " + GetMonth(today.getMonth());
         todayStr += " " +year;
         return todayStr;
      }
   //-->
			$(document).ready(function(){
	       var myString ="";
				if (navigator.geolocation) {
        			navigator.geolocation.getCurrentPosition(zeigePosition);
    			} else {
        			$.notify("Geolocation wird nicht unterstuetzt.","error");
										$.ajax({
    url: "http://api.openweathermap.org/data/2.5/weather",
    jsonp: "callback",
    dataType: "jsonp",
    data: {
		q: "Zurich, CH",
		lang: "de",
		units: "metric",
        APPID: "d7eb52e16b97ffae775d3a62f48e4b63"
    },
    success: function( result ) {

					$("#location").html(result.name + ", " + result.sys.country);
					$("#temp").html(Math.round(result.main.temp));
					$("#himmel").html(result.weather[0].description);
					$.notify("Wetter, Uhrzeit und Datum geladen","success");
    }
});
    			}
				function zeigePosition(position) {
					$.notify("Geolocation aktiviert", "success");
									
					
					
					
					$.ajax({
    url: "http://api.openweathermap.org/data/2.5/weather",
    jsonp: "callback",
    dataType: "jsonp",
    data: {
		lat: position.coords.latitude,
		lon: position.coords.longitude,
		lang: "de",
		units: "metric",
        APPID: "d7eb52e16b97ffae775d3a62f48e4b63"
    },
    success: function( result ) {

					$("#location").html(result.name + ", " + result.sys.country);
					$("#temp").html(Math.round(result.main.temp));
					$("#himmel").html(result.weather[0].description);
					$.notify("Wetter, Uhrzeit und Datum geladen","success");
    }
});
					
					
					
					
 
}
	

    });	