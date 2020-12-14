
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
	// Prevent Chrome 67 and earlier from automatically showing the prompt
	e.preventDefault();
	// Stash the event so it can be triggered later.
	deferredPrompt = e;

	document.getElementById("install").style.display = 'inline';
	document.querySelectorAll('.not_installed').forEach(function(node) {
		node.style.display = 'inline';
	});
});

async function install() {
	if (deferredPrompt) {
		deferredPrompt.prompt();
		console.log("deferredPrompt")
		console.log(deferredPrompt)
		deferredPrompt.userChoice.then(function(choiceResult) {

			if (choiceResult.outcome === 'accepted') {
				console.log('Your PWA has been installed');
			} else {
				console.log('User chose to not install your PWA');
			}

			deferredPrompt = null;

		});
	} else {
		console.log("ERROR: no deferredPrompt to use")
	}
}


//Force a reload of the app
function forceSWupdate() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.getRegistrations().then(function (registrations) {
			for (let registration of registrations) {
				registration.update()
			}
		});
	}
}
