package com.callister.frcai;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        try {
            Log.d(TAG, "MainActivity onCreate called");
            super.onCreate(savedInstanceState);
            Log.d(TAG, "MainActivity onCreate completed successfully");
        } catch (Exception e) {
            Log.e(TAG, "FATAL ERROR in MainActivity onCreate", e);
            throw e;
        }
    }
}
