<?php

	$headers = array(
		'Accept: application/json',
		$contentType,
	);

	$handle = curl_init();
	curl_setopt($handle, CURLOPT_URL, $_GET['url']);
	curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);

	switch($_GET['method']) {
		case 'GET':
		break;

		case 'POST':
		curl_setopt($handle, CURLOPT_POST, true);
		curl_setopt($handle, CURLOPT_POSTFIELDS, $_GET['data']);
		break;

		case 'PUT':
		curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'PUT');
		curl_setopt($handle, CURLOPT_POSTFIELDS, $_GET['data']);
		break;

		case 'DELETE':
		curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'DELETE');
		break;
	}

	$response = curl_exec($handle);
	$code = curl_getinfo($handle, CURLINFO_HTTP_CODE);

	echo $response;
	
	function getContentType($type) {
		switch ($type) {
			case "atom":
				return 'Content-type: application/atom+xml';
			break;
			
			case "json":
				return 'Content-type: application/json';
			break;
			
			case "css":
				return 'Content-type: text/css';
			break;
			
			case "javascript":
				return 'Content-type: text/javascript';
			break;
			
			case "rss":
				return 'Content-Type: application/rss+xml; charset=ISO-8859-1';
			break;
			
			case "xml":
				return 'Content-type: text/xml';
			break;
			
			default:
				return 'Content-type: text'
			break;
		}
	}
?>