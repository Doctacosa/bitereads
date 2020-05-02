<?php
include_once 'config.inc.php';
include_once 'pocket.inc.php';

$pocket = new Pocket($consumer_key);


//Execute AJAX calls and exit right away
if (isset($_GET['action'])) {
	if ($_GET['action'] == 'archive' || $_GET['action'] == 'delete') {
		echo $pocket->executeAction($_GET['id'], $_GET['action']);
		die();
	}
}


?><!DOCTYPE html>
<html>
<head>
	<title>Pocket^2</title>

	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

	<style>
		@import "//www.interordi.com/files/css/normalize.css";
		@import "//www.interordi.com/files/css/base.css";
		@import "style.css";
	</style>

	<script src="js.js"></script>
</head>

<body>

<div id="header">
	<h1>Pocket^2</h1>
	<span><?=$pocket->getUsername()?></span>
	<img src="images/glyphicons-basic-86-reload.svg" alt="Reload" onclick="window.location.reload()" class="button" />
</div>

<?php
if (isset($_GET['action'])) {
	if ($_GET['action'] == 'auth') {
		$result = $pocket->authRequestToken();

		$code = $result['code'];
		$pocket->setRequestToken($code);

		$result = $pocket->authLogin();
		var_dump($result);
		die();

	} elseif ($_GET['action'] == 'login_return') {
		$result = $pocket->authAccessToken();

		if (empty($result['access_token']) || empty($result['username'])) {
			die('Auth failed, <a href="?action=auth">try again</a>.');
		}

		$pocket->setAccessToken($result['access_token']);
		$pocket->setUsername($result['username']);

		echo '<script>
			window.location = ".";
		</script>';
		die();
	}
}


$get_raw = $pocket->get();
$full_data = json_decode($get_raw, true);
if ($full_data == null) {
	echo '<script>
		window.location = "?action=auth";
	</script>';
	die();
}

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
		$image = 'background-image: url(\''.$image_data['src'].'\')';
	}

	$details = [];
	$details[] = str_replace('www.', '', parse_url($item_data['given_url'], PHP_URL_HOST));
	if ($item_data['word_count'] > 0)
		$details[] = $item_data['word_count'].' words';

	echo '<article id="item_'.$item_data['item_id'].'" style="'.$image.'">
		<img src="https://'.parse_url($item_data['given_url'], PHP_URL_HOST).'/favicon.ico" alt="" onerror="this.src=\'images/empty.png\'" class="small" />
		<a href="'.$item_data['given_url'].'" class="url">'.$item_data['resolved_title'].'</a>
		<div class="text">
			'.implode('<br />', $details).'
		</div>
		<div class="actions">
			<a href="javascript:read('.$item_data['item_id'].')"><img src="images/glyphicons-basic-844-square-check.svg" alt="Read" /></a>
			<a href="javascript:remove('.$item_data['item_id'].')"><img src="images/glyphicons-basic-843-square-remove.svg" alt="Delete" /></a>
		</div>
	</article>';
}
