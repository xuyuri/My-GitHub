//js url编码 
//http://www.cnblogs.com/neru/archive/2010/07/10/1774718.html
//http://elicecn.blog.163.com/blog/static/174017473200952911340769/
//js定义全局变量 http://blog.csdn.net/yboker/article/details/8171195
songList = new Array();
songId = 0;
oldValue = "";
index = -1;   //高亮
//MP3常见码率参考：http://www.360doc.com/content/10/1113/16/2353239_69039968.shtml
allRate = new Array("32","40","48","64","80","96","112","128","160","192","224","256","320","flac");
num = 0;
var loadLink=function($songId,$type,$rate,$divID){
var timestamp = (new Date()).valueOf();
if($type=="flac"){
	var url="http://music.baidu.com/data/music/fmlink?songIds="+$songId+"&type="+$type+"&callback=jsonplink"+timestamp;
	var $xrate = '';
}else{
	var url="http://music.baidu.com/data/music/fmlink?songIds="+$songId+"&type="+$type+"&rate="+$rate+"&callback=jsonplink"+timestamp;
	var $xrate = '['+$rate+'kbps]';
}
$.ajax({
	type: "get",
	url: url,
	dataType: "jsonp",
	jsonp: "callback",
	jsonpCallback: "jsonplink" + timestamp,
	success: function(json) {
		var data = json.data.songList[0];
		if(data.showLink != "") {			
			if($rate == data.rate | $rate == ''|$type=='flac') {					
				num++;						
				$($('#songLink')).append($('<div id="url'+$rate+'" class="down clearfix"><span>地址 '+num+'：</span></div>'));	
				$($divID).append($('<span class="autoAdd">' + data.format + '</span>').css('width', '60'));				
				$($divID).append($('<span class="autoAdd">' + data.rate + 'kbps</span>').css('width', '80'));
				$($divID).append($('<span class="autoAdd">' + (data.size / 1024 / 1024).toFixed(2) + 'M</span>').css('width', '80'));
				$($divID).append($('<span class="autoAdd"><a href="' + data.showLink + '" rel="noreferrer" target="_top">' + data.format + '下载</a></span>').css('width', '100'));
				$($divID).append($('<span class="autoAdd"><a href="http://music.baidu.com' + data.lrcLink + '" rel="noreferrer" target="_top">歌词下载</a></span>').css('width', '100'));
				if($('#songInfo').text() == '') {
					$('#songInfo').append($('<span id="name" class="autoAdd">' + data.songName + '</span><span id="art" class="autoAdd"> - ' + data.artistName + '</span>'));
				}
			} else{
				$($divID).append($('<span class="autoAdd">暂时没有获取到'+$type+$xrate+'的资源，您可以尝试重新提交。</span>').css('width', '400'))
			}
		} else {			
			$($divID).append($('<span class="autoAdd">暂时没有获取到'+$type+$xrate+'的资源，您可以尝试重新提交。</span>').css('width', '400'))
		}
	},
	error: function() {
		loadLink($songId,$type,$rate,$divID);
	}
});
}
//加载歌曲的下载链接
var loadSong=function(i,songId){		
	if(i<allRate.length){
		if(i==allRate.length-1){
			loadLink(songId,'flac','flac','#urlflac');			
		}
		else loadLink(songId,'mp3',allRate[i],'#url'+allRate[i]);
		i++;
		var x=function(){
			loadSong(i,songId);
		}
		setTimeout(x,100);	//周期性执行函数x
	}
}
//搜索建议列表
var list = function(key){
	song_list = new Array();	//歌曲+作者列表
	//typeof()判断对象是否存在
	if(typeof(key)!="undefined"&&key != ''){
		//替换空格 参考：http://www.oschina.net/question/135959_27712
		key = key.replace(/\s+/g,'%20');	//%20代表空格，是序列化后的结果
		$.ajax({				
			url:"http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.search.suggestion&format=json&from=ios&version=2.1.1&query="+key,	
			dataType: "jsonp",
			type:"get",
			success:function(data){
				//String 强制类型转换;
				//split函数：字符分割函数，返回一个数组
				//alert(data.suggestion_list);
				songList.length = 0;	//清空数组，参见：http://wangjingyi.iteye.com/blog/1478145
				song_list = String(data.suggestion_list).split(",");					
				songList = song_list.length>10?song_list.splice(0,10):song_list;	//最多显示10个建议歌名								
			}
		});
	}else{
		//
		//文档里有写，用jsonp实现跨域，只能使用异步提交，无论你是否设置async，原文链接：
		//http://api.jquery.com/jQuery.ajax/
		//原文：
		//Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation. 
		//
		$.ajax({					
			url:"http://tingapi.ting.baidu.com/v1/restserver/ting?from=qianqian&version=2.1.0&method=baidu.ting.billboard.billList&format=json&type=2&offset=0&size=10",	
			type:"get",			        
			dataType: "jsonp",
			success:function(data){		
				var n = 0;
				//Json转换为字符串，参考：http://www.css88.com/archives/3919
				str = JSON.stringify(data);
				//在data中查找song_id的个数，使用正则
				var reg=new RegExp('song_id',"gi");
				count = str.match(reg).length;
				count = count > 10?10:count; //最多显示10个建议歌名
				for(var i=0; i<count; i++){
					song_list[n++] = data.song_list[i]['title'] + "&nbsp&nbsp&nbsp&nbsp&nbsp" + data.song_list[i]['author'];
				}				
				songList.length = 0;
				songList = song_list;						
			}
		});		
	}
}
//监听输入框变化 参考：http://www.jb51.net/article/27684.htm
function immediately(){
	var element = document.getElementById("title");
	if("\v"=="v") {
		element.onpropertychange = webChange;
	}else{
		element.addEventListener("input",webChange,false);
	}
	function webChange(){
		if(element.value){
			list(element.value);
			getSongId(element.value);						
		};
	}
}
immediately();
 //自动完成
function AutoComplete(au, search, mylist) {
    if ($("#" + search).val() != oldValue || oldValue == "") {
    	var autoNode = $("#" + au);   //缓存对象（弹出框）
        var carlist = new Array();
        var n = 0;
        oldValue = $("#" + search).val();

        for (i in mylist) {
            if (mylist[i].indexOf(oldValue) >= 0) {
                carlist[n++] = mylist[i];
               }
            }
            if (carlist.length == 0) {
                autoNode.hide();
                return;
            }
            autoNode.empty();  //清空上次的记录
            for (i in carlist) {
                var wordNode = carlist[i];   //弹出框里的每一条内容
                var newDivNode = $("<div>").attr("id", i);    //设置每个节点的id值
                newDivNode.attr("style", "font:13px/20px arial;height:20px;padding:0 8px;cursor: pointer;");
                newDivNode.html(wordNode).appendTo(autoNode);  //将newDivNode的值设置为wordNode，并追加到弹出框

                //鼠标移入高亮，移开不高亮
                newDivNode.mouseover(function () {
                    if (index != -1) {        //原来高亮的节点要取消高亮（是-1就不需要了）
                        autoNode.children("div").eq(index).css("background-color", "white");
                    }
                    //记录新的高亮节点索引
                    index = $(this).attr("id");
                    $(this).css("background-color", "#ebebeb");
                });
                newDivNode.mouseout(function () {
                    $(this).css("background-color", "white");
                });

                //鼠标点击文字上屏
                newDivNode.click(function () {
                    //取出高亮节点的文本内容                        
                    var comText = autoNode.children("div").eq(index).text();
                    index = -1;
                    //文本框中的内容变成高亮节点的内容
                    $("#" + search).val(comText);                        
                    getSongId(comText);
                })
                if (carlist.length > 0) {    //如果返回值有内容就显示出来
                        autoNode.show();
                } else {               //服务器端无内容返回 那么隐藏弹出框
                        autoNode.hide();
                        //弹出框隐藏的同时，高亮节点索引值也变成-1
                        index = -1;
                }
            }
        }        
        //点击页面隐藏自动补全提示框
        //当点击页面时执行function方法
        document.onclick = function (e) {
            var e = e ? e : window.event;
            var tar = e.srcElement || e.target;
            if (tar.id != search) {
                if ($("#" + au).is(":visible")) {
                    $("#" + au).css("display", "none")
                }
            }
        }            
}
//获取歌曲id
function getSongId(key){
	if(typeof(key)!="undefined"&&key != ''){
		key = key.replace(/\s+/g,'%20');	//%20代表空格，是序列化后的结果		
		var url = "http://tingapi.ting.baidu.com/v1/restserver/ting?from=qianqian&version=2.1.0&method=baidu.ting.search.common&format=json&page_no=1&page_size=1&query="+key;			
		$.ajax({
			type: "get",		
			url: url,
			dataType: "jsonp",				
			success:function(data){				
				str = JSON.stringify(data);				
				//在data中查找song_id的个数，使用正则
				var reg=new RegExp('song_id',"gi");
				count = str.match(reg).length;
				songId = count>0?data.song_list[0]['song_id']:0;
			}
		});		
	}
}
//js实现删除div下所有子节点 参考：http://blog.csdn.net/moonx/article/details/5925756
function removeAllChild(){
    var div = document.getElementById("songLink");
    while(div.hasChildNodes()){ //当div下还存在子节点时 循环继续
        div.removeChild(div.firstChild);
    }
}
$(document).ready(function() {		
	list();
	getSongId(songList[0]);	
	oldValue = $("#title").val();	
	$("#title").focus(function () {		
		$("#title").val('');	
        if ($("#title").val() == "") {        	
        	list();
            AutoComplete("suggest", "title", songList);
        }         
              
    });

    $("#title").keyup(function () {
    	$('#result').hide();
        AutoComplete("suggest", "title", songList);         
    });

	$('#submit').click(function(){	
		num = 0;
		$song_name=$('#title').val();		
		if(typeof($song_name) != "undefined" && $song_name !=''){	
			removeAllChild();		
			getSongId($song_name);			
			if(songId == '0')
				alert("暂时没有获取到歌曲信息!");
			else{
				$('#result').show();
				$('.autoAdd').remove();
				loadSong(0,songId);
			}			
		}else{
			alert('请输入！');
		}			
	})
	
	$('#title').click(function(){
		$(this).select();
	})
});