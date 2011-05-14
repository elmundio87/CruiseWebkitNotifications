// ==UserScript==
// @name           Cruise Fail warning
// @namespace      http://www.elmundio.net
// @description    Checks the state of a pipeline and warns you if it fails. You must manually enable desktop notifications.
// @version        1
// @author         Elmundio87
// @include        http://cruise.caplin.com:8153*
// @include        http://cruise:8153*
// ==/UserScript==


/* SET UP THE DB */

var db = openDatabase('settingsDB', '1.0', 'Contains the items in the watchlist', 2 * 1024 * 1024);
db.transaction(function (tx) {
  tx.executeSql('CREATE TABLE watchList (watchitem)');
});

db.transaction(function (tx) {
  tx.executeSql('DELETE FROM watchList');
});

db.transaction(function (tx) {
  tx.executeSql('INSERT INTO watchList(watchitem) VALUES("CT2-main-Blades-UTs")');
    tx.executeSql('INSERT INTO watchList(watchitem) VALUES("CT2-main-ITs-IE6")');
});


/* SET UP THE SETTINGS UI */
var tabs = document.getElementsByClassName("tabs")[0];

var notificationSettingsLI=document.createElement("li");
var notificationSettingsA=document.createElement("a");

notificationSettingsLI.appendChild(notificationSettingsA); //append text to new div
notificationSettingsA.appendChild(document.createTextNode("Notification Settings")); //append text to new div
notificationSettingsLI.onclick= function(){settingsBox.style.display='inline';};


tabs.appendChild(notificationSettingsLI); //append new div to another div

var settingsBox =document.createElement("div");
settingsBox.style.backgroundColor = '#333';
settingsBox.style.height="300px";
settingsBox.style.width="500px";
settingsBox.style.position="absolute";
settingsBox.style.top="100px";
settingsBox.style.left="100px";
settingsBox.id = "settingsBox"

document.body.appendChild(settingsBox);

var allowNotifications =document.createElement("a");
allowNotifications.appendChild(document.createTextNode("Allow Notifications"))
allowNotifications.onclick= function requestPermission() {window.webkitNotifications.requestPermission();};
settingsBox.appendChild(allowNotifications);
settingsBox.style.display="none";

var closeButton =document.createElement("a");
closeButton.appendChild(document.createTextNode("Close"))
closeButton.onclick= function hideSettings() {settingsBox.style.display='none';};
settingsBox.appendChild(closeButton);

var watchList =document.createElement("SELECT");
watchList.multiple="multiple";
watchList.size=5;
watchList.id = "watchlist";
settingsBox.appendChild(watchList);

var addButton =document.createElement("BUTTON");
addButton.appendChild(document.createTextNode("Add"))
addButton.onclick= function hideSettings() {settingsBox.style.display='none';};
settingsBox.appendChild(addButton);

var removeButton =document.createElement("BUTTON");
removeButton.appendChild(document.createTextNode("Remove"))
removeButton.onclick= function removeOptions(){var i
;
for(i=watchList.options.length-1;i>=0;i--)
{
if(watchList.options[i].selected)
{
watchList.remove(i);
removeByElement(notifications,watchList.options[i].text);
removeByElement(warningList,watchList.options[i].text);
}
};
}
settingsBox.appendChild(removeButton);

var inputPiplelineName =document.createElement("input");
inputPiplelineName.appendChild(document.createTextNode("CT2-main"))

settingsBox.appendChild(inputPiplelineName);

function requestPermission() {
  window.webkitNotifications.requestPermission();
}



/*========================================================*/



/* SET UP THE FUNCTIONALITY */

var failed = 0;
var flashBool = 1;
var notifications = new Array();
var warningList = new Array();

window.webkitNotifications.requestPermission();

function addToSettingsWatchlist(pipelineName)
{
		var opt = document.createElement("option");
		opt.text = pipelineName;
		document.getElementById("watchlist").options.add(opt);
}

function PipelineWatcher(pipelineName)
{
		var counter = 0;
		
		addToSettingsWatchlist(pipelineName)
		
		
		function warning(pipelineName){
		failed = 0;
		
		var pipelineID = 'pipeline_' + pipelineName	+ '_panel';
		var latest_stage = document.getElementById(pipelineID).getElementsByClassName('latest_stage')[0].innerHTML;
		if(latest_stage.indexOf('Failed',0) > -1)
		{
			failed = 1;
			if(contains(notifications,pipelineID) == false)
			{
				if(counter > 0)
				{
					window.webkitNotifications.createNotification('http://cruise.caplin.com:8153/go/images/g9/logo_go.png', pipelineName, latest_stage).show();
				}
				notifications.push(pipelineID);
			}
		}
		else
		{
			removeByElement(notifications,pipelineID);
		}
		
		
		self.setTimeout(function(){warning(pipelineName)},1000);
		
	}
	
	if(contains(warningList, pipelineName))
	{
		warning(pipelineName);
	}
	
	
}

function titleFlash()
{
	document.title='Pipeline Activity - Go';
	if(failed == 1)
	{
	flashBool = flashBool * -1;
	
		if(flashBool==1)
		{
			document.title='  MAIN FAIL  ';
		}
			
		if(flashBool==-1)
		{
			document.title='++MAIN FAIL++';
		}
	}
	setTimeout(titleFlash,1000)
}


function contains(a, obj){
  for(var i = 0; i < a.length; i++) {
    if(a[i] === obj){
      return true;
    }
  }
  return false;
}

function removeByElement(a,obj)
 {
    for(var i=0; i<a.length;i++ )
     { 
        if(a[i]==obj)
            a.splice(i,1); 
      } 
  }

titleFlash();

db.transaction(function (tx) {
  tx.executeSql('SELECT * FROM watchList', [], function (tx, results) {
  var len = results.rows.length, i;
  for (i = 0; i < len; i++) {
 	addToSettingsWatchlist(results.rows.item(i).watchitem)
  }
  });
});

/* MANUALLY INSERT WARNINGLIST ENTRIES */

warningList.push(new PipelineWatcher('CT2-main'));
warningList.push(new PipelineWatcher('CT2-main-smoke'));
/*warning('CT2-main');
warning('CT2-main-smoke');
warning('CT2-main-Blades-UTs');
warning('CT2-main-Blades-ATs');
warning('CT2-main-Blades-ITs');
warning('CT2-main-validate-XML');
warning('CT2-main-TomcatSecurity');
warning('CT2-main-GridLibrary-General');
warning('CT2-main-GridLibrary-Expandable');
warning('CT2-main-GridLibrary-MultiSelect');
warning('CT2-main-GridLibrary-SingleSelect');
warning('CT2-main-Component-AT');
warning('CT2-main-Trading-AT');
warning('CT2-main-i18n-ATs');
warning('CT2-main-sdk');
warning('CT2-main-doc');
warning('CT2-main-PAT');
warning('CT2-main-ITs-IE6');
warning('CT2-main-ITs-IE7');
warning('CT2-main-ITs-IE8');
warning('CT2-main-ITs-FF3-5');
warning('CT2-main-ITs-FF4');
warning('CT2-main-deployment');
warning('CT2-main-QualityGate');
warning('CT2-main-libraries-thirdparty');
warning('CT2-main-server'); */

