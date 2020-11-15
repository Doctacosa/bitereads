<?php
include_once 'config.inc.php';
include_once 'pocket.inc.php';

$pocket = new Pocket($consumer_key);


if (empty($_GET['action']))
	die();

$action = $_GET['action'];


if ($action == 'archive' || $action == 'delete') {
	echo $pocket->executeAction($_GET['id'], $action);
	die();
}

elseif ($action == 'auth') {
	$result = $pocket->authRequestToken();

	$code = $result['code'];
	$pocket->setRequestToken($code);

	$result = $pocket->authLogin();
	var_dump($result);
	die();

} elseif ($action == 'login_return') {
	$result = $pocket->authAccessToken();

	if (empty($result['access_token']) || empty($result['username'])) {
		die('Auth failed, <a href="?action=auth">try again</a>.');
	}

	$pocket->setAccessToken($result['access_token']);
	$pocket->setUsername($result['username']);

	echo '<script>
		window.location = "index.html";
	</script>';
	die();

} elseif ($action == 'logout') {
	setcookie('pocket_access_token', '', time() - 1);
	$_SESSION = [];
	session_destroy();
	echo json_encode(['result' => true]);

} else {
	$get_raw = $pocket->get();
	$full_data = json_decode($get_raw, true);
	if ($full_data == null) {
		echo json_encode(['result' => 'must_login']);
		die();
	}

	$articles = [];

	foreach($full_data['list'] as $item_data) {
		//if ($item_data['status'] != 0)
		//	continue;
		$image = '';
		if (!empty($item_data['images'])) {
			if (isset($_GET['debug']))
				var_dump($item_data['images']);

			$image_data = [];
			$max_size = 0;
			//Find the largest (best?) image
			foreach($item_data['images'] as $image_loop) {
				if ($image_loop['width'] * $image_loop['height'] > $max_size) {
					$image_data = $image_loop;
					$max_size = $image_loop['width'] * $image_loop['height'];
				}
			}
			//Nothing found using sizes, fallback to the first one
			if (empty($image_data))
				$image_data = array_slice($item_data['images'], 0, 1)[0];
			//Require HTTPS
			if (substr($image_data['src'], 0, 7) == 'http://')
				$image_data['src'] = 'https://'.substr($image_data['src'], 7);
			$image = 'background-image: url(\''.$image_data['src'].'\')';
		}

		$details = [];
		$details[] = str_replace('www.', '', parse_url($item_data['given_url'], PHP_URL_HOST));
		if ($item_data['word_count'] > 0)
			$details[] = $item_data['word_count'].' words';

		$articles[] = [
			'id' => $item_data['item_id'],
			'image' => $image,
			'domain' => parse_url($item_data['given_url'], PHP_URL_HOST),
			'details' => implode('<br />', $details),
			'url' => $item_data['given_url'],
			'title' => $item_data['resolved_title'],
		];
	}

	echo json_encode($articles);
}
