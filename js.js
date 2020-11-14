
function getList() {
	var target = document.getElementById('content');
	if (target)	target.classList.add('loading');
	fetch('api.php?action=get')
		.then(function(data) {
			console.log(data);
			data.text().then(res => target.innerHTML = res);
			
			/*
			data.json().then(res => {
				news = [];
				for (var i in res) {
					news.push(res[i]);
				}
				appNews.active = 0;

				if (target)	target.classList.remove('loading');
			});
			*/
		})
		.catch(error => console.log('Error:' + error));
}


function read(id) {
	executeAction(id, "archive");
}


function remove(id) {
	if (confirm("Are you sure you want to delete this entry?")) {
		executeAction(id, "delete");
	}
}


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