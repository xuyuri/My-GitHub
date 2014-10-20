<?php if(ereg('MSIE',$_SERVER["HTTP_USER_AGENT"]) or ereg('Firefox',$_SERVER["HTTP_USER_AGENT"])) { ?>
<meta http-equiv="refresh" content="0; URL='<?php echo $_GET['url'] ?>'">
<meta charset="UTF-8" />
因IE特性，请自行关闭窗口，同时建议您更换成下列高级的浏览器：<a rel="nofollow" style="padding-left:5px;" href="http://www.google.com/chrome/">Chrome</a><a rel="nofollow" style="padding-left:5px;" href="http://www.mozilla.com/">Firefox</a><a rel="nofollow" style="padding-left:5px;" href="http://www.opera.com/">Opera</a><a rel="nofollow" style="padding-left:5px;" href="http://www.apple.com/safari/">Safari</a>谢谢！
<?php }else{
	header('Location: '.$_GET['url']);
	die();
}
?>