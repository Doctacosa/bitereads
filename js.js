
//Get the list of saved pages
function getList() {
	var target = document.getElementById('content');
	if (target)	target.classList.add('loading');
	fetch('api.php?action=get')
		.then(function(data) {
			data.json().then(res => {

				if (res.result == 'must_login') {
					target.innerHTML = '<a href="api.php?action=auth">Please login</a>';
				} else {
					articles = '';
					for (var i in res) {
						var article = res[i];
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
					target.innerHTML = articles;
				}

				if (target)	target.classList.remove('loading');
			});
		})
		.catch(error => console.log('Error:' + error));
}


//Mark an item as read
function read(id) {
	executeAction(id, "archive");
}


//Delete an item directly
function remove(id) {
	if (confirm("Are you sure you want to delete this entry?")) {
		executeAction(id, "delete");
	}
}


//Execute an action
function executeAction(id, action) {
	fetch('api.php?action=' + action + '&id=' + id)
		.then(function(data) {
			data.json().then(res => {
				document.getElementById("item_" + id).remove();
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
				if (target)	target.classList.remove('loading');
			});
		})
		.catch(error => console.log('Error:' + error));
}
