sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/core/Core",
	'sap/ui/model/json/JSONModel'
], function (Controller, History,MessageBox,Core,JSONModel) {
	return Controller.extend("ZEMT_AM_PIP_APP.controller.BaseController", {
		onInit: function() {
			
		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		// Load i18n for whole Application
		Loadi18n : function(){
			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: "i18n/i18n.properties"
			});
			sap.ui.getCore().setModel(i18nModel, "i18n");
			Core.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
		},
		// Handle Error Response
		HandleError: function(err) {
			if(Core.DataSaveProgress._oDialog.isOpen() == true) {
				Core.DataSaveProgress.close();
			} else if(Core.DataSubmitProgress._oDialog.isOpen() == true) {
				Core.DataSubmitProgress.close();
			}
			if(err.response.statusCode == "401") {
				sap.m.MessageBox.warning(Core.i18n.getText("SAP401msg"), {
					styleClass: "stock",
				});
				return false
			} else if(err.response.statusCode == "400") {
				sap.m.MessageBox.warning(Core.i18n.getText("SAP400MSG"), {
					styleClass: "stock",
				});
				return false
			} else if(err.response.statusCode == "500") {
				sap.m.MessageBox.warning(Core.i18n.getText("SAP500MSGResubmit"), {
					styleClass: "stock",
				});
				return false
			} else {
				sap.m.MessageBox.warning(Core.i18n.getText("SAP408Timeoutmsg"), {
					styleClass: "stock",
				});
				return false
			}
		},
		// Check Network status
		checkConnection: function() {
			if(sap.ui.Device.system.desktop == true) {
			Core.B_isonLine = navigator.onLine;
				if(Core.B_isonLine == false){
					if(Core.DataLoadProgress._oDialog.isOpen() == true){
						Core.DataLoadProgress.close();
					}else if(Core.DataSaveProgress._oDialog.isOpen() == true){
						Core.DataSaveProgress.close();
					}if(Core.DataSubmitProgress._oDialog.isOpen() == true){
						Core.DataSubmitProgress.close();
					}
				}
			}
        },
        // Format Date
        Format_Date : function(paramformat){
        	var Formatted_Date;
        	Formatted_Date = Core.DateFormat_yyyymmdd.format(new Date(paramformat));
        	return Formatted_Date;
        },
        showDocument : function() {
        	setTimeout(function(){
				var wrapper =	document.querySelector('.wrapper');
				wrapper.classList.add("fade");
				},50)
        },
        sModel: function(arr) {
			var Model = new JSONModel(arr);
			Model.iSizeLimit = arr.length;
			return Model;
		},
	});
});