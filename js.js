
function read(id) {
	executeAction(id, "archive");
}


function remove(id) {
	if (confirm("Are you sure you want to delete this entry?")) {
		executeAction(id, "delete");
	}
}


function executeAction(id, action) {
	fetch('?action=' + action + '&id=' + id)
		.then(function(data) {
			data.json().then(res => {
				document.getElementById("item_" + id).remove();
			});
		})
		.catch(error => {
			console.log('Error:' + error)
		});
}