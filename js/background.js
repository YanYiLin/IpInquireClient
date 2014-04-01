/**
Authors: yanyilin(elen_rl@163.com)
*/
/**
 * zeroize value with length(default is 2).
 * @param {Object} v
 * @param {Number} l
 * @return {String} 
 */
function ultZeroize(v,l){
	var z = "";
	l = l||2;
	v = String(v);
	for ( var i=0; i < l-v.length; i++ ) {
		z += "0";
	}
	return z+v;
}
/**
 * Format Data object to string(YYYY-MM-DD HH:MM:SS).
 * @param {Date} d
  */
function ultDatestring(d){
	var d = d||(new Date());
	return d.getFullYear()+"-"+ultZeroize(d.getMonth()+1)+"-"+ultZeroize(d.getDate())+" "+ultZeroize(d.getHours())+":"+ultZeroize(d.getMinutes())+":"+ultZeroize(d.getSeconds());
}
/**
 * Generate number with range [100000-999999]
 */
function ultRandomId(){
	return Math.ceil(Math.random()*99999+100000);
}

/**
 * JSON for configs
 * {server:"",id:"",interval:x*60000,ip:"",ts:""}
 */
var configs={
	"server":"https://ip-eruy.rhcloud.com/",
	"id":ultRandomId(),
	"interval":30*60000,
	"ip":"",
	"ts":null,
	"t":null
};
/**
 * JSON for profiles
 * key->id,value->profile(JSON)
 * profile={name:"",id:"",interval:1000,execute:"",arguments:"",ip:"",ts:"",t:"",valid:""}
 */
var profiles={};
//profiles["elen"]={name:"Elen",id:"elen",interval:30*60000,ip:"",execute:"test",valid:false};
function loadConfigs(){
	// load configs
	var dconfigs=localStorage["configs"];
	if (dconfigs) {
		configs=JSON.parse(dconfigs);
		configs.t=null;
	} else {
		saveConfigs();
	}
}
function saveConfigs(){
	localStorage["configs"]=JSON.stringify(configs);
	updateIp();
}
function loadProfiles(){
	var dprofiles=localStorage["profiles"];
	if (dprofiles){
		profiles=JSON.parse(dprofiles);
		for(var i in profiles){
			profiles[i].t=null;
		}
	}
}
function saveProfiles(){
	localStorage["profiles"]=JSON.stringify(profiles);
}


document.addEventListener( "DOMContentLoaded", function(){
	loadConfigs();
	loadProfiles();
	updateIp();
	updateProfiles();
}, false );


function updateIp(){
	if ( configs.t ) {
		clearTimeout(configs.t);
		configs.t=null;
	}
	var url = configs.server+"?id="+configs.id;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		switch( xhr.readyState ) {
			case 4:
				if ( xhr.status == 200 ) {
					configs.ip = xhr.responseText;
				} else {
					configs.ip = "Failed:"+xhr.status;
				}
				configs.ts = ultDatestring();
				notifyPopup();
			break;
			default:
			break;
		}
	}
	xhr.open( "GET", url );
	xhr.send();
	configs.t=setTimeout( updateIp, configs.interval );
}
function publicValid(){
	return (configs.ts!==null)?true:false;
}
function publicReset(){
	configs.ip=null;
	configs.ts=null;
}
function publicIdentity(){
	return configs.id;
}
function publicIp(){
	return configs.ip;
}
function publicTs(){
	if ( !configs.ts ) {
		return "Invalid";
	}
	return configs.ts;
}
function notifyPopup(p){
	var pops = chrome.extension.getViews({type:"popup"});
	for ( var i in pops ) {
		p?pops[i].updateProfile(p):pops[i].updatePublics();
	}
}
function publicConfigs(){
	return configs;
}

function publicProfiles(){
	return profiles;
}
function updateProfile( p ){
	if (p.t){
		clearTimeout(p.t);
		p.t=null;
	}
	var url = configs.server+"?q="+p.id;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		switch( xhr.readyState ) {
			case 4:
				if ( xhr.status == 200 ) {
					p.ip = xhr.responseText;
					p.valid = true;
				} else {
					p.ip = "Failed:"+xhr.status;
					p.valid = false;
				}
				p.ts = ultDatestring();
				notifyPopup( p );
			break;
			default:
			break;
		}
	}
	xhr.open( "GET", url );
	xhr.send();
	p.t=setTimeout( function(){
		updateProfile(p);
	}, p.interval );
}
function updateProfiles(){
	for ( var i in profiles ) {
		updateProfile( profiles[i] );
	}
}
function removeProfile(id){
	var p=profiles[id];
	if ( p ){
		clearTimeout(p.t);
		delete profiles[id];
	}
}
function resetProfile( p ){
	p.ip=null;
	p.ts=null;
}
function actionProfile( p ){
	var exec=p.execute,args=p.arguments;
	if ( 0==exec.indexOf("http://") || 0==exec.indexOf("https://") ) {
		chrome.tabs.getSelected( null, function (tab) { // open a new tab next to currently selected tab
			chrome.tabs.create( {url:exec,index:tab.index+1} );
		} );
	}
}


function openOptions(){
	var url = "options.html";
	var fullUrl = chrome.extension.getURL(url);
	chrome.tabs.getAllInWindow( null, function(tabs){
		for ( var i in tabs ) { // check if Options page is open already
			if ( tabs.hasOwnProperty(i) ) {
				var tab = tabs[i];
				if ( tab.url == fullUrl ) {
					chrome.tabs.update( tab.id, {selected:true}); // select the tab
					return;
				}
			}
		}
		chrome.tabs.getSelected( null, function (tab) { // open a new tab next to currently selected tab
			chrome.tabs.create( {url:url,index:tab.index+1} );
		} );
	} );
}
