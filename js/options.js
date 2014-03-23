/**
Authors: yanyilin(elen_rl@163.com)
*/
var bg=null;
var server=null,identity=null,interval=null;
var list=null,newProfile=null,lastProfile=null;
var pname=null,pid=null,pinterval=null,pexecute=null,parguments=null;

document.addEventListener('DOMContentLoaded',function(){
	server=document.getElementById("server");
	identity=document.getElementById("identity");
	interval=document.getElementById("interval");
	list=document.getElementById("profilelist");
	curProfile=lastProfile=newProfile=document.getElementById("newprofile");
	newProfile.addEventListener("click",clickedProfileItem,false);
	pname=document.getElementById("pname");
	pid=document.getElementById("pid");
	pinterval=document.getElementById("pinterval");
	pexecute=document.getElementById("pexecute");
	parguments=document.getElementById("parguments");
	document.getElementById("saveconfigs").addEventListener("click",saveConfigs,false);
	document.getElementById("saveprofile").addEventListener("click",saveProfile,false);
	document.getElementById("removeprofile").addEventListener("click",removeProfile,false);
	
	document.body.onselectstart=function(){
		return false;
	}
	
	bg = chrome.extension.getBackgroundPage();

	var configs=bg.publicConfigs();
	server.value=configs.server;
	identity.value=configs.id;
	interval.value=configs.interval/60000;
	var profiles=bg.publicProfiles();
	for( var i in profiles ){
		createProfileItem(profiles[i]);
	}
},true);

function createProfileItem(p){
	var tr=document.createElement("tr");
	var td=document.createElement("td");
	td.innerText=p.name;
	td.id=p.id;
	td.addEventListener("click",clickedProfileItem,false);
	tr.appendChild(td);
	list.insertBefore(tr,newProfile.parentNode);
	return td;
}

function clickedProfileItem(e){
	var n=e.target;
	if (n===lastProfile){
		return;
	}
	n.setAttribute("class","selected");
	if (lastProfile){
		lastProfile.setAttribute("class","");
	}
	lastProfile = n;
	// Update detail data
	if ( n===newProfile ){
		pname.value="";
		pid.value="";
		pinterval.value=30;
		pexecute.value="";
		parguments.value="";
	} else {
		var profiles=bg.publicProfiles();
		var profile=profiles[n.id];
		pname.value=profile.name;
		pid.value=profile.id;
		pinterval.value=profile.interval/60000;
		pexecute.value=profile.execute||"";
		parguments.value=profile.arguents||"";
	}
}

function saveProfile(){
	var id=pid.value;
	if (!id||id==""){
		alert("终端标识不能为空！");
		pid.focus();
		return;
	}
	var profile=bg.profiles[id];
	if ( lastProfile===newProfile ){
		// create new profile
		if ( profile ) {
			// this profile exist
			setTimeout(function(){
				alert("已存在此终端标识："+profile.name);
			},false);
			return;
		}
		profile={"id":id};
	}
	var name=pname.value;
	if (!name||pname==""){
		name="未命名";
	}
	profile.name=name;
	var interval = parseInt(pinterval.value);
	if ( interval <= 0 ) {
		interval = 30;
	}
	profile.interval=interval*60000;
	profile.execute=pexecute.value;
	profile.arguments=parguments.value;
	bg.profiles[id]=profile;
	bg.updateProfile(profile);
	bg.saveProfiles();
	if ( lastProfile===newProfile ){
		clickedProfileItem({target:createProfileItem(profile)});
	}
}
function removeProfile(){
	if ( lastProfile===newProfile ){
		return;
	}
	bg.removeProfile(lastProfile.id);
	var tr=lastProfile.parentNode;
	tr.parentNode.removeChild(tr);
	lastProfile=null;
	clickedProfileItem({target:newProfile});
	bg.saveProfiles();
}
function saveConfigs(){
	var configs=bg.publicConfigs();
	var id=identity.value;
	if (!id||id==""){
		alert("本机标识不能为空！");
		identity.focus();
		return;
	}
	configs.id=id;
	configs.server=server.value;
	configs.interval=interval.value*60000;
	bg.saveConfigs();
}
