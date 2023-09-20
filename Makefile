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
