/**
Authors: yanyilin(elen_rl@163.com)
*/

var bg=null;
var id=null,ip=null,ts=null;
var refresh=null,loading=null,tag=null,options=null,about=null;
var bcopy=false;

document.addEventListener( "DOMContentLoaded", function(){
	(id=document.getElementById("id")).addEventListener("click",doCopy,false);
	(ip=document.getElementById("ip")).addEventListener("click",doCopy,false);
	ts = document.getElementById("ts");
	(refresh=document.getElementById("refresh")).addEventListener("click",doRefresh,false);
	loading = document.getElementById("loading");
	tag = document.getElementById("tag");
	(options=document.getElementById("options")).addEventListener("click",openOptions,false);
	(about=document.getElementById("about")).addEventListener("click",openAbout,false);

  	document.body.onselectstart=function(){
  		return bcopy;
  	}

	bg = chrome.extension.getBackgroundPage();

	updateProfiles();

	if ( bg.publicValid() ) {
		updatePublics();
	} else {
		setDisabled(refresh);
		loading.style.display = "inline-block";
	}
	
}, false );


function isDisabled( e ) {
	return e&&((e.disalbed)||(e.classList&&e.classList.contains("disabled")));
}
function setDisabled( e ) {
	if ( e ) {
		e.disabled = true;
	}
}
function unsetDisabled( e ) {
	if ( e ) {
		e.disabled = false;
		if ( e.classList ) {
			e.classList.remove( "disabled" );
		}
	}
}

function updatePublics(){
	id.innerText = bg.publicIdentity();
	ip.innerText = bg.publicIp();
	ts.innerText = bg.publicTs();
	refresh.style.visibility = "visible";
	loading.style.display = "none";
	unsetDisabled( refresh );
}
function updateProfiles(){
	var profiles=bg.publicProfiles();
	for ( var i in profiles ) {
		createProfile(profiles[i]);
	}
}
function createProfile(p) {
	var pe = document.createElement("div");
	pe.innerHTML = '<div class="separator"></div><div class="ptitle">名称</div><table class="pinf"><tbody><tr><td>标识：</td><td><span id="pid" class="copy"></span></td></tr><tr><td>IP：</td><td><span id="pip" class="copy"></span></td></tr></tbody></table><div id="action" class="button">操　作</div>';
	pe.querySelector(".ptitle").innerText=p.name;
	var pid=pe.querySelector("#pid");
	pid.innerText=p.id;
	pid.addEventListener("click",doCopy,false);
	var pip=pe.querySelector("#pip");
	pip.innerText=p.ip;
	pip.addEventListener("click",doCopy,false);
	var paction=pe.querySelector("#action");
	if (!p.execute||p.execute==""){
		paction.style.display="none";
	}
	document.body.insertBefore( pe, tag );
}

function doCopy( e ){
	var p = e.target;
	p.contentEditable = true;
	p.focus();
	bcopy=true;
	document.execCommand( "SelectAll" );
	document.execCommand( "Copy", false, null );
	bcopy=false;
	p.contentEditable = false;
	p.blur();
}

function doRefresh(){
	if ( isDisabled(refresh) ) {
		return;
	}
	refresh.style.visibility = "hidden";
	loading.style.display = "inline-block";
	setDisabled();
	bg.publicReset();
	bg.updateIp();
}

function openOptions(){
	if ( isDisabled(options) ) {
		return;
	}
	window.close();
	bg.openOptions();
}

function openAbout(){
	if ( isDisabled(about) ) {
		return;
	}
	window.close();
	//TODO
}
