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
	(refresh=document.getElementById("refresh")).addEventListener("click",refreshPublic,false);
	loading = document.getElementById("loading");
	tag = document.getElementById("tag");
	(options=document.getElementById("options")).addEventListener("click",openOptions,false);
	(about=document.getElementById("about")).addEventListener("click",openAbout,false);

  	document.body.onselectstart=function(){
  		return bcopy;
  	}

	bg = chrome.extension.getBackgroundPage();

	createProfiles();

	if ( bg.publicValid() ) {
		updatePublics();
	} else {
		setDisabled(refresh);
		loading.style.visibility = "visible";
	}
	
}, false );


function isDisabled( e ) {
	return e&&((e.disabled)||(e.classList&&e.classList.contains("disabled")));
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

/**
 * 更新页面本机公网信息 
 */
function updatePublics(){
	id.innerText = bg.publicIdentity();
	ip.innerText = bg.publicIp();
	ts.innerText = bg.publicTs();
	refresh.style.visibility = "visible";
	loading.style.visibility = "hidden";
	unsetDisabled( refresh );
}
/**
 * 创建终端列表
 */
function createProfiles(){
	var profiles=bg.publicProfiles();
	for ( var i in profiles ) {
		createProfile(profiles[i]);
	}
}
/**
 * 创建终端列表项 
 */
function createProfile(p) {
	var pe = document.createElement("div");
	pe.id = "profile-"+p.id;
	pe.innerHTML = '<div class="separator"></div><div class="ptitle"></div><table class="pinf"><tbody><tr><td class="title">IP：</td><td><span id="pip" class="copy" title="点击拷贝到剪贴板"></span></td><td class="refresh refreshbg"><div class="loading" style="visibility:hidden"></div></td></tr></tbody></table><div class="button">打　开</div>';
	pe.querySelector(".ptitle").innerText=p.name;
	var pip=pe.querySelector("#pip");
	pip.innerText=p.ip;
	pip.addEventListener("click",doCopy,false);
	var prefresh=pe.querySelector(".refresh");
	if ( prefresh ) {
		prefresh.pprofile=p;
		prefresh.addEventListener("click",refreshProfile,false);
	}
	var paction=pe.querySelector(".button");
	paction.pprofile = p;
	if (!p.execute||p.execute==""){
		paction.style.display="none";
	} else {
		paction.addEventListener("click",actionProfile,false);
	}
	document.body.insertBefore( pe, tag );
}
/**
 * 更新页面终端公网信息 
 */
function updateProfile(p) {
	var pe = document.getElementById("profile-"+p.id);
	if ( !pe ){
		return;
	}
	var pip=pe.querySelector("#pip");
	pip.innerText=p.ip;
	var prefresh=pe.querySelector(".refresh");
	unsetDisabled(prefresh);
	prefresh.className = "refresh refreshbg";
	prefresh.querySelector(".loading").style.visibility = "hidden";
}

/**
 * 拷贝DOM元素的数据
 * @param {DOMEvent} e
 */
function doCopy( e ){
	var p = e.currentTarget;
	p.contentEditable = true;
	p.focus();
	bcopy=true;
	document.execCommand( "SelectAll" );
	document.execCommand( "Copy", false, null );
	bcopy=false;
	p.contentEditable = false;
	p.blur();
}

/**
 * 从服务器更新本机信息 
 */
function refreshPublic(){
	if ( isDisabled(refresh) ) {
		return;
	}
	refresh.style.visibility = "hidden";
	loading.style.visibility = "visible";
	setDisabled( refresh );
	bg.publicReset();
	bg.updateIp();
}

/**
 * 从服务器更新终端信息
 * @param {DOMEvent} e
 */
function refreshProfile( e ) {
	var pe = e.currentTarget;
	if ( isDisabled(pe) ) {
		return;
	}
	setDisabled( pe );
	pe.className = "refresh";
	pe.querySelector(".loading").style.visibility = "visible";
	bg.resetProfile( pe.pprofile );
	bg.updateProfile( pe.pprofile );
}
/**
 * 执行终端配置的操作为
 * @param {DOMEvent} e
 */
function actionProfile( e ){
	var pe = e.currentTarget;
	if ( isDisabled(pe) ) {
		return;
	}
	setDisabled( pe );
	bg.actionProfile(pe.pprofile);
	unsetDisabled( pe );
}

/**
 * 打开配置页面 
 */
function openOptions(){
	window.close();
	bg.openOptions();
}

/**
 * 打开关于页面 
 */
function openAbout(){
	window.close();
	//TODO
}
