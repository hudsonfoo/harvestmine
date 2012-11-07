<?php
$harvestServerUrl = 'https://idealoop.harvestapp.com/account/who_am_i';
$redmineServerUrl = 'http://redmine.davidandgoliath.com';
$redmineApiKey = '0ef9a2dcceccc18e1aa6a0f5b1e4c7f1ae8e2429';
$harvestUserId = 'your@id.com';
$harvestPassword = 'yourP4ssw0rd';

$service['getNews']['url'] = '/projects/%project_id%/news.xml';
$service['getNews']['callType'] = 'GET';
$service['getNews']['requestContentType'] = 'xml';
$service['getNews']['responseContentType'] = 'atom';

$service['getProjects']['url'] = '/projects.xml';
$service['getProjects']['callType'] = 'GET';
$service['getProjects']['requestContentType'] = 'xml';
$service['getProjects']['responseContentType'] = 'atom';

$service['getProject']['url'] = '/projects/%project_id%.xml';
$service['getProject']['callType'] = 'GET';
$service['getProject']['requestContentType'] = 'xml';
$service['getProject']['responseContentType'] = 'atom';

$service['getIssues']['url'] = '/issues.json';
$service['getIssues']['callType'] = 'GET';
$service['getIssues']['requestContentType'] = 'json';
$service['getIssues']['responseContentType'] = 'json';

$service['getIssue']['url'] = '/issues/%issue_id%.json';
$service['getIssue']['callType'] = 'GET';
$service['getIssue']['requestContentType'] = 'json';
$service['getIssue']['responseContentType'] = 'json';

$service['putIssue']['url'] = '/issues/%issue_id%.json';
$service['putIssue']['callType'] = 'PUT';
$service['putIssue']['requestContentType'] = 'json';
$service['putIssue']['responseContentType'] = 'json';
$service['putIssue']['data'] = isset($_GET['data']) ? $_GET['data'] : null;

if (!isset($_GET['serviceOptions'])) { $_GET['serviceOptions'] = array(); }
if (!isset($_GET['serviceExtras'])) { $_GET['serviceExtras'] = array(); }

$url_variables = array(
    'project_id' => (isset($_GET['project_id']) ? $_GET['project_id'] : null),
    'issue_id' => (isset($_GET['issue_id']) ? $_GET['issue_id'] : null)
);

if (!isset($_GET['serviceOwner']) || (isset($_GET['serviceOwner']) && $_GET['serviceOwner'] != 'redmine' && $_GET['serviceOwner'] != 'harvest') ) {
    $_GET['serviceOwner'] = 'redmine';
}

if (isset($_GET['serviceOwner']) && $_GET['serviceOwner'] == 'redmine') {
    redmineApiConnect($service[$_GET['serviceName']], $_GET['serviceOptions'], $_GET['serviceExtras']);
} else {
    harvestApiConnect(null, $harvestUserId, $harvestPassword);
}

function harvestApiConnect($service = '', $username = '', $password = '') {
    global $harvestServerUrl;

    $headers = array(
        getContentType('json'),
        'Accept: application/xml',
        'Authorization: Basic ' . base64_encode($username . ':' . $password)
    );

    $handle = curl_init();

    $url = $harvestServerUrl;

    curl_setopt($handle, CURLOPT_URL, $url);
    curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);

    switch($service['callType']) {
        case 'POST':
            curl_setopt($handle, CURLOPT_POST, true);
            curl_setopt($handle, CURLOPT_POSTFIELDS, $service['data']);
            break;

        case 'PUT':
            curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($handle, CURLOPT_POSTFIELDS, $service['data']);
            break;

        case 'DELETE':
            curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'DELETE');
            break;
    }

    $response = curl_exec($handle);
    $code = curl_getinfo($handle, CURLINFO_HTTP_CODE);

    header(getContentType('xml'));
    echo $response;
}

function redmineApiConnect(array $service, array $options = array(), array $url_variables = array()) {
    global $redmineServerUrl;
    global $redmineApiKey;

    foreach($url_variables as $key => $replacement) {
        $service['url'] = str_replace('%' . $key . '%', $replacement, $service['url']);
    }

    $headers = array(getContentType($service['requestContentType']));
    $handle = curl_init();

    $url = $redmineServerUrl . $service['url'] . '?' . http_build_query($options + array('key' => $redmineApiKey));

    curl_setopt($handle, CURLOPT_URL, $url);
    curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);

    switch($service['callType']) {
        case 'POST':
            curl_setopt($handle, CURLOPT_POST, true);
            curl_setopt($handle, CURLOPT_POSTFIELDS, $service['data']);
            break;

        case 'PUT':
            curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($handle, CURLOPT_POSTFIELDS, $service['data']);
            break;

        case 'DELETE':
            curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'DELETE');
            break;
    }

    $response = curl_exec($handle);
    $code = curl_getinfo($handle, CURLINFO_HTTP_CODE);

    header(getContentType($service['responseContentType']));
    echo $response;
}

function getContentType($type) {
    switch ($type) {
        case 'atom':
            return 'Content-type: application/atom+xml';
            break;

        case 'json':
            return 'Content-type: application/json';
            break;

        case 'css':
            return 'Content-type: text/css';
            break;

        case 'javascript':
            return 'Content-type: text/javascript';
            break;

        case 'rss':
            return 'Content-Type: application/rss+xml; charset=ISO-8859-1';
            break;

        case 'xml':
            return 'Content-type: text/xml';
            break;
    }
}
?>
