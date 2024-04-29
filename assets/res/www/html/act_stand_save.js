/** Copyright (c) 2018 VertexID RND, Inc.
 * 
 * Application Name : SM활동관리 매대사진등록 [ActStandSaveApp]
 * Description      :
 * Revision History
 * Author          	Date           		Description
 * ------------		-------------		------------------
 * Kim Jin Ho		2018. 08. 06.  		First Draft.
 */
var ActStandSaveApp = function(){
	//세션 사용자정보
	var S_USER_INFO = M.data.storage("USER_INFO");
	//세션 사용자부서정보
	var	S_DEPT_INFO = M.data.storage("DEPT_INFO");

	//팀장권한
	var S_APPAUTH	= S_USER_INFO.APPAUTH;

	//세션 사번
	var S_PERCODE 	= S_USER_INFO.PERCODE;
	var S_PERNAME 	= S_USER_INFO.PERNAME;
	//세션 부서코드
	var S_DEPCODE   = S_DEPT_INFO.DEPCODE;
	//세션 활동일자
	var P_CDATE 	= M.data.param("CDATE");
	// 거래처코드
	var P_CUSCODE   = M.data.param("CUSCODE");
	// 거래처명
	var P_CUSNAME   = M.data.param("CUSNAME");
	var P_CLOSEYN   = M.data.param("CLOSEYN");
	var P_CHN1 = M.data.param("CHN1");

	var param =  {
		 "CHN1":P_CHN1,
	     "CDATE":P_CDATE,
	     "CUSCODE":P_CUSCODE,
	     "CUSNAME":P_CUSNAME,
	     "CLOSEYN":P_CLOSEYN
    };

	var SERVER_URL = CONFIG.URL;
	var IMG_URL = CONFIG.IMG_URL;
	var COMBANG_IMG_URL = CONFIG.COMBANG_IMG_URL;
	//사진 정보 Obj
	var imgInfoList = {
			"01":[],
			"02":[],
			"03":[],
			"04":[],
			"05":[],
	}
	var sellingList = {};
	var imgInfoName = {
			"01":"본매대",
			"02":"POS매대",
			"03":"별도매대",
			"04":"행사매대",
			"05":"기타매대",
	}
	var actSwiper =  new Swiper('.swiper-container', {
	      slidesPerView: 1,
	      spaceBetween: 20,
	      loop: true,
	      init: true,
	      zoom: {
			    maxRatio: 5,
	      },
	      pagination: {
	        el: '.swiper-pagination',
	        clickable: true,
	      },
	      navigation: {
	        nextEl: '.swiper-button-next',
	        prevEl: '.swiper-button-prev',
	      },
    });
	return{
		//초기함수 호출
		init:function(){

			$("#actCustName").val(P_CUSNAME);

			$("#actCdate").val(P_CDATE);

			//이벤트 등록
			fnEvent();

			fnGetStandList();


		},
		checkSave:function(){
			if(fnMakeImageObject().length > 0){
				return true;
			}else{
				return false;
			}
		}

	}

	//이벤트 등록
	function fnEvent(){
		/*
		 * 팀장 업무일지
		 * 팀장 = 06, PS = 07 권한처리
		 * $(".team-auth").hide();
		 * S_APPAUTH : 06 =$(".team-auth.06).show();
		 * S_APPAUTH : 07 =$(".team-auth.07).show();
		 *
		 */
		$(".team-auth."+S_APPAUTH).show();
		$("#combang_reg").hide();

		//매대사진 종합 저장 버튼
		$("#imgActStandSaveBtn").on("click",function(){
			fnUploadImageFile();
		});
		$("#closeSlide").on("click",function(){
			actSwiper.removeAllSlides();
			$("#slideForm").hide();
			$("#slideForm").css("visibility","hidden");
		});
		$("#deleteImg").on("click",function(){
			var imgList = $("#imgList");
			var imgDiv =  imgList.find(".swiper-slide.swiper-slide-active");

			var idx = actSwiper.activeIndex; ;
//			var idx = imgList.index(imgDiv);
			var imgInfo = imgDiv.data("img-info");
			var photoType = imgInfo.photo_type;
			var photoPicgub = imgInfo.photo_picgub;
			var photoseq = imgInfo.photo_seq;
			if(photoType =="OLD" && confirm("바로 삭제됩니다 삭제 하시겠습니까?")){

				try {

				M.net.http.send({
					server: CONFIG.SERVER,
					path: '/mt/sm/stand/picDelete',
					method: 'POST',
					timeout: 5000,
					data: {
						SP_PERCODE : S_PERCODE,
						SP_DEPCODE : S_DEPCODE,
						SP_CDATE 	: P_CDATE.undash(),
						SP_CUSCODE : P_CUSCODE,
						SP_PICSEQ : photoseq,
						SP_PICGUB : photoPicgub,
					},
					success: function(recevedData, setting) {
						actSwiper.removeSlide(idx);
						imgInfoList[photoPicgub].splice(idx, 1);
						var $stand_list = $("#standImgForm").find("[data-picgub='"+photoPicgub+"'].stand_list");
						$stand_list.find("li").eq(idx).remove();
						fnActSwiperUpdate();
					},
					error: function(errorCode, errorMessage, setting) {
						console.log("onError, " + errorCode + ", " + errorMessage);
						M.pop.alert("onError, " + errorCode + ", " + errorMessage);
					}
				});

				} catch (e) {
					alert(e);

				}
			}
			if(photoType =="NEW" &&confirm("삭제 하시겠습니까?")){
				actSwiper.removeSlide(idx);
				imgInfoList[photoPicgub].splice(idx, 1);
				var $stand_list = $("#standImgForm").find("[data-picgub='"+photoPicgub+"'].stand_list");
				$stand_list.find("li").eq(idx).remove();
				fnActSwiperUpdate();
			}
		});


//		$(".left_box > li > a").on("click",function(e){
//			e.stopPropagation();
//			if(fnMakeImageObject().length > 0 && !$(this).attr("href")){
//				if(!confirm("저장하지 않은 사진이 있습니다.\n계속진행하시겠습니까?")){
//					return;
//				}else{
//					var href = $(this).data("href");
//					$(this).attr("href",href);
//					$(this).trigger("click");
//				}
//			}else{
//				var href = $(this).data("href");
//				$(this).attr("href",href);
//				$(this).trigger("click");
//			}
//		});



		$(".left_box > li > a").not(".on").on("click",function(e){
			e.stopPropagation();

			const url = $(this).data("href");
			console.log(JSON.stringify(param));
			if(fnMakeImageObject().length > 0 ){

				if(confirm('저장하지 않은 사진이 있습니다.\n계속진행하시겠습니까?')){
					M.page.html({url : url,param:param});
				}
			}else{
				M.page.html({url : url,param:param});
			}
		});

		//카메라 호출버튼
		$(".stand_camera_btn").on("click",function(){
			var imgKey = $(this).data("picgub");
			var $stand_list = $(this).parent().prev().children();

			//S.H 수정, 카메라 재 호출
			fnReCallCamera(imgKey, $stand_list);

		});
	}

	//S.H 수정, 카메라 재 호출
	function fnReCallCamera(imgKey, $stand_list){


	}
	
	//매대사진 정보 불러오기
	function fnGetStandList(){
		
		M.net.http.send({
			server: CONFIG.SERVER,
			path: '/mt/sm/stand/picList',       
			method: 'POST',
			timeout: 5000,
			data: {
				SP_PERCODE : S_PERCODE,
				SP_DEPCODE : S_DEPCODE,
				SP_CDATE 	: P_CDATE.undash(),
				SP_CUSCODE : P_CUSCODE,
			},
			success: function(recevedData, setting) {
//				alert(JSON.stringify(recevedData));
				fnSetImgeForm(recevedData);
				fnActSwiperUpdate();
			},
			error: function(errorCode, errorMessage, setting) {
				console.log("onError, " + errorCode + ", " + errorMessage);
				M.pop.alert("onError, " + errorCode + ", " + errorMessage);
			}
		});
	}
	//각 매대별 사진및 셀링스토리 적용
	function fnSetImgeForm(recevedData){
		var M_LIST = recevedData.M_LIST;
		var D_LIST = recevedData.D_LIST;
		for (var i=0 ; i < M_LIST.length ; i++) {
			var SELLING = M_LIST[i].CAPTION;
			var PICGUB = M_LIST[i].PICGUB;
			var selling = $("#standImgForm").find("[data-picgub='"+PICGUB+"'].sellingStory");
			selling.val(SELLING);
		}
		 $("#standImgForm").find(".stand_list").html("");
		for (var i=0 ; i < D_LIST.length ; i++) {
			var PICGUB = D_LIST[i].PICGUB;
			var FILEPATH = D_LIST[i].FILEPATH;
			var PICSEQ = D_LIST[i].PICSEQ;
			var $stand_list = $("#standImgForm").find("[data-picgub='"+PICGUB+"'].stand_list");
			var li = $('<li/>');
			
			var imgPath = "";
			if(D_LIST[i].INSDATE < CONFIG.URL_GUBUN_DATE){
				imgPath = IMG_URL+FILEPATH;
			}
			else{
				imgPath = COMBANG_IMG_URL+FILEPATH;
			}
			
			var img = $('<img class="zoom-image" src="'+imgPath+'" data-picgub="'+PICGUB+'" />');
			img.on("click",function(){
				var PICGUB =  $(this).data("picgub");
				var thisIdx = $(this).parent().index();
				fnShowSlide(imgInfoList[PICGUB] ,thisIdx);
			});
			li.append(img);
			$stand_list.append(li);
			imgInfoList[PICGUB].push({
				photo_path:FILEPATH,
				photo_seq:PICSEQ,
				photo_picgub:PICGUB,
				photo_url_path:imgPath,
				photo_type:'OLD',
			});
		}
	}
	
	//슬라이드 생성
	function fnShowSlide(obj ,thisIdx){
		$.each( obj, function( key, imgInfo ) {
			var imgPath = imgInfo.photo_url_path;
			if(imgInfo.photo_type == 'NEW'){
				imgPath = imgInfo.photo_path;
			}
			var img = $('<img src="'+imgPath+'" />');
			var div = $("<div class='swiper-slide' />")
			var divZoom = $("<div class='swiper-zoom-container' />")
			div.data("img-info",imgInfo)
			divZoom.append(img);
			div.append(divZoom);
			$("#imgList").append(div);
		});
		$("#slideForm").show();
		$("#slideForm").css("visibility","visible");
		fnActSwiperUpdate(thisIdx);
	}
	//엘범 등록
	function fnActSwiperUpdate(index){
//		alert(index);
		actSwiper.updateSize(); 
		//- 슬라이드 수와 해당 오프셋을 다시 계산합니다. JavaScript를 사용하여 슬라이드를 추가 / 제거한 후에 유용합니다.
		actSwiper.updateSlides(); 
		//- 스와이퍼 진행률 다시 계산
		actSwiper.updateProgress(); 
		//- 슬라이드 및 글 머리 기호에서 활성 / 이전 / 다음 클래스 업데이트
		actSwiper.updateSlidesClasses();
		if(index){
			actSwiper.slideTo(index, 0);
		}
		
	}
	//단밀기 엘범에 등록
	function fnImgAlbum(photo_path){
		M.media.album({
	        path: photo_path,
	        onfinish: function(status, result, option) {
                if (status == 'SUCCESS') {
                    var photo_path = result.path;
                    var photo_name = result.name;
                }
	        }
		});
	}
	function fnImgFileDelete(filePath){
		
		 var removeFiles = [];
		 
		 if(filePath["01"]){

			 $.map(filePath, function(value, index){
	        	 $.each(value,function(idx,obj){
	        		 removeFiles.push( obj.photo_path )
	        	 });
	         });

         }else{
        	 removeFiles.push( filePath )
         }
         M.media.removeLibrary({
                 files: removeFiles,
                 media: "PHOTO"
         }, function(status, setting) {
        	 if(filePath["01"]){
        		 imgInfoList = {
 		    			"01":[],
 		    			"02":[],
 		    			"03":[],
 		    			"04":[],
 		    			"05":[],
 		    	};
        	 }
         });
	}
	//사진 압축
	function fnImgOptimize(filePath,$stand_list, imgKey, fileName){
		M.media.optimize({
			'source': filePath,
			'destination': filePath.substring(0,filePath.lastIndexOf("."))+'_min.jpg',
			'overwrite': true,
			'dimension':{ width:CONFIG.IMG_WIDTH },
			'quality': CONFIG.IMG_QUALITY, // Only JPG
			'format': 'JPG',
			'callback': function( result ) {
				if ( result.error ) {
					alert(result.error);
					return;
				}
				fnImgFileDelete(filePath);
//				
				var photo_path = result.path;
				var photo_name = photo_path.substring(photo_path.lastIndexOf("/")+1);

        		var li = $('<li/>');
				var img = $('<img class="zoom-image" src="'+photo_path+'" data-picgub="'+imgKey+'" />');
				img.on("click",function(){
					var PICGUB =  $(this).data("picgub");
					var thisIdx = $(this).parent().index();
					fnShowSlide(imgInfoList[PICGUB] ,thisIdx);
				});
				li.append(img);

				$stand_list.append(li);

        		imgInfoList[imgKey].push({
        			photo_path:photo_path,
        			photo_name:photo_name,
        			photo_picgub:imgKey,
        			photo_type:'NEW',
        		});
//        		//앨범에 촬영한 사진 등록
//        		fnImgAlbum(photo_path);
        		setTimeout(function(){
					$stand_list.parent().scrollLeft(1000000);
				},200);
        		fnImgFileDelete(photo_path);
        		if(imgKey =="01"){
        			fnReCallCamera(imgKey, $stand_list);
        		}
				
			}
		});
	}
	
	//매대사진등록 최종 저장
	function fnUploadImageFile(){
		M.net.http.upload({
		    url: SERVER_URL+"/mt/sm/stand/imgsUpload",
		    header: {},
		    params: {
		    	SP_CUSCODE : P_CUSCODE,
		    	SP_PERCODE : S_PERCODE,
		    	DEPCODE : S_DEPCODE,
		    	CDATE	: P_CDATE.undash(),
		    	ARRAY_SELLING_STRORY:fnMakeSellingStoryObject()
		    },
		    body: fnMakeImageObject(),
		    encoding : "UTF-8",
		    finish : function(status, header, result, setting) {
//		    	fnImgFileDelete(imgInfoList);
		        imgInfoList = {
		    			"01":[],
		    			"02":[],
		    			"03":[],
		    			"04":[],
		    			"05":[],
		    	};
		        $("#imgList").html("");
		        var data = JSON.parse(result);
		        fnSetImgeForm(data.body)
		        App.DeleteCasheImg();
		        M.pop.alert("저장되었습니다.");
		    },
		    progress : function(total, current) {
		        console.log(total, current);
		    }
		});
	}
	
	//컴방  즉시  전송(사용암함)
	function fnSaveStandCommRoom(result){
		fnSetImgeForm(result)
		if(imgInfoList.length == 0){
			alert("저장되었습니다.");
			return;
		}
		
		try {
			var comHtml = "";
			$.each( imgInfoList, function( imgKey, imgArray ) {
				if(imgArray.length > 0 ){
					comHtml += '<p  style="font-size: 14px;font-weight: bold;">-'+imgInfoName[imgKey]+'</p>';
					comHtml +='<div style="display: inline-block;width:100%;border: 1px solid #ccc;">';
					
					$.each( imgArray, function( key, imgInfo ) {
						var path = imgInfo.photo_path;
						comHtml +='<a href="'+COMBANG_IMG_URL+path+'" style="width: 33%;margin-bottom:15px; float:left;text-align:center;" rel="thumbnail">';
						comHtml +='<img class="zoom-image" style="width: 95%" src="'+COMBANG_IMG_URL+path+'" border="0">';
						comHtml +='</a>';
					});
					comHtml +='</div>';
					var sellingText =  $("input[data-picgub='"+imgKey+"']").val();
					if(sellingText !=""){
						comHtml +='<div style="clear:both;text-align: left;border: 1px solid #ccc;vertical-align: top;white-space: pre-line; width:100%;">';
						comHtml +=sellingText;
						comHtml +='</div>';
					}
					comHtml +='<br>';
				}
			});
		} catch (e) {
			alert(e);
		}
		
		var SP_MENUCODE = (P_CHN1 == "40" ? "600023":"600024");
		M.net.http.send({
			server: CONFIG.SERVER,
			path: '/mt/sm/stand/saveCommRoom',       
			method: 'POST',
			timeout: 5000,
			data: {
				
				SP_MENUCODE: SP_MENUCODE,  
				SP_TAGCODE : '1120',  
				SP_SUBJECT : P_CDATE +" "+ P_CUSNAME,
				
				SP_CONTENT : comHtml,  
				SP_DEPCODE : S_DEPCODE,  
				SP_PERCODE : S_PERCODE,  
				SP_CUSCODE : P_CUSCODE, 

			},
			success: function(recevedData, setting) {
				alert("저장되었습니다.");
			},
			error: function(errorCode, errorMessage, setting) {
				console.log("onError, " + errorCode + ", " + errorMessage);
				M.pop.alert("onError, " + errorCode + ", " + errorMessage);
			}
		});
	}
	
	//Selling Story 및 기초정보 가져오기
	function fnMakeSellingStoryObject(){
		var sellingObjList = [];
		var sellingList = $("#standImgForm").find("input.sellingStory");
		sellingList.each( function( ) {
			var picGub = $(this).data("picgub");
			var caption = $(this).val();
			sellingObjList.push({
				SP_CDATE	: P_CDATE.undash(),
				SP_PERCODE	: S_PERCODE,
				SP_DEPCODE	: S_DEPCODE,
				SP_CUSCODE	: P_CUSCODE,
				SP_PICGUB	: picGub,
				SP_CAPTION	: caption,
				PICGUB_NM	: imgInfoName[picGub],
			});
		});
//		alert(sellingObjList);
		return sellingObjList;
	}
	
	//사진 정보 가져오기
	function fnMakeImageObject(){
		var imgObjList = [];
		$.each( imgInfoList, function( imgKey, imgArray ) {
			
			$.each( imgArray, function( key, imgInfo ) {
				if(imgInfo.photo_type == "NEW"){
					imgObjList.push({
						name: imgKey, 
						type: "FILE" ,
						content: imgInfo.photo_path, 
					});
				}
			});
		});
		return imgObjList;
	}
}();

$(document).ready(function(e){
	ActStandSaveApp.init();
});

M.onReady(function(e) {
	//ActStandSaveApp.init();
}).onBack(function(){
	if(ActStandSaveApp.checkSave()){
		if(confirm("저장하지 않은 사진이 있습니다\n계속진행하시겠습니까?")){
			M.page.back();
		}
	}else{
		M.page.back();
	}
}).onResume( function(e) {
	App.UpdateResource();
});
