SHELL := /bin/bash

run:
	cordova build -- --webpack.config webpack.config.js
	cordova run

nord:
	cordova build -- --webpack.config webpack.config.js
	cordova run android --device

chrome:
	cordova build -- --webpack.config webpack.config.js
	cordova run --target=chrome

android:
	cordova build -- --webpack.config webpack.config.js
	cordova run android

apk:
	cordova build android --release --buildConfig
	cp platforms/android/app/build/outputs/apk/release/app-release.apk ../bvp/mobile-app/bvp

