sap.ui.define(["ZEMT_AM_PIP_APP/controller/BaseController", "ZEMT_AM_PIP_APP/Format/Formatter", 'sap/ui/model/Filter',	'sap/ui/core/Core', 'sap/ui/model/json/JSONModel',
	'sap/ui/model/Sorter', 'sap/m/MessageToast', 'sap/m/Dialog', 'sap/m/Button', 'sap/m/Text', 'sap/m/MessageBox',
	'sap/ui/table/RowAction', "sap/ui/table/RowActionItem", "sap/ui/table/RowSettings", "sap/ui/core/Fragment", 'sap/ui/export/library', 
	'sap/ui/export/Spreadsheet'], function(BaseController, formatter, Filter,Core, JSONModel, Sorter, MessageToast, Dialog, Button, Text, MessageBox, RowAction, RowActionItem, RowSettings, Fragment, exportLibrary, Spreadsheet) {
	'use strict';
	var EdmType = exportLibrary.EdmType;
	formatter: formatter;
	Core.formatter = formatter;
	return BaseController.extend("ZEMT_AM_PIP_APP.controller.PIP_Ageing_Report_Main", {
		onInit: function() {
			window.oncontextmenu = function() {
				return false
			}
			document.onkeydown = function(e) {
				if(window.event.keyCode === 123 || e.button === 2) {
					// 123 is key code for F12 key block and 2 is button code for right click
					return false
				}
			}
			jQuery.sap.that = this;
			this.Loadi18n();
			jQuery.sap.DataSubmitProgress = new sap.m.BusyDialog({
				text: jQuery.sap.i18n.getText('DataSubmitProgress')
			});
			jQuery.sap.DataSaveProgress = new sap.m.BusyDialog({
				text: jQuery.sap.i18n.getText('DataSaveProgress')
			});
			jQuery.sap.DataLoadProgress = new sap.m.BusyDialog({
				text: jQuery.sap.i18n.getText('DataLoadProgress')
			});
			this.Empty_Model = new JSONModel([]);
			jQuery.sap.PIP_Report_Search = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/Update_Request_Search", this);
			this.getView().addDependent(jQuery.sap.PIP_Report_Search);
				jQuery.sap.F4_ExcelUpload = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/ExcelUpload", this);
				this.getView().addDependent(jQuery.sap.F4_ExcelUpload);
				jQuery.sap.F4_PersonnelVendorSearch = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/PersonnelVendorSearch", this);
				this.getView().addDependent(jQuery.sap.F4_AddDepreciationAreas);
				jQuery.sap.F4_WbsNoSearch = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/WbsNoSearch", this);
				this.getView().addDependent(jQuery.sap.F4_WbsNoSearch);
				jQuery.sap.F4_AddNewAsset = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/AddNewAsset", this);
				this.getView().addDependent(jQuery.sap.F4_AddNewAsset);
				jQuery.sap.F4_AssetSearch = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/AssetSearch", this);
				this.getView().addDependent(jQuery.sap.F4_AssetSearch);
				jQuery.sap.F4_AttachmentUpload = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/AttachmentUpload", this);
				this.getView().addDependent(jQuery.sap.F4_AttachmentUpload);
				jQuery.sap.F4_AttachmentView = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/AttachmentView", this);
				this.getView().addDependent(jQuery.sap.F4_AttachmentView);
				jQuery.sap.F4_MessageView = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/MessageView", this);
				this.getView().addDependent(jQuery.sap.F4_ResponsivePopover);
				jQuery.sap.F4_Update_Request = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/Update_Request", this);
				this.getView().addDependent(jQuery.sap.F4_Update_Request);
			//	jQuery.sap.that.showDocument();
			//	jQuery.sap.that.getView().byId("Pip_Ageing_Report_Table").setVisibleRowCount(15);
			this.getRouter().getRoute("PIP_Ageing_Report_Main").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function(oEvent) {
			jQuery.sap.that.checkConnection();
			if(jQuery.sap.B_isonLine == false) {
				jQuery.sap.that.showDocument();
				MessageBox.warning(jQuery.sap.i18n.getText("msgoffline"));
				return false;
			}
			setTimeout(function() {
			//	jQuery.sap.that.UserMaster();
				var GetMasterData = new sap.ui.model.odata.ODataModel(jQuery.sap.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
				GetMasterData.setHeaders({
					"muser": jQuery.sap.O_Login_user.Muser,
				});
				GetMasterData.read("GetMasterDataSet?$expand=EtDchkl,EtCompanyCode,EtPrctr,EtPlants,EtPrioroty,EtTagTypes,EtInspStatus,EtAssetClass,EtCostCenter," + "EtMobAppTiles,EtMobAppListView,EtViewAppScreen,EtAppScreenFields,EtUserData,EtInsuranceTyp,EtEquiCategory,EtObjectType,EtABCIndicator,EtLocation,EtUnits,EtPrctr,EtT005t,EtT087t,EtTa1tvt,EtDchklist,EtT090nat,EtT093t,EtAnkb", null, "", true, function(oData, response) {
					jQuery.sap.A_MasterDataForF4Helps = oData.results[0];
					var EtCompanyCode = oData.results[0].EtCompanyCode.results;
					var EtPrctr = oData.results[0].EtPrctr.results;
					var EtPlants = oData.results[0].EtPlants.results;
					var EtPrioroty = oData.results[0].EtPrioroty.results;
					var EtTagTypes = oData.results[0].EtTagTypes.results;
					var EtInspStatus = oData.results[0].EtInspStatus.results;
					var EtAssetClass = oData.results[0].EtAssetClass.results;
					var EtCostCenter = oData.results[0].EtCostCenter.results;
					var EtViewAppScreen = oData.results[0].EtViewAppScreen.results;
					var EtAppScreenFields = oData.results[0].EtAppScreenFields.results;
					var EtEquiCategory = oData.results[0].EtEquiCategory.results;
					var EtObjectType = oData.results[0].EtObjectType.results;
					var EtUserData = oData.results[0].EtUserData.results;
					var EtInsuranceTyp = oData.results[0].EtInsuranceTyp.results;
					var EtABCIndicator = oData.results[0].EtABCIndicator.results;
					var EtLocation = oData.results[0].EtLocation.results;
					var EtUnits = oData.results[0].EtUnits.results;
					var EtPrctr = oData.results[0].EtPrctr.results;
					var EtT005t = oData.results[0].EtT005t.results;
					var EtT087t = oData.results[0].EtT087t.results;
					var EtT090nat = oData.results[0].EtT090nat.results;
					var EtT093t = oData.results[0].EtT093t.results;
					var Priority_arr = oData.results[0].EtPrioroty.results;
					var CompanyCodeJson = new JSONModel(EtCompanyCode);
					CompanyCodeJson.iSizeLimit = 10000;
					var ProfitCenterJson = new JSONModel(EtPrctr);
					ProfitCenterJson.iSizeLimit = 10000;
					var PlantsJson = new JSONModel(EtPlants);
					PlantsJson.iSizeLimit = 10000;
					var EtUnitsJson = new JSONModel(EtUnits);
					EtUnitsJson.iSizeLimit = 10000;
					var PriorotyJson = new JSONModel(EtPrioroty);
					PriorotyJson.iSizeLimit = 10000;
					var TagTypesJson = new JSONModel(EtTagTypes);
					TagTypesJson.iSizeLimit = 10000;
					var InspStatusJson = new JSONModel(EtInspStatus);
					InspStatusJson.iSizeLimit = 10000;
					var AssetClassJson = new JSONModel(EtAssetClass);
					AssetClassJson.iSizeLimit = 10000;
					var CostCenterJson = new JSONModel(EtCostCenter);
					CostCenterJson.iSizeLimit = 10000;
					var ViewAppScreenJson = new JSONModel(EtViewAppScreen);
					ViewAppScreenJson.iSizeLimit = 10000;
					var AppScreenFieldsJson = new JSONModel(EtAppScreenFields);
					AppScreenFieldsJson.iSizeLimit = 10000;
					var EquiCategoryJson = new JSONModel(EtEquiCategory);
					EquiCategoryJson.iSizeLimit = 10000;
					var ObjectTypeJson = new JSONModel(EtObjectType);
					ObjectTypeJson.iSizeLimit = 10000;
					var UserDataJson = new JSONModel(EtUserData);
					UserDataJson.iSizeLimit = 10000;
					var InsuranceTypJson = new JSONModel(EtInsuranceTyp);
					InsuranceTypJson.iSizeLimit = 10000;
					var ABCIndicatorJson = new JSONModel(EtABCIndicator);
					ABCIndicatorJson.iSizeLimit = 10000;
					var LocationJson = new JSONModel(EtLocation);
					LocationJson.iSizeLimit = 10000;
					var ProfitCenterJson = new JSONModel(EtPrctr);
					ProfitCenterJson.iSizeLimit = 10000;
					var EvaluationGroupJson = new JSONModel(EtT087t);
					EvaluationGroupJson.iSizeLimit = 10000;
					var CountryOfOriginJson = new JSONModel(EtT005t);
					CountryOfOriginJson.iSizeLimit = 10000;
					var DpAreaJson = new JSONModel(EtT093t);
					DpAreaJson.iSizeLimit = 10000;
					var DKeyJson = new JSONModel(EtT090nat);
					DKeyJson.iSizeLimit = 10000;
					
					Core.byId("VhCompanyCodeId").setModel(CompanyCodeJson);
					Core.byId("VhPlantCodeId").setModel(PlantsJson);
					Core.byId("VhCostCenterId").setModel(CostCenterJson);
					Core.byId("VhAssetClassId").setModel(AssetClassJson);
					Core.byId("VhLocationId").setModel(LocationJson);
					Core.byId("Plant").setModel(PlantsJson);
					Core.byId("CompanyCode").setModel(CompanyCodeJson);
					jQuery.sap.PIP_Report_Search.open();
					jQuery.sap.that.showDocument();
				}, function(oError) {
					jQuery.sap.that.showDocument();
				});
			}, 50)
		},
		onAfterRendering: function() {
			
		},
		UserMaster: function(key) {
			var Fyear, Atrnid, Bukrs, Anlkl, Kostl, Werks, Mass_Data, timeout;
			timeout = 0;
			var UserMaster = new sap.ui.model.odata.ODataModel(jQuery.sap.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
			UserMaster.setHeaders({
				"Muser": jQuery.sap.O_Login_user.Muser,
				"Uname": jQuery.sap.O_Login_user.Muser,
				"Bukrs": Bukrs,
				"Anlkl": Anlkl,
				"Kostl": Kostl,
				"Werks": Werks,
				"Atrnid": Atrnid,
				"Fyear": Fyear,
				"Doctype": "ASSET",
				"Action": Action,
			});
			setTimeout(function() {
				UserMaster.read("GetUserMasterSet?$expand=EtUserBukrs,EtUserWorkflow&$format=json", null, "", true, function(oData, oResponse) {
					var view = Core.that.getView();
					Core.A_UserMasterData = oData.results[0];
					var CompanyCode = Core.A_UserMasterData.EtUserBukrs.results;
					var CompanyCode_Model = new JSONModel(CompanyCode);
					CompanyCode_Model.iSizeLimit = 10000;
					var EtUserWorkflow = Core.A_UserMasterData.EtUserWorkflow.results;
					var EtUserWorkflow_Model = new JSONModel(EtUserWorkflow);
					EtUserWorkflow_Model.iSizeLimit = 10000;
					Core.byId("CompanyCode").setModel(CompanyCode_Model);
					
				}, function(err) {
				});
			}, timeout);
		},
		VhCompanyCodeChange: function(oEvent) {
			Core.byId("VhAssetClassId").setSelectedKey("");
			Core.byId("VhCostCenterId").setSelectedKey("");
			if(oEvent.getSource().getSelectedItem() != null) {
				Core.byId("VhPlantCodeId").setEnabled(true);
				Core.byId("VhCostCenterId").setEnabled(true);
				Core.byId("VhAssetClassId").setEnabled(true);
				Core.byId("VhLocationId").setEnabled(true);
				var SelectedIndex = oEvent.getSource().getSelectedItem().sId.split("VhCompanyCodeId-")[1];
				var SelectedData = Core.byId("VhCompanyCodeId").getModel().getData()[SelectedIndex];
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, SelectedData.Bukrs));
				var filter = new sap.ui.model.Filter(aFilters, false);
				Core.byId("VhAssetClassId").getBinding("items").filter(filter, "Application");
				Core.byId("VhCostCenterId").getBinding("items").filter(filter, "Application");
			} else {
				Core.byId("VhAssetClassId").getBinding("items").filter([], "Application");
				Core.byId("VhCostCenterId").getBinding("items").filter([], "Application");
			}
		},
		VhPlantCodeChange: function(oEvent) {
			Core.byId("VhLocationId").setSelectedKey("");
			if(oEvent.getSource().getSelectedItem() != null) {
				var SelectedIndex = oEvent.getSource().getSelectedItem().sId.split("VhPlantCodeId-")[1];
				var SelectedData = Core.byId("VhPlantCodeId").getModel().getData()[SelectedIndex];
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, SelectedData.Werks));
				var filter = new sap.ui.model.Filter(aFilters, false);
				Core.byId("VhLocationId").getBinding("items").filter(filter, "Application");
			} else {
				Core.byId("VhLocationId").getBinding("items").filter([], "Application");
			}
		},VhCompanyCodeEmptyCheck: function(oEvent) {
			var CompanyCode = Core.byId("VhCompanyCodeId").getSelectedKey();
			var SelectedKey = oEvent.getSource().getSelectedKey();
			if(CompanyCode == "" && SelectedKey != "") {
				var Msg = jQuery.sap.i18n.getText("CompanyCodeMandatoryTxt");
				MessageBox.information(Msg, {
					actions: [MessageBox.Action.NO],
					onClose: function(oAction) {
						Core.byId("VhAssetClassId").setSelectedKey("");
						Core.byId("VhCostCenterId").setSelectedKey("");
					}
				});
			}
		},
		VhLocationChange: function(oEvent) {
			var PlantCode = Core.byId("VhPlantCodeId").getSelectedKey();
			var PlantCodeMandatoryTxt = jQuery.sap.i18n.getText("PlantCodeMandatoryTxt");
			if(PlantCode == "") {
				MessageBox.information(PlantCodeMandatoryTxt, {
					actions: [MessageBox.Action.NO],
					onClose: function(oAction) {
						Core.byId("VhLocationId").setSelectedKey("");
					}
				});
			}
		},
		// Exit App
		ExitAction: function() {
			var informationDialog = new Dialog({
				title: jQuery.sap.i18n.getText("MsgWarning"),
				type: 'Message',
				state: 'Warning',
				content: new sap.m.Text({
					text: jQuery.sap.i18n.getText("AssetBackExit")
				}),
				beginButton: new sap.m.Button({
					text: jQuery.sap.i18n.getText("MsgYes"),
					type: 'Accept',
					press: function() {
						informationDialog.close();
							setTimeout(function() {
								window.close();
							}, 500)
					}
				}),
				endButton: new sap.m.Button({
					text: jQuery.sap.i18n.getText("MsgNo"),
					type: 'Reject',
					press: function() {
						informationDialog.close();
					}
				}),
				afterClose: function() {
					informationDialog.destroy();
				}
			});
			informationDialog.open();
		},
		ReferehData : function(){
			var CompanyCode = Core.byId("CompanyCode").getValue();
			if(CompanyCode == "") {
				jQuery.sap.PIP_Report_Search.open();
			} else{
				MessageBox.confirm(jQuery.sap.i18n.getText("RefershText"), {
				    title: "Confirm",                                    // default
					onClose: function (sAction) {
						if(sAction == 'YES'){
							jQuery.sap.that.Serach_Reqest_Data();
						}
					},                                     // default
				    styleClass: "",                                      // default
				    actions: [ sap.m.MessageBox.Action.YES,
				               sap.m.MessageBox.Action.NO ],         // default
				    emphasizedAction: sap.m.MessageBox.Action.YES,        // default
				    initialFocus: null,                                  // default
				    textDirection: sap.ui.core.TextDirection.Inherit     // default
				});
			}
		},
		Serach_Reqest_Data: function() {
			var wbsNo = Core.byId("WBSNoId").getValue();
			var ProjectNo = Core.byId("ProjNoId").getValue();
			var pipp_Asset = Core.byId("Asset_id").getValue();
			var ReportingDate = Core.byId("ReportingDate_id").getValue();
			var CompanyCode =  Core.byId("CompanyCode").getSelectedKey();
			var plant =  Core.byId("Plant").getSelectedKey();
			wbsNo == '' && (Core.Posid = '');
			if(CompanyCode.length == 0) {
				MessageBox.information(jQuery.sap.i18n.getText("CompanyCodeMandatoryTxt"));
				return false;
			}  else {
				jQuery.sap.DataLoadProgress.open();
				var EntityInputs = [];
				/*var CostCenterArray = [];
				var CompanyCodeArray = [];
				for(var i = 0; i < CompanyCode.length; i++) {
					var data = "Bukrs eq '".concat(CompanyCode[i].mProperties.key).concat("'");
					CompanyCodeArray.push(data);
				}
				if(CompanyCodeArray.length > 0) {
					var CompanyCodeString = CompanyCodeArray.toString();
					CompanyCodeString = CompanyCodeString.split(',').join(' or ');
					CompanyCodeString = "(" + CompanyCodeString + ")";
					EntityInputs.push(CompanyCodeString);
				}
				var PlanningPlantArray = [];
				for(var i = 0; i < plant.length; i++) {
					var data = "Werks eq '".concat(plant[i].mProperties.key).concat("'");
					PlanningPlantArray.push(data);
				}
				if(PlanningPlantArray.length > 0) {
					var PlanningPlantString = PlanningPlantArray.toString();
					PlanningPlantString = PlanningPlantString.split(',').join(' or ');
					PlanningPlantString = "(" + PlanningPlantString + ")";
					EntityInputs.push(PlanningPlantString);
				}*/
			if(CompanyCode != "") {
				var data = "Bukrs eq '".concat(CompanyCode).concat("'");
				EntityInputs.push(data);
			}
			if(plant != "") {
				var data = "Werks eq '".concat(plant).concat("'");
				EntityInputs.push(data);
			}
				if(ProjectNo != "") {
					var data = "Pspid eq '".concat(ProjectNo).concat("'");
					EntityInputs.push(data);
				/*	var data = "Bukrs eq '".concat(Core.Bukrs).concat("'");
					EntityInputs.push(data);
					var data = "Anln2 eq '".concat(Core.Anln2).concat("'");
					EntityInputs.push(data);*/
				}
				if(wbsNo != "") {
					if(wbsNo.includes(".")){
						var data = "Posid eq '".concat(wbsNo).concat("'");
					}else{
						var data = "Posid eq '".concat(Core.Posid).concat("'");
					}
					EntityInputs.push(data);
				}
				/*if(pipp_Asset != "") {
					var data = "Anln1 eq '".concat(pipp_Asset).concat("'");
					EntityInputs.push(data);
				}*/
				if(ReportingDate != ""){
					var data = "Rdate eq '".concat(jQuery.sap.DateFormat_yyyymmdd.format(new Date(ReportingDate))).concat("'");
					EntityInputs.push(data);
				}
				var EntityValue = "GetProjPIPReqSet?$expand=EtProjPIPData";
				if(EntityInputs.length > 0) {
					EntityInputs = EntityInputs.toString();
					EntityInputs = EntityInputs.split(',').join(' and ');
					EntityInputs = encodeURIComponent(EntityInputs);
					EntityValue = "GetProjPIPReqSet?$filter=" + EntityInputs + "&$expand=EtProjPIPData";
				}
				jQuery.sap.that.checkConnection();
				if(jQuery.sap.B_isonLine == false) {
					MessageBox.warning(jQuery.sap.i18n.getText("msgoffline"));
					return false;
				}
				setTimeout(function() {
					var Ageing_Report_Model = new sap.ui.model.odata.ODataModel(jQuery.sap.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
					Ageing_Report_Model.read(EntityValue, null, null, false, function(oData, response) {
						if(oData.results.length != 0) {
							var Report_Data = oData.results[0].EtProjPIPData.results;
							/*Report_Data.map(function(x){
								x.Post1 = Core.Post1;
							})*/
							var Report_Model = new JSONModel(Report_Data);
							Report_Model.iSizeLimit = 10000;
							jQuery.sap.that.getView().byId("Pip_Ageing_Report_Table").setModel(Report_Model);
						}else{
							jQuery.sap.that.getView().byId("Pip_Ageing_Report_Table").setModel(jQuery.sap.that.Empty_Model);
						}
						jQuery.sap.PIP_Report_Search.close();
						jQuery.sap.DataLoadProgress.close();
					}, function(oError) {
						jQuery.sap.DataLoadProgress.close();
						var errMessage = oError.response.statusText;
						var MessageText = JSON.parse(oError.response.body).error.message.value;
						MessageBox.error(errMessage + "  (" + MessageText + ")");
					});
				}, 500);
			}
		},
		ClearData: function() {
			var view = jQuery.sap.that.getView();
			view.byId("Pip_Ageing_Report_Table").setModel(this.Empty_Model);
		},
		onAttachmentCancel: function() {
			jQuery.sap.F4_AttachmentUpload.close();
		},
		// Can Enter only Alphabets
		onlyAlphabets: function(oEvent) {
			var regex = /^[A-Za-z]+$/;
			var input = oEvent.getSource().getValue();
			if(!input.match(regex) && input != "") {
				var Msg = jQuery.sap.i18n.getText("OnlyAlphabetsText");
				MessageBox.information(Msg);
				oEvent.getSource().setValue("");
			}
		},
		AssetValueHelp: function(oEvent) {
			jQuery.sap.F4_AssetSearch.open();
			this.ClearBtnPress();
			Core.byId("AssetSearchPage").setExpanded(true);
			var EtCompanyCode = jQuery.sap.A_MasterDataForF4Helps.EtCompanyCode.results;
			var EtPlants = jQuery.sap.A_MasterDataForF4Helps.EtPlants.results;
			var EtCostCenter = jQuery.sap.A_MasterDataForF4Helps.EtCostCenter.results;
			var EtAssetClass = jQuery.sap.A_MasterDataForF4Helps.EtAssetClass.results;
			var EtLocation = jQuery.sap.A_MasterDataForF4Helps.EtLocation.results;
			var CompanyCodeJson = new sap.ui.model.json.JSONModel(EtCompanyCode);
			CompanyCodeJson.iSizeLimit = 10000;
			var PlantsJson = new sap.ui.model.json.JSONModel(EtPlants);
			PlantsJson.iSizeLimit = 10000;
			var CostCenterJson = new sap.ui.model.json.JSONModel(EtCostCenter);
			CostCenterJson.iSizeLimit = 10000;
			var AssetClassJson = new sap.ui.model.json.JSONModel(EtAssetClass);
			AssetClassJson.iSizeLimit = 10000;
			var LocationJson = new sap.ui.model.json.JSONModel(EtLocation);
			LocationJson.iSizeLimit = 10000;
			Core.byId("VhCompanyCodeId").setModel(CompanyCodeJson);
			Core.byId("VhPlantCodeId").setModel(PlantsJson);
			Core.byId("VhCostCenterId").setModel(CostCenterJson);
			Core.byId("VhAssetClassId").setModel(AssetClassJson);
			Core.byId("VhLocationId").setModel(LocationJson);
			Core.byId("VhPlantCodeId").setEnabled(false);
			Core.byId("VhCostCenterId").setEnabled(false);
			Core.byId("VhAssetClassId").setEnabled(false);
			Core.byId("VhLocationId").setEnabled(false);
		},
		AssetSearchClose: function() {
			jQuery.sap.F4_AssetSearch.close();
			var emptyJson = new JSONModel([]);
			emptyJson.iSizeLimit = 10000;
			Core.byId("AssetTableId").setModel(emptyJson);
		},
		ClearBtnPress: function() {
			Core.byId("VhPlantCodeId").setEnabled(false);
			Core.byId("VhCostCenterId").setEnabled(false);
			Core.byId("VhAssetClassId").setEnabled(false);
			Core.byId("VhLocationId").setEnabled(false);
			Core.byId("VhCompanyCodeId").setSelectedKey("");
			Core.byId("VhPlantCodeId").setSelectedKey("");
			Core.byId("VhCostCenterId").setSelectedKey("");
			Core.byId("VhAssetClassId").setSelectedKey("");
			Core.byId("VhLocationId").setSelectedKey("");
			Core.byId("VhAssetNameId").setValue("");
			var emptyJson = new JSONModel([]);
			emptyJson.iSizeLimit = 10000;
			Core.byId("AssetTableId").setModel(emptyJson);
			Core.byId("AssetTabelPanelId").setVisible(false);
			var AssetTitle = jQuery.sap.i18n.getText("AssetSearchTitle");
			Core.byId("AssetSearchTitleId").setText(AssetTitle);
		},
		AssetBtnPress: function() {
			var CompanyCode = Core.byId("VhCompanyCodeId").getSelectedKey();
			var PlanningPlant = Core.byId("VhPlantCodeId").getSelectedKey();
			var CostCenter = Core.byId("VhCostCenterId").getSelectedKey();
			var AssetClass = Core.byId("VhAssetClassId").getSelectedKey();
			var Location = Core.byId("VhLocationId").getSelectedKey();
			var AssetName = Core.byId("VhAssetNameId").getValue();
			if(CompanyCode == "") {
				var Msg = jQuery.sap.i18n.getText("CompanyCodeMandatoryTxt");
				MessageBox.information(Msg);
			} else if(AssetClass == "") {
				var Msg = jQuery.sap.i18n.getText("AsserClassMandatoryTxt");
				MessageBox.information(Msg);
			} else {
				jQuery.sap.DataLoadProgress.open();
				Core.byId("AssetSearchPage").setExpanded(false);
				Core.byId("AssetTabelPanelId").setVisible(true);
				var EntityInputs = [];
				if(CompanyCode != "") {
					var data = "Bukrs eq '".concat(CompanyCode).concat("'");
					EntityInputs.push(data);
				}
				if(PlanningPlant != "") {
					var data = "Werks eq '".concat(PlanningPlant).concat("'");
					EntityInputs.push(data);
				}
				if(CostCenter) {
					var data = "Kostl eq '".concat(CostCenter).concat("'");
					EntityInputs.push(data);
				}
				if(AssetClass) {
					var data = "Anlkl eq '".concat(AssetClass).concat("'");
					EntityInputs.push(data);
				}
				if(Location) {
					var data = "Stort eq '".concat(Location).concat("'");
					EntityInputs.push(data);
				}
				if(AssetName) {
					var data = "Txt50 eq '".concat(AssetName).concat("'");
					EntityInputs.push(data);
				}
				var EntityValue = "SearchAssetSet?$expand=EtAssetSearch,EtAssetAnlb";
				if(EntityInputs.length > 0) {
					EntityInputs = EntityInputs.toString();
					EntityInputs = EntityInputs.split(',').join(' and ');
					EntityInputs = encodeURIComponent(EntityInputs);
					EntityValue = "SearchAssetSet?$filter=" + EntityInputs + "&$expand=EtAssetSearch,EtAssetAnlb";
				}
				jQuery.sap.that.checkConnection();
				if(jQuery.sap.B_isonLine == false) {
					MessageBox.warning(jQuery.sap.i18n.getText("msgoffline"));
					return false;
				}
				setTimeout(function() {
					var getData = new sap.ui.model.odata.ODataModel(jQuery.sap.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
					getData.setHeaders({
						"muser": jQuery.sap.O_Login_user.Muser
					});
					getData.read(EntityValue, null, null, false, function(oData, response) {
						var DataJson = new JSONModel([]);
						DataJson.iSizeLimit = 10000;
						var AssetTitle = jQuery.sap.i18n.getText("AssetSearchTitle");
						if(oData.results.length == 0) {
							var Msg = jQuery.sap.i18n.getText("NoDataMsg");
							MessageBox.information(Msg);
							Core.byId("AssetTableId").setModel(DataJson);
							Core.byId("AssetSearchTitleId").setText(AssetTitle);
						} else {
							DataJson.setData(oData.results[0].EtAssetSearch.results);
							Core.byId("AssetTableId").setModel(DataJson);
							var Depc_arr = oData.results[0].EtAssetAnlb.results;
							var Depc_arrlen = Depc_arr.length;
							if(Depc_arrlen > 0) {
								for(var k = 0; k < Depc_arrlen; k++) {
									var date = Depc_arr[k].Afabg;
									if(date != "" && date != "00000000") {
										var d = date;
										var day = d.slice(6);
										var q = d.substring(4, 0);
										var w = d.substring(6, 4);
										var myYear = q;
										var sptdate = String(w).split(" ");
										var ab = Number(sptdate);
										var months = [' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
										var myMonth = months[ab];
										var combineDatestr = day + " " + myMonth + " " + myYear;
										Depc_arr[k].Afabg = combineDatestr;
									} else {
										Depc_arr[k].Afabg = "";
									}
								}
								jQuery.sap.A_DeprecationArea = Depc_arr;
							} else {
								jQuery.sap.A_DeprecationArea = Depc_arr;
							}
							Core.byId("AssetSearchTitleId").setText(AssetTitle + " (" + oData.results[0].EtAssetSearch.results.length + ")");
						}
						jQuery.sap.DataLoadProgress.close();
					}, function(oError) {
						jQuery.sap.DataLoadProgress.close();
						console.log("Error in Search SearchIpset");
						var errMessage = oError.response.statusText;
						var MessageText = JSON.parse(oError.response.body).error.message.value;
						MessageBox.error(errMessage + "  (" + MessageText + ")");
					});
				}, 2000);
			}
		},
	
		AddAssetPress: function() {
			var AssetTable = Core.byId("AssetTableId");
			var SelectedContext = AssetTable.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength == 0) {
				MessageBox.information(jQuery.sap.i18n.getText("selectRecord"));
				return false;
			} else if(SelectedContextLength > 1) {
				MessageBox.information(jQuery.sap.i18n.getText("selectRecordOnlyOne"));
				return false;
			} else {
				var AssetTableData = AssetTable.getContextByIndex(AssetTable.getSelectedIndices()[0]).getObject();
				Core.Bukrs = AssetTableData.Bukrs;
				Core.Anln2 = AssetTableData.Anln2;
				Core.byId("Asset_id").setValue(AssetTableData.Anln1);
				jQuery.sap.F4_AssetSearch.close();
			}
		},
		Clear_Serach : function (){
			Core.byId("CompanyCode").setSelectedKey();
			Core.byId("Plant").setSelectedKey();
			Core.byId("ReportingDate_id").setValue();
			Core.byId("WBSNoId").setValue();
			Core.byId("ProjNoId").setValue();
			Core.byId("Asset_id").setValue();
		},
		// Excel 
		AddNewAssetPress: function() {
			jQuery.sap.F4_AddNewAsset.open();
			var EtCompanyCode = jQuery.sap.A_MasterDataForF4Helps.EtCompanyCode.results;
			var EtAssetClass = jQuery.sap.A_A_MasterDataForF4Helps.EtAssetClass.results;
			var EtCostCenter = jQuery.sap.A_MasterDataForF4Helps.EtCostCenter.results;
			var EtUnits = jQuery.sap.A_MasterDataForF4Helps.EtUnits.results;
			var EtPlants = jQuery.sap.A_MasterDataForF4Helps.EtPlants.results;
			//var EtWbs = jQuery.sap.A_MasterDataForF4Helps.EtWbs.results;
			var CompanyCodeJson = new JSONModel(EtCompanyCode);
			CompanyCodeJson.iSizeLimit = 10000;
			var AssetClassJson = new JSONModel(EtAssetClass);
			AssetClassJson.iSizeLimit = 10000;
			var CostCenterJson = new JSONModel(EtCostCenter);
			CostCenterJson.iSizeLimit = 10000;
			var UnitsJson = new JSONModel(EtUnits);
			UnitsJson.iSizeLimit = 10000;
			var PlantsJson = new JSONModel(EtPlants);
			PlantsJson.iSizeLimit = 10000;
			Core.byId("NewAssetCompanyCode").setModel(CompanyCodeJson);
			Core.byId("NewAssetClassId").setModel(AssetClassJson);
			Core.byId("NewAssetCostCenter").setModel(CostCenterJson);
			Core.byId("NewAssetBaseUnit").setModel(UnitsJson);
			Core.byId("NewAssetPlaningPlantId").setModel(PlantsJson);
			Core.byId("NewAssetWBSNoId").setModel(PlantsJson);
			Core.byId("NewAssetAsset").setValue("");
			Core.byId("NewAssetSubAsset").setValue("");
			Core.byId("NewAssetQuantity").setValue("");
			Core.byId("NewAssetNameId").setValue("");
		},
		AddNewAssetClose: function() {
			jQuery.sap.F4_AddNewAsset.close();
		},
		VendorClose: function() {
			jQuery.sap.F4_PersonnelVendorSearch.close();
		},
		WBSNoValueHelp: function(oEvent) {
			var id = oEvent.getSource().getId();
			jQuery.sap.F4_WbsNoSearch.open();
			Core.byId("WbsNoSearchPageId").setExpanded(true);
			this.ClearWbsPress();
		},
		WbsNoClose: function() {
			jQuery.sap.F4_WbsNoSearch.close();
		},
		ClearWbsPress: function() {
			Core.byId("WbsProjectId").setValue("");
			Core.byId("WbsProjectNameId").setValue("");
			Core.byId("WbsWBSNoId").setValue("");
			Core.byId("WbsWbsNameId").setValue("");
			var emptyJson = new JSONModel([]);
			emptyJson.iSizeLimit = 10000;
			Core.byId("WbsTableId").setModel(emptyJson);
			Core.byId("WbsTabelPanelId").setVisible(false);
			var Title = jQuery.sap.i18n.getText("SearchWbsNoTitle");
			Core.byId("SearchWbsNoTitleId").setText(Title);
		},
		GetWbsPress: function() {
			var Project = Core.byId("WbsProjectId").getValue();
			var ProjectName = Core.byId("WbsProjectNameId").getValue();
			var WBSNo = Core.byId("WbsWBSNoId").getValue();
			var WbsName = Core.byId("WbsWbsNameId").getValue();
			jQuery.sap.DataLoadProgress.open();
			Core.byId("WbsNoSearchPageId").setExpanded(false);
			Core.byId("WbsTabelPanelId").setVisible(true);
			var EntityInputs = [];
			var Obj = {};
			if(Project != "") {
				var data = "Pspid eq '".concat(Project).concat("'");
				EntityInputs.push(data);
				Obj.Pspid = Project;
			}
			if(ProjectName != "") {
				var data = "Postu eq '".concat(ProjectName).concat("'");
				EntityInputs.push(data);
				Obj.Postu = ProjectName;
			}
			if(WBSNo) {
				var data = "Posid eq '".concat(WBSNo).concat("'");
				EntityInputs.push(data);
				Obj.Posid = WBSNo;
			}
			if(WbsName != "") {
				var data = "Postu eq '".concat(WbsName).concat("'");
				EntityInputs.push(data);
				Obj.Uname = WbsName;
			}
			var EntityValue = "SearchWBSSet?$expand=EtWbsSearch";
			if(EntityInputs.length > 0) {
				EntityInputs = EntityInputs.toString();
				EntityInputs = EntityInputs.split(',').join(' and ');
				EntityInputs = encodeURIComponent(EntityInputs);
				EntityValue = "SearchWBSSet?$filter=" + EntityInputs + "&$expand=EtWbsSearch";
			}
			jQuery.sap.that.checkConnection();
			if(jQuery.sap.B_isonLine == false) {
				MessageBox.warning(jQuery.sap.i18n.getText("msgoffline"));
				return false;
			}
			setTimeout(function() {
				var getData = new sap.ui.model.odata.ODataModel(jQuery.sap.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
				getData.setHeaders(Obj);
				getData.read(EntityValue, null, null, false, function(oData, response) {
					var DataJson = new JSONModel([]);
					DataJson.iSizeLimit = 10000;
					var Title = jQuery.sap.i18n.getText("SearchWbsNoTitle");
					if(oData.results.length == 0) {
						var Msg = jQuery.sap.i18n.getText("NoDataMsg");
						MessageBox.information(Msg);
						Core.byId("WbsTableId").setModel(DataJson);
						Core.byId("SearchWbsNoTitleId").setText(Title);
					} else {
						DataJson.setData(oData.results[0].EtWbsSearch.results);
						Core.byId("WbsTableId").setModel(DataJson);
						Core.byId("SearchWbsNoTitleId").setText(Title + " (" + oData.results[0].EtWbsSearch.results.length + ")");
					}
					jQuery.sap.DataLoadProgress.close();
				}, function(oError) {
					jQuery.sap.DataLoadProgress.close();
					var errMessage = oError.response.statusText;
					var MessageText = JSON.parse(oError.response.body).error.message.value;
					MessageBox.error(errMessage + "  (" + MessageText + ")");
				});
			}, 500);
		},
		AddWbsNo: function() {
			var WbsTable = Core.byId("WbsTableId");
			var SelectedContext = WbsTable.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength == 0) {
				var Msg = jQuery.sap.i18n.getText("selectRecord");
				MessageBox.information(Msg);
				return false;
			} else {
				var Data = WbsTable.getContextByIndex(WbsTable.getSelectedIndices()[0]).getObject();
					Core.Post1 = Data.Post1;
					Core.Posid = Data.Posid;
					Core.byId("ProjNoId").setValue(Data.Pspid);
					Core.byId("WBSNoId").setValue(Data.Poski);
					jQuery.sap.F4_WbsNoSearch.close();
			}
		},
		UpdateRequest_Close: function() {
			jQuery.sap.F4_Update_Request.close();
		},
		// Change event for DatePicker
		changeDateHandler: function(oEvent) {
			var Date = oEvent.getParameter("value");
			var F4_view = Core;
			var view = this.getView();
			if(view.byId(jQuery.sap.OpenedDate_id) != undefined) {
				view.byId(jQuery.sap.OpenedDate_id).setValue(Date);
			} else if(F4_view.byId(jQuery.sap.OpenedDate_id) != undefined) {
				F4_view.byId(jQuery.sap.OpenedDate_id).setValue(Date);
			}
		},
		// Global Datepicker
		openDatePicker: function(oEvent) {
			var view_id = oEvent.mParameters.id.lastIndexOf("-");
			view_id = oEvent.mParameters.id.slice(view_id + 1, 100);
			jQuery.sap.OpenedDate_id = view_id;
			this.getView().byId("HiddenDP").setValue(new Date());
			this.getView().byId("HiddenDP").openBy(oEvent.getSource().getDomRef());
		},
		Numeric_livechange  :function(oEvent) {
			var id = oEvent.oSource.sId.split("--")[1];
			var inputvalue = Core.byId(id).getValue();
			var value = inputvalue.replace(/[^0-9\.]/g, '');
			if (id == "Validto_yearid" || id == "Validfrom_yearid"){
				this.getView().byId(id).setDOMValue(value.substring(0, 4));
			}else{
				this.getView().byId(id).setDOMValue(value.substring(0, 3));
			}
		},
		Close_Update_Request_Search : function(){
			jQuery.sap.PIP_Report_Search.close();
		},
		Search_Records : function(){
			jQuery.sap.PIP_Report_Search.open();
		},
		createColumnConfig: function() {
			var aCols = [];
			aCols.push({
				label: 'Project No',
				property: 'Pspid',
				type: EdmType.String,
				width: 8
			});
			aCols.push({
				label: 'PIP Asset No',
				property: 'Anln1',
				type: EdmType.String,
				width: 8
			});
			aCols.push({
				label: 'PIP Asset Name',
				property: 'Txt50',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'Sub Asset No',
				property: 'Anln2',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'WBS No',
				property: 'Posid',
				type: EdmType.String,
				width: 8
			});
			aCols.push({
				label: 'WBS Name',
				property: 'Wbsnmae',
				type: EdmType.String,
				width: 11
			});
			aCols.push({
				label: 'Project Cost',
				property: 'Prjcost',
				type: EdmType.String,
				width: 8
			});
			aCols.push({
				label: 'Approved Revised Project Cost',
				property: 'Rprjcost',
				type: EdmType.String,
				width: 15
			});
			aCols.push({
				label: 'Approved Budget for FY',
				property: 'Wert1',
				type: EdmType.String,
				width: 14
			});
			aCols.push({
				label: 'PIP Balance',
				property: 'Answt',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'YEP',
				property: 'Yepcost',
				type: EdmType.String,
				width: 10
			});
			aCols.push({
				label: 'Reporting Date',
				property: 'Repdate',
				type: EdmType.String,
				width: 10
			});
			aCols.push({
				label: 'Completion Date',
				property: 'Compd',
				type: EdmType.String,
				width: 10
			});
			aCols.push({
				label: 'Revised Completion Date',
				property: 'Rcompd',
				type: EdmType.String,
				width: 14
			});
			aCols.push({
				label: '% of Completion',
				property: 'Prozs',
				type: EdmType.String,
				width: 9
			});
			aCols.push({
				label: 'Status',
				property: 'Pstatus',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'Ageing',
				property: 'Dageing',
				type: EdmType.String,
				width: 8
			});
			aCols.push({
				label: 'Plant Code',
				property: 'Werks',
				type: EdmType.String,
				width: 7
			});
			aCols.push({
				label: 'Request Id',
				property: 'Atrnid',
				type: EdmType.String,
				width: 8
			});
			aCols.push({
				label: 'Financial Year',
				property: 'Fyear',
				type: EdmType.String,
				width: 8
			});
			return aCols;
		},
		onExport: function() {
			var aCols, mDataSource, mSettings, oSpreadsheet, oTable;
			oTable = this.getView().byId("Pip_Ageing_Report_Table");
			mDataSource = oTable.getBinding("rows");
			if(mDataSource == undefined) {
				this.getView().byId("Pip_Ageing_Report_Table").setModel(this.Empty_Model);
				mDataSource = oTable.getBinding("rows");
			}
			aCols = this.createColumnConfig();
			var mSettings = {
				workbook: {
					columns: aCols,
				},
				dataSource: mDataSource,
				fileName: "SAP_EAM_PIP_Report_Data.xlxs", //`${sap.ui.getCore().byId("input_id").getValue()}.xlsx`,
				worker: false
			};
			oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
			oSpreadsheet.build().then(function() {
				sap.m.MessageToast.show("Export is finished");
			}).finally(function() {
				oSpreadsheet.destroy();
			}).catch(function(sMessage) {
				sap.m.MessageToast.show("Export error: " + sMessage)
			})
		},
	});
});