// ==UserScript==
// @name           Cruise Fail warning
// @namespace      http://www.elmundio.net
// @description    Checks the state of a pipeline and warns you if it fails. You must manually enable desktop notifications.
// @version        1
// @author         Elmundio87
// @include        http://your.cruise.url:port/*

// ==/UserScript==


/* SET UP THE DB */

var db = openDatabase('settingsDB', '1.0', 'Contains the items in the watchlist', 2 * 1024 * 1024);
db.transaction(function (tx) {
  tx.executeSql('CREATE TABLE watchList (watchitem)');
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
settingsBox.style.width="570px";
settingsBox.style.position="absolute";
settingsBox.style.top="100px";
settingsBox.style.left="100px";
settingsBox.id = "settingsBox"

document.body.appendChild(settingsBox);

var watchList =document.createElement("SELECT");
watchList.multiple="multiple";
watchList.size=5;
watchList.id = "watchlist";
watchList.style.position="absolute";
watchList.style.height="240px";
watchList.style.width="260px";
watchList.style.top="10px";
watchList.style.left="10px";
settingsBox.appendChild(watchList);

var allowNotifications =document.createElement("a");
allowNotifications.appendChild(document.createTextNode("Allow Notifications"))
allowNotifications.onclick= function requestPermission() {window.webkitNotifications.requestPermission();};

allowNotifications.style.position="absolute";
allowNotifications.style.right="10px";
allowNotifications.style.bottom="10px";
allowNotifications.style.color="#FFF";
allowNotifications.style.fontSize="18px";
allowNotifications.style.textDecoration="underline";
settingsBox.appendChild(allowNotifications);
settingsBox.style.display="none";

var closeButton =document.createElement("a");
closeButton.appendChild(document.createTextNode("[X]"))
closeButton.onclick= function hideSettings() {settingsBox.style.display='none';};
closeButton.style.position="absolute";
closeButton.style.top="10px";
closeButton.style.right="10px";
closeButton.style.color="#FFF";
closeButton.style.fontSize="18px";
settingsBox.appendChild(closeButton);



var addButton =document.createElement("BUTTON");
addButton.appendChild(document.createTextNode("Add"))
addButton.onclick= function a() {addToDB()};
addButton.style.position="absolute";
addButton.style.height="25px";
addButton.style.width="60px";
addButton.style.top="40px";
addButton.style.left="280px";
settingsBox.appendChild(addButton);

var removeButton =document.createElement("BUTTON");
removeButton.appendChild(document.createTextNode("Remove Selected"));
removeButton.onclick= function a(){removeOption()};
removeButton.style.height="25px";
removeButton.style.width="260px";
removeButton.style.top="260px";
removeButton.style.left="10px";
settingsBox.appendChild(removeButton);

var inputPipelineName =document.createElement("SELECT");
inputPipelineName.id = "inputPipelineName";
inputPipelineName.style.position="absolute";
inputPipelineName.style.width="250px";
inputPipelineName.style.top="10px";
inputPipelineName.style.left="280px";


settingsBox.appendChild(inputPipelineName);

var all = document.getElementsByClassName("pipeline")

    for(var i=0; i<all.length;i++ )
    { 
        var opt = document.createElement("option");
		opt.text = all[i].id.replace("pipeline_","").replace("_panel","");
		document.getElementById("inputPipelineName").options.add(opt);
    } 

function requestPermission() {
  window.webkitNotifications.requestPermission();
}

function removeOption(){
debugger;
var pipelineName = document.getElementById("inputPipelineName").value;
var SQL = 'DELETE FROM watchList WHERE watchitem = "' + watchList.options[watchList.selectedIndex].text + '";'

	db.transaction(function (tx) {
		tx.executeSql(SQL);
	});

var i;
for(i=watchList.options.length-1;i>=0;i--)
{

	if(watchList.options[i].selected)
	{
		removeByElement(notifications,watchList.options[i].text);
		killWarningListItem(watchList.options[i].text);
		removeByElement(warningList,watchList.options[i].text);

		watchList.remove(i);
	}
};


}

function killWarningListItem(ID)
 {
    for(var i=0; i<warningList.length;i++ )
     { 
        if(warningList[i].ID==ID)
            warningList[i].active = 0;
      } 
  }

function addToDB(){
var pipelineName = document.getElementById("inputPipelineName").value;
addToSettingsWatchlist(pipelineName);


db.transaction(function (tx) {
  tx.executeSql('INSERT INTO watchList(watchitem) VALUES("'+pipelineName+'")');
});

warningList.push(new PipelineWatcher(pipelineName));
}

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

		this.ID = pipelineName;

		this.active = 1;

		function warning(pipelineName, thiss){
			
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
						window.webkitNotifications.createNotification('http://cruise.caplin.com:8153/go/images/g9/icons/icon_warning_16.png', pipelineName, latest_stage).show();
					}
					notifications.push(pipelineID);
				}
			}
			else
			{
				removeByElement(notifications,pipelineID);
			}
			
			counter++;
			
			if(thiss.active == 1)
			{
				self.setTimeout(function(){warning(pipelineName,thiss)},1000);
			}
			else
			{
				failed = 0;
			}
			
		}
	
		warning(pipelineName, this);

		
	
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
	warningList.push(new PipelineWatcher(results.rows.item(i).watchitem));
  }
  });
});


