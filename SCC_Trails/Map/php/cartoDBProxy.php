<?php
session_cache_limiter('nocache');
$cache_limiter = session_cache_limiter();
function goProxy($dataURL) 
{
	$baseURL = 'https://alamers3.carto.com/api/v2/sql?';
	//  					^ CHANGE THE 'CARTODB-USER-NAME' to your cartoDB url!
	$api = '&api_key=e9355fa25f0aabcb829690292c7190115e2cf427';
	//				 ^ENTER YOUR API KEY HERE!
	$url = $baseURL.'q='.urlencode($dataURL).$api;
	$result = file_get_contents ($url);
	return $result;
}
?>