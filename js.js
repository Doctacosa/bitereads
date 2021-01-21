
let pos = 0;

//Get the list of saved pages
function getList() {
	var target = document.getElementById('content');
	if (target)	target.classList.add('loading');
	fetch('api.php?action=get&start_at=' + pos)
		.then(function(data) {
			data.json().then(res => {

				if (res.result == 'must_login') {
					window.location = 'about.html';
				} else {
					articles = '';
					for (var i in res) {
						var article = res[i];
						if (article.title.length > 80)
							article.title = article.title.substring(0, 75) + '...';
						else if (article.title.length == 0)
							article.title = '(No title)';
						articles += '' + 
							'<article id="item_' + article.id + '" style="' + article.image + '">' +
							'	<img src="https://www.interordi.com/tools/favicon/get/' + article.domain + '" alt="" onerror="this.src=\'images/empty.png\'" class="small" />' +
							'	<a href="' + article.url + '" class="url">' + article.title + '</a>' +
							'	<div class="text">' +
							'		' + article.details + '' +
							'	</div>' +
							'	<div class="actions">' +
							'		<a href="javascript:read(' + article.id + ')"><img src="images/glyphicons-basic-844-square-check.svg" alt="Read" /></a>' +
							'		<a href="javascript:remove(' + article.id + ')"><img src="images/glyphicons-basic-843-square-remove.svg" alt="Delete" /></a>' +
							'	</div>' +
							'</article>';
					}
					if (pos == 0)
						target.innerHTML = articles;
					else
						target.innerHTML += articles;
					
					localize();
				}

				if (target)	target.classList.remove('loading');
			});
		})
		.catch(error => console.log('Error:' + error));
}


function loadMore() {
	pos += 30;
	getList(pos);
}


//Mark an item as read
function read(id) {
	executeAction(id, "archive");
}


//Delete an item directly
function remove(id) {
	if (confirm(getText("dialog_delete"))) {
		executeAction(id, "delete");
	}
}


//Add a page
function addAction() {
	let url = prompt(getText("dialog_add_url"));
	if (url == null || url == '')
		return;

	var target = document.getElementById('content');
	if (target)	target.classList.add('loading');
	fetch('api.php?action=add&url=' + url)
		.then(function(data) {
			data.json().then(res => {
				//FIXME: Insert the item directly instead of refreshing
				getList();
			});
		})
		.catch(error => {
			console.log('Error:' + error)
		});
}


//Execute an action
function executeAction(id, action) {
	var target = document.getElementById("item_" + id);
	if (target)	target.classList.add('loading');
	fetch('api.php?action=' + action + '&id=' + id)
		.then(function(data) {
			data.json().then(res => {
				target.remove();

				if (target)	target.classList.remove('loading');
			});
		})
		.catch(error => {
			console.log('Error:' + error)
		});
}


//Login
function login() {
	window.location = 'api.php?action=auth';
}


//Logout
function logout() {
	var target = document.getElementById('content');
	if (target)	target.classList.add('loading');
	fetch('api.php?action=logout')
		.then(function(data) {
			data.json().then(res => {
				location.reload();
				if (target)	target.classList.remove('loading');
			});
		})
		.catch(error => console.log('Error:' + error));
}


//Offer the user an action to do
function getAboutActions() {
	let action = '';
	if (getCookie('pocket_access_token') != '')
		action = '<a href="." class="main_action"><img src="images/glyphicons-basic-431-log-in.svg" /> <span class="loc">about_view_notes</span></a>';
	else
		action = '<a href="api.php?action=auth" class="main_action"><img src="images/glyphicons-basic-431-log-in.svg" /> <span class="loc">about_login_pocket</span></a>';

	action += '<a href="javascript:install()" class="main_action not_installed"><img src="images/glyphicons-basic-302-square-download.svg" /> <span class="loc">about_install_app</span></a>';

	document.getElementById('about_action').innerHTML = action;
}


//Display a warning before trying to access external URLs
function confirmExternal(url) {
	if (confirm(getText('dialog_external_url')))
		window.open(url, "_blank");
}


//Detect the user's language and load the text
function setLanguage() {
	//Determine the user's base language
	let lang = navigator.language || navigator.userLanguage;

	//Remove regional variants
	if (lang.indexOf("-") > 0)
		lang = lang.substring(0, lang.indexOf("-"));
	
	//Fallback to English if match not found
	if (lang.length == 0 || lang == "undefined")
		lang = "en";
	if (lang != "fr")
		lang = "en";
	
	//Load the texts file
	fetch("text/" + lang + ".json")
		.then(function(data) {
			data.json().then(res => {
				texts = res;
				localize();
			});
		});
}

//Localize all the text that needs it
function localize() {
	document.querySelectorAll(".loc").forEach(function(elem) {
		elem.innerHTML = getText(elem.innerHTML);
		elem.classList.remove("loc");
	});
}

function getText(id) {
	if (typeof texts == "undefined")
		texts = {};

	let text = "";
	if (typeof texts[id] != "undefined")
		text = texts[id];
	else
		text = "|" + id + "|";
		
	return text;
}



/*** Common ***/

//Set a cookie
function getCookie(cookieName) {
	let name = cookieName + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}


//Get a cookie
function setCookie(cookieName, cookieName, expirationDays) {
	let d = new Date();
	d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cookieName + "=" + cookieName + ";" + expires + ";path=/";
}


//Overlay an image
function viewImage(file) {
	var target = document.getElementById('image_viewer');
	target.querySelector('img').src = file;
	target.style.left = '0px';
	target.style.top = '0px';
	target.style.width = '100%';
	target.style.height = '100%';
}

function closeImage() {
	var target = document.getElementById('image_viewer');
	target.style.left = '50%';
	target.style.top = '50%';
	target.style.width = '0%';
	target.style.height = '0%';
}
