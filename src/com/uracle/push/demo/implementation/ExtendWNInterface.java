package com.uracle.push.demo.implementation;
import m.client.android.library.core.bridge.InterfaceJavascript;
import m.client.android.library.core.common.LibDefinitions;
import m.client.android.library.core.utils.AESUtil;
import m.client.android.library.core.utils.IOUtils;
import m.client.android.library.core.utils.Logger;
import m.client.android.library.core.utils.PLog;
import m.client.android.library.core.view.AbstractActivity;
import m.client.android.library.core.view.MainActivity;

import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.RectF;
import android.os.Build;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.WebView;
import android.widget.AbsoluteLayout;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

/**
 * ExtendWNInterface Class
 *
 * @author 류경민(<a mailto="kmryu@uracle.co.kr">kmryu@uracle.co.kr</a>)
 * @version v 1.0.0
 * @since Android 2.1 <br>
 *        <DT><B>Date: </B>
 *        <DD>2011.04</DD>
 *        <DT><B>Company: </B>
 *        <DD>Uracle Co., Ltd.</DD>
 *
 * 사용자 정의 확장 인터페이스 구현
 *
 * Copyright (c) 2011-2013 Uracle Co., Ltd.
 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 */
public class ExtendWNInterface extends InterfaceJavascript {

	/**
	 * 아래 생성자 메서드는 반드시 포함되어야 한다.
	 * @param callerObject
	 * @param webView
	 */
	public ExtendWNInterface(AbstractActivity callerObject, WebView webView) {
		super(callerObject, webView);
	}

	/**
	 * 보안 키보드 데이터 콜백 함수
	 * @param data
	 */
	public void wnCBSecurityKeyboard(Intent data) {
		// callerObject.startActivityForResult(newIntent,libactivities.ACTY_SECU_KEYBOARD);
	}

	////////////////////////////////////////////////////////////////////////////////
	// 사용자 정의 네이티브 확장 메서드 구현

	//
	// 아래에 네이티브 확장 메서드들을 구현한다.
	// 사용 예
	//
	public String exWNTestReturnString(String receivedString) {
		String newStr = "I received [" + receivedString + "]";
		return newStr;
	}

	/**
	 * WebViewClient의 shouldOverrideUrlLoading()을 확장한다.
	 * @param view
	 * @param url
	 * @return
	 * 		InterfaceJavascript.URL_LOADING_RETURN_STATUS_NONE	확장 구현을하지 않고 처리를 모피어스로 넘긴다.
	 * 		InterfaceJavascript.URL_LOADING_RETURN_STATUS_TRUE	if the host application wants to leave the current WebView and handle the url itself
	 * 		InterfaceJavascript.URL_LOADING_RETURN_STATUS_FALSE	otherwise return false.
	 */
	public int extendShouldOverrideUrlLoading(WebView view, String url) {

		// Custom url schema 사용 예
//		if(url.startsWith("custom:")) {
//		    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
//		    callerObject.startActivity( intent );
//    		return InterfaceJavascript.URL_LOADING_RETURN_STATUS_FALSE;
//    	}

		return InterfaceJavascript.URL_LOADING_RETURN_STATUS_NONE;
	}

	/**
	 * 페이지 로딩이 시작되었을때 호출된다.
	 * @param view
	 * @param url
	 * @param favicon
	 */
	public void onExtendPageStarted (WebView view, String url, Bitmap favicon) {
		PLog.i("", ">>> 여기는 ExtendWNInterface onPageStarted입니다!!!");
	}

	/**
	 * 페이지 로딩이 완료되었을때 호출된다.
	 * @param view
	 * @param url
	 */
	public void onExtendPageFinished(WebView view, String url) {
		PLog.i("", ">>> 여기는 ExtendWNInterface onPageFinished!!!");
	}

	/**
	 * Give the host application a chance to handle the key event synchronously
	 * @param view
	 * @param event
	 * @return True if the host application wants to handle the key event itself, otherwise return false
	 */
	public boolean extendShouldOverrideKeyEvent(WebView view, KeyEvent event) {

		return false;
	}

	/**
	 * onActivityResult 발생시 호출.
	 */
	public void onExtendActivityResult(Integer requestCode, Integer resultCode, Intent data) {
		PLog.i("", ">>> 여기는 ExtendWNInterface onExtendActivityResult!!!  requestCode => [ " + requestCode + " ], resultCode => [ " + resultCode + " ]");
	}

	public void nativeView(){
		callerObject.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				WebView mLayout = new WebView(webView.getContext());

				mLayout.setLayoutParams(makeLayoutParams(webView, new RectF(0, 0, 1000, 1000)));

				mLayout.setBackgroundColor(Color.rgb(255, 255, 255));
				((MainActivity) callerObject).getMainLayout().addView(mLayout);
				RelativeLayout.LayoutParams param = (RelativeLayout.LayoutParams) mLayout.getLayoutParams();

				//margin 설정
				param.leftMargin     =100;
				param.topMargin     = 800;
				param.bottomMargin     = 100;
				param.rightMargin     = 100;//
				mLayout.setLayoutParams(param);
				mLayout.loadUrl("https://m.naver.com/");
			}
		});

	}
	private static AbsoluteLayout.LayoutParams makeLayoutParams(WebView webView, RectF r) {
		RectF t = new RectF(r);
		Logger.d( String.format("WebView Scale : %f, Scroll : (%d, %d)", webView.getScale(), webView.getScrollX(), webView.getScrollY()));
		AbsoluteLayout.LayoutParams params = new AbsoluteLayout.LayoutParams(Math.round(Math.max(t.width(), 0)), Math.round(Math.max(t.height(), 0)), (int)(Math.floor(t.left)), (int)(Math.floor(t.top)));
		return params;
	}
}
