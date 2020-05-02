<?php
session_start();

class Pocket {
	private $path = '';

	private $consumer_key = '';
	private $request_token = '';
	private $access_token = '';
	private $username = '';


	public function __construct($consumer_key) {

		$this->consumer_key = $consumer_key;

		$this->path = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https://' : 'http://';
		$this->path .= $_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']).'/';

		if (!empty($_SESSION['request_token']))
			$this->request_token = $_SESSION['request_token'];
		if (!empty($_SESSION['access_token']))
			$this->access_token = $_SESSION['access_token'];
		if (!empty($_SESSION['username']))
			$this->username = $_SESSION['username'];
	}


	//Get a request token
	public function authRequestToken() {
		$options = [];
		$url = 'https://getpocket.com/v3/oauth/request';
		$options['post'] = [
			'consumer_key' => $this->consumer_key,
			'redirect_uri' => $this->path.'?action=auth_return',
			'state' => '',
		];
		$options['headers'] = [
			'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF8',
			//'Content-Type' => 'application/json; charset=UTF8',
			'X-Accept' => 'application/json',
		];
		return $this->decodeParams($this->getRemotePage($url, $options));
	}


	//Send the user to Pocket's auth page
	public function authLogin() {
		$url = 'https://getpocket.com/auth/authorize?request_token='.$this->request_token.'&redirect_uri='.urlencode($this->path.'?action=login_return');
		header('Location: '.$url);
	}


	//Get an access token for later queries
	public function authAccessToken() {
		$options = [];
		$url = 'https://getpocket.com/v3/oauth/authorize';
		$options['post'] = [
			'consumer_key' => $this->consumer_key,
			'code' => $this->request_token,
		];
		//$options['get_headers'] = true;
		$options['headers'] = [
			'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF8',
			'X-Accept' => 'application/json',
		];
		return $this->decodeParams($this->getRemotePage($url, $options));
	}


	//Get a list of entries
	public function get() {
		$options = [];
		$url = 'https://getpocket.com/v3/get';
		$options['post'] = [
			'consumer_key' => $this->consumer_key,
			'access_token' => $this->access_token,
			'detailType' => 'complete',
			'count' => '30',
		];
		$options['headers'] = [
			'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF8',
			'X-Accept' => 'application/json',
		];
		return $this->getRemotePage($url, $options);
	}


	//Archive an item
	public function archive($id) {
		$this->executeAction($id, 'archive');
	}


	//Delete an item
	public function delete($id) {
		$this->executeAction($id, 'delete');
	}


	//Perform an action on the selected item
	public function executeAction($id, $action) {
		$options = [];
		$url = 'https://getpocket.com/v3/send';
		$options['post'] = [
			'actions' => json_encode([[
				'action' => $action,
				'item_id' => $id,
			]]),
			'access_token' => $this->access_token,
			'consumer_key' => $this->consumer_key,
		];
		return $this->getRemotePage($url, $options);
	}


	//Get a remote web page and return its content
	public function getRemotePage($url, $options = []) {
		$headers = [];

		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		if (isset($options['auth']))
			curl_setopt($ch, CURLOPT_USERPWD, $options['auth']);
		if (isset($options['content_type']))
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: '.$options['content_type']));
		if (isset($options['post'])) {
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $options['post']);
		}
		if (isset($options['headers']))
			curl_setopt($ch, CURLOPT_HTTPHEADER, $options['headers']);
		if (isset($options['get_headers'])) {
			curl_setopt($ch, CURLOPT_HEADERFUNCTION,
				function($curl, $header) use (&$headers) {
					$len = strlen($header);
					$header = explode(':', $header, 2);
					if (count($header) < 2) // ignore invalid headers
						return $len;

					$headers[strtolower(trim($header[0]))][] = trim($header[1]);

					return $len;
				}
			);
		} else
			curl_setopt($ch, CURLOPT_HEADER, false);
		$data = curl_exec($ch);
		$error = curl_error($ch);
		curl_close($ch);
		
		if (isset($options['get_headers']))
			return [$data, $headers];
		else
			return $data;
	}


	//Turn the parameters of a page's URL into an array
	public function decodeParams($url) {
		$params = explode('&', $url);
		$result = [];
		
		foreach($params as $value) {
			$value = explode('=', $value);
			if (count($value) != 2)
				continue;
			$result[$value[0]] = $value[1];
		}
		return $result;
	}


	//Basic getters / setters
	public function setRequestToken($token) {
		$this->request_token = $token;
		$_SESSION['request_token'] = $token;
	}

	public function setAccessToken($token) {
		$this->access_token = $token;
		$_SESSION['access_token'] = $token;
	}

	public function setUsername($value) {
		$this->username = $value;
		$_SESSION['username'] = $username;
	}

	public function getUsername() {
		return $this->username;
	}
}