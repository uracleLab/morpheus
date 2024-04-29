package com.uracle.push.demo.implementation;
import android.app.Activity;
import android.os.Build;
import android.webkit.PermissionRequest;

import androidx.annotation.RequiresApi;

import m.client.android.library.core.bridge.InterfaceJavascript;
import m.client.android.library.core.managers.CallBackWebView;
import m.client.android.library.core.utils.Logger;
import m.client.android.library.core.view.MainActivity;

public class CustomWebChromeClient extends CallBackWebView {
    Activity mActivity;
    public CustomWebChromeClient(MainActivity _callerObject, InterfaceJavascript IFjscript) {
        super(_callerObject, IFjscript);
        mActivity = _callerObject;
    }

    @Override
    public void onPermissionRequest(final PermissionRequest request) {
        Logger.e( "onPermissionRequest");
        mActivity.runOnUiThread(new Runnable() {

            @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
            @Override
            public void run() {

                request.grant(request.getResources());

            }
        });
    }

}
