songList = new Array();
songId = 0;
oldValue = "";
index = -1;   
allRate = new Array();
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
            if($rate == data.rate | $rate == ""|$type=="flac") {                    
                num++;                      
                $($('#songLink')).append($('<div id="url'+$rate+'" class="down clearfix"><span>地址 '+num+'：</span></div>')); 
                $($divID).append($('<span class="autoAdd">' + data.format + '</span>').css('width', '100'));                
                $($divID).append($('<span class="autoAdd">' + data.rate + 'kbps</span>').css('width', '100'));
                $($divID).append($('<span class="autoAdd">' + (data.size / 1024 / 1024).toFixed(2) + 'M</span>').css('width', '100'));
                $($divID).append($('<span class="autoAdd"><a href="' + data.showLink + '" rel="noreferrer" target="_top">' + data.format + '下载</a></span>').css('width', '100'));
                $($divID).append($('<span class="autoAdd"><a href="http://music.baidu.com' + data.lrcLink + '" rel="noreferrer" target="_top">歌词下载</a></span>').css('width', '100'));
                if($('#songInfo').text() == "") {
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
var loadSong=function(i,songId){        
    if(i<allRate.length){
        if(i==allRate.length-1){
            loadLink(songId,'flac','flac','#urlflac');          
        }
        else {loadLink(songId,'mp3',allRate[i],'#url'+allRate[i]);}
        i++;
        var x=function(){
            loadSong(i,songId);
        }
        setTimeout(x,100);
    }
}

var list = function(key){
    song_list = new Array();
    if(typeof(key)!="undefined"&&key != ""){
        key = key.replace(/\s+/g,'%20');
        $.ajax({                
            url:"http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.search.suggestion&format=json&from=ios&version=2.1.1&query="+key,   
            dataType: "jsonp",
            type:"get",
            success:function(data){
                songList.length = 0;
                song_list = String(data.suggestion_list).split(",");                    
                songList = song_list.length>10?song_list.splice(0,10):song_list;                        
            }
        });
    }else{
        $.ajax({                    
            url:"http://tingapi.ting.baidu.com/v1/restserver/ting?from=qianqian&version=2.1.0&method=baidu.ting.billboard.billList&format=json&type=2&offset=0&size=10",    
            type:"get",                 
            dataType: "jsonp",
            success:function(data){     
                var n = 0;
                str = JSON.stringify(data);             
                var reg=new RegExp('song_id',"gi");
                count = str.match(reg).length;
                count = count > 10?10:count; 
                for(var i=0; i<count; i++){
                    song_list[n++] = data.song_list[i]['title'] + "&nbsp&nbsp&nbsp&nbsp&nbsp" + data.song_list[i]['author'];
                }               
                songList.length = 0;
                songList = song_list;                       
            }
        });     
    }
}
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
function AutoComplete(au, search, mylist) {
    if ($("#" + search).val() != oldValue || oldValue == "") {
        var autoNode = $("#" + au); 
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
            autoNode.empty();  
            for (i in carlist) {
                var wordNode = carlist[i];   
                var newDivNode = $("<div>").attr("id", i);  
                newDivNode.attr("style", "font:15px/20px Arial,Helvetica,sans-serif;height:20px;padding:0 8px;cursor: pointer;");
                newDivNode.html(wordNode).appendTo(autoNode); 
                newDivNode.mouseover(function () {
                    if (index != -1) { 
                        autoNode.children("div").eq(index).css("background-color", "white");
                    }
                    index = $(this).attr("id");
                    $(this).css("background-color", "#ebebeb");
                });
                newDivNode.mouseout(function () {
                    $(this).css("background-color", "white");
                });

                newDivNode.click(function () {                      
                    var comText = autoNode.children("div").eq(index).text();
                    index = -1;
                    $("#" + search).val(comText);      
                    $('#result').hide();                  
                    getSongId(comText);
                });
                if (carlist.length > 0) {   
                        autoNode.show();
                } else {
                        autoNode.hide();
                        index = -1;
                }
            }
        }        
        document.onclick = function (e) {
            var e = e ? e : window.event;
            var tar = e.srcElement || e.target;
            if (tar.id != search) {
                if ($("#" + au).is(":visible")) {
                    $("#" + au).css("display", "none");
                }
            }
        }            
}
function getSongId(key){
    if(typeof(key)!="undefined"&&key != ""){
        key = key.replace(/\s+/g,'%20');
        var url = "http://tingapi.ting.baidu.com/v1/restserver/ting?from=qianqian&version=2.1.0&method=baidu.ting.search.common&format=json&page_no=1&page_size=1&query="+key;          
        $.ajax({
            type: "get",        
            url: url,
            dataType: "jsonp",              
            success:function(data){             
                str = JSON.stringify(data);     
                var reg=new RegExp('song_id',"gi");
                count = str.match(reg).length;
                songId = count>0?data.song_list[0]['song_id']:0;
                allRate.length = 0;             
                allRate = String(data.song_list[0]['all_rate']).split(",");
            }
        });     
    }
}
function removeAllChild(){
    var div = document.getElementById("songLink");
    while(div.hasChildNodes()){
        div.removeChild(div.firstChild);
    }
}
function load(){ 
    var is_login = $.cookie("login");
    if(typeof(is_login)!="undefined" && is_login =="1"){
        $(".pass").css("display", "none");
        $("#submit").removeAttr("disabled");
        $("#title").removeAttr("disabled");
        $("#submit").css("cursor", "pointer");    
    }else{
        $("#submit").attr("disabled", "disabled");
        $("#submit").css("cursor", "default");
        $("#title").attr("disabled", "disabled");             
    }

}
function approve(){
    var data = new Date();
    var year= String(data.getFullYear());
    var month = data.getMonth()+1;
    var day = data.getDate();
    month = month<10?"0"+month:month;
    day = day<10?"0"+day:day;
    var date = year+month+day;
    var password = $("#password").val();

    if(typeof(password)!="undefined" && password!=""){        
        if(password == "xyw"+date){
            $.cookie("login","1", {path:"/", expires:1 });
            load();                      
        }else{
            alert("不知道密码?! 呵呵呵...");
            $("#password").val('');          
        }
    }else alert("不输入密码就想访问啊，呵呵呵...");
}
$(document).ready(function() {  
    document.oncontextmenu=new Function("event.returnValue=false;"); 
    document.onselectstart=new Function("event.returnValue=false;");
    $.cookie("login",null,{ path: '/' }); 
    load();  
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
        if(typeof($song_name) != "undefined" && $song_name !=""){   
            removeAllChild();       
            getSongId($song_name);      
            if(songId == "0")
                alert("暂时没有获取到歌曲信息!");
            else{
                $('#result').show();
                $('.autoAdd').remove();
                loadSong(0,songId);                
            }           
        }else{
            alert('输入点东西嘛！');
        }           
    });
    
    $('#title').click(function(){
        $(this).select();
    });
});