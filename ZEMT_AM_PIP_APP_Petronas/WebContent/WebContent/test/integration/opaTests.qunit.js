/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	
	sap.ui.require([
		"ZEMT_AM_PIP_APP/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});