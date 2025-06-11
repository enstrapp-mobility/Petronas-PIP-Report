sap.ui.define(["ZEMT_AM_PIP_APP/controller/BaseController", "ZEMT_AM_PIP_APP/Format/Formatter", 'sap/ui/model/Filter', 'sap/ui/core/Core', 'sap/ui/model/json/JSONModel', 'sap/ui/model/Sorter', 'sap/m/MessageToast', 'sap/m/Dialog', 'sap/m/Button', 'sap/m/Text', 'sap/m/MessageBox', 'sap/ui/table/RowAction', "sap/ui/table/RowActionItem", "sap/ui/table/RowSettings", "sap/ui/core/Fragment", 'sap/ui/export/library', 'sap/ui/export/Spreadsheet'], function(BaseController, formatter, Filter, Core, JSONModel, Sorter, MessageToast, Dialog, Button, Text, MessageBox, RowAction, RowActionItem, RowSettings, Fragment, exportLibrary, Spreadsheet) {
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
			Core.that = this;
			this.Loadi18n();
			Core.DataSubmitProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('DataSubmitProgress')
			});
			Core.DataSaveProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('DataSaveProgress')
			});
			Core.DataLoadProgress = new sap.m.BusyDialog({
				text: Core.i18n.getText('DataLoadProgress')
			});
			this.Empty_Model = new JSONModel([]);
			Core.PIP_Report_Search = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/Update_Request_Search", this);
			this.getView().addDependent(Core.PIP_Report_Search);
			Core.F4_WbsNoSearch = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/WbsNoSearch", this);
			this.getView().addDependent(Core.F4_WbsNoSearch);
			Core.F4_AssetSearch = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/AssetSearch", this);
			this.getView().addDependent(Core.F4_AssetSearch);
			Core.F4_Update_Request = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/Update_Request", this);
			this.getView().addDependent(Core.F4_Update_Request);
			Core.F4_CostCenter = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/CostCenter", this);
			this.getView().addDependent(Core.F4_CostCenter);
			Core.F4_CostCenter._oDialog.mAggregations.beginButton.oParent.addButton(new sap.m.Button({
				text: 'Cancel',
				press: Core.that.onCostCenter_DialogClose
			}));
			Core.F4_CostCenter._oDialog.mAggregations.beginButton.oParent.addButton(new sap.m.Button({
				text: 'Clear',
				press: Core.that.onCostCenter_DialogClose
			}));
			Core.F4_Long_Text_View = sap.ui.xmlfragment("ZEMT_AM_PIP_APP/Fragments/Long_Text_View", this);
			this.getView().addDependent(Core.F4_Long_Text_View);
			var oTable = this.getView().byId("Pip_Ageing_Report_Table");
			// Event handler for column reorder
			oTable.attachColumnMove(function(oEvent) {
				setTimeout(function() {
					// Get the current column order
					var columnOrder = oTable.getColumns().map(function(column) {
						return column.getId();
					});
					// Save the column order to local storage
					localStorage.setItem('PIP_Report_User_columnOrder', JSON.stringify(columnOrder));
				}, 1500);
			});
			// Check if there is a stored column order
			var columnOrder = localStorage.getItem('PIP_Report_User_columnOrder');
			columnOrder = columnOrder ? JSON.parse(columnOrder) : null;
			var storedColumnOrder = columnOrder;
			if(storedColumnOrder) {
				// Apply the stored column order to the table
				storedColumnOrder.forEach(function(columnId, index) {
					var column = Core.byId(columnId);
					if(column) {
						oTable.removeColumn(column);
						oTable.insertColumn(column, index);
					}
				});
			}
			//	Core.that.getView().byId("Pip_Ageing_Report_Table").setVisibleRowCount(15);
			this.getRouter().getRoute("PIP_Ageing_Report_Main").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function(oEvent) {
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				Core.that.showDocument();
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			setTimeout(function() {
				//	Core.that.UserMaster();
				var GetMasterData = new sap.ui.model.odata.ODataModel(Core.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
				GetMasterData.setHeaders({
					"muser": Core.O_Login_user.Muser,
				});
				GetMasterData.read("GetMasterDataSet?$expand=EtDchkl,EtCompanyCode,EtPrctr,ETT8JVT,EtPlants,EtPrioroty,EtTagTypes,EtInspStatus,EtAssetClass,EtCostCenter," + "EtMobAppTiles,EtMobAppListView,EtViewAppScreen,EtAppScreenFields,EtUserData,EtInsuranceTyp,EtEquiCategory,EtObjectType,EtABCIndicator,EtLocation,EtUnits,EtPrctr,EtT005t,EtT087t,EtTa1tvt,EtDchklist,EtT090nat,EtT093t,EtAnkb", null, "", true, function(oData, response) {
					Core.A_MasterDataForF4Helps = oData.results[0];
					Core.A_MasterDataForF4Helps.EtCostCenter.results.map(function(x) {
						x.Customfield = `${x.Kostl} - ${x.Ktext}`
					});
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
					var unique_asset_class = [
						  ...new Map(Core.A_MasterDataForF4Helps.EtAssetClass.results.filter(Boolean).map(item => [item['Anlkl'], item])).values()
						];

						// Sort the array by the 'Anlkl' property (or any other property you'd like)
						unique_asset_class.sort((a, b) => {
						  if (a['Anlkl'] < b['Anlkl']) {
						    return -1; // Sort a before b
						  }
						  if (a['Anlkl'] > b['Anlkl']) {
						    return 1; // Sort b before a
						  }
						  return 0; // Keep the order if equal
						});
					var asset_class_model = new JSONModel(unique_asset_class);
					asset_class_model.iSizeLimit = unique_asset_class.length;
					var Joint_venture = oData.results[0].ETT8JVT.results;
					var Joint_venture_Model = new sap.ui.model.json.JSONModel(Joint_venture);
					Joint_venture_Model.iSizeLimit = Joint_venture.length;
					var Eval_Grp1 = [],
						Eval_Grp2 = [],
						Eval_Grp3 = [],
						Eval_Grp4 = [],
						Eval_Grp5 = [];
					// Filter Evaluation Groups 
					Core.A_MasterDataForF4Helps.EtT087t.results.map(function(x, i, a) {
						x.Ordnr == '1' && (Eval_Grp1 = Eval_Grp1.concat(a[i]));
						x.Ordnr == '2' && (Eval_Grp2 = Eval_Grp2.concat(a[i]));
						x.Ordnr == '3' && (Eval_Grp3 = Eval_Grp3.concat(a[i]));
						x.Ordnr == '4' && (Eval_Grp4 = Eval_Grp4.concat(a[i]));
						x.Ordnr == '5' && (Eval_Grp5 = Eval_Grp5.concat(a[i]));
					});
					var Eval_Grp4_model = new sap.ui.model.json.JSONModel(Eval_Grp4);
					Eval_Grp4_model.iSizeLimit = Eval_Grp4.length;
					Core.byId("CostCenter").setModel(CostCenterJson);
					Core.byId("VhCostCenterId").setModel(CostCenterJson);
					Core.byId("VhAssetClassId").setModel(asset_class_model);
					Core.byId("select_CostCenter_list").setModel(CostCenterJson);
					Core.byId("VhLocationId").setModel(LocationJson);
					Core.byId("Plant").setModel(PlantsJson);
					Core.byId("CompanyCode").setModel(CompanyCodeJson);
					Core.byId("AssetClass_id").setModel(asset_class_model);
					Core.byId("EvaluationGroup4Id").setModel(Eval_Grp4_model);
					Core.byId("JointVenture").setModel(Joint_venture_Model);
					Core.byId("CompanyCode").setSelectedKey(EtCompanyCode[0].Bukrs);
					Core.PIP_Report_Search.open();
					Core.that.showDocument();
				}, function(oError) {
					Core.that.showDocument();
				});
			}, 50)
		},
		onAfterRendering: function() {
			this.getView().byId("logged_user").setText(Core.O_Login_user.Muser + " " + Core.O_Login_user.FullName);
		},
		UserMaster: function(key) {
			var Fyear, Atrnid, Bukrs, Anlkl, Kostl, Werks, Mass_Data, timeout;
			timeout = 0;
			var UserMaster = new sap.ui.model.odata.ODataModel(Core.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
			UserMaster.setHeaders({
				"Muser": Core.O_Login_user.Muser,
				"Uname": Core.O_Login_user.Muser,
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
					Core.byId("CompanyCode").setSelectedKey(CompanyCode[0].Bukrs);
				}, function(err) {});
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
		},
		VhCompanyCodeEmptyCheck: function(oEvent) {
			var CompanyCode = Core.byId("VhCompanyCodeId").getSelectedKey();
			var SelectedKey = oEvent.getSource().getSelectedKey();
			if(CompanyCode == "" && SelectedKey != "") {
				var Msg = Core.i18n.getText("CompanyCodeMandatoryTxt");
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
			var PlantCodeMandatoryTxt = Core.i18n.getText("PlantCodeMandatoryTxt");
			if(PlantCode == "") {
				MessageBox.information(PlantCodeMandatoryTxt, {
					actions: [MessageBox.Action.NO],
					onClose: function(oAction) {
						Core.byId("VhLocationId").setSelectedKey("");
					}
				});
			}
		},
		CompanyCode_Change: function(oEvent) {
			Core.byId("AssetClass_id").setSelectedItems([]);
			Core.byId("CostCenter").setSelectedKey("");
			Core.byId("JointVenture").setSelectedKey("");
			if(oEvent.getSource().getSelectedItem() != null) {
				var SelectedItem = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, SelectedItem.Bukrs));
				var filter = new sap.ui.model.Filter(aFilters, false);
				//Core.byId("AssetClass_id").getBinding("items").filter(filter, "Application");
				//Core.byId("CostCenter").getBinding("suggestionItems").filter(filter, "Application");
				Core.byId("JointVenture").getBinding("items").filter(filter, "Application");
			} else {
				var filter = [];
				//Core.byId("AssetClass_id").getBinding("items").filter(filter, "Application");
				//Core.byId("CostCenter").getBinding("suggestionItems").filter(filter, "Application");
				Core.byId("JointVenture").getBinding("items").filter(filter, "Application");
			}
			this.on_selectionkey_change(oEvent);
		},
		on_selectionkey_change: function(oEvent) {
			var id = oEvent.oSource.sId;
			if(id.includes('xmlview')) {
				id = oEvent.oSource.sId.split("--")[1];
			}
			var v = Core.that.getView().byId(id);
			var c = Core.byId(id);
			if(v != undefined) {
				v.getSelectedKey() == "" && (v.setSelectedKey());
			} else if(c != undefined) {
				c.getSelectedKey() == "" && (c.setSelectedKey());
			}
		},
		// Exit App
		ExitAction: function() {
			var informationDialog = new Dialog({
				title: Core.i18n.getText("MsgWarning"),
				type: 'Message',
				state: 'Warning',
				content: new sap.m.Text({
					text: Core.i18n.getText("AssetBackExit")
				}),
				beginButton: new sap.m.Button({
					text: Core.i18n.getText("MsgYes"),
					type: 'Accept',
					press: function() {
						informationDialog.close();
						setTimeout(function() {
							window.close();
						}, 500)
					}
				}),
				endButton: new sap.m.Button({
					text: Core.i18n.getText("MsgNo"),
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
		ReferehData: function() {
			var CompanyCode = Core.byId("CompanyCode").getSelectedKey();
			var AssetClass = Core.byId("AssetClass_id").getSelectedItems();
			if(CompanyCode == "" && AssetClass.length == 0) {
				Core.PIP_Report_Search.open();
			} else {
				MessageBox.confirm(Core.i18n.getText("RefershText"), {
					title: "Confirm", // default
					onClose: function(sAction) {
						if(sAction == 'YES') {
							Core.that.Serach_Reqest_Data();
						}
					}, // default
					styleClass: "", // default
					actions: [sap.m.MessageBox.Action.YES,
						sap.m.MessageBox.Action.NO
					], // default
					emphasizedAction: sap.m.MessageBox.Action.YES, // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit // default
				});
			}
		},
		Serach_Reqest_Data: function() {
			var wbsNo = Core.byId("WBSNoId").getValue();
			var ProjectNo = Core.byId("ProjNoId").getValue();
			var pipp_Asset = Core.byId("Asset_id").getValue();
			var ReportingDate = Core.byId("ReportingDate_id").getValue();
			var CompanyCode = Core.byId("CompanyCode").getSelectedKey();
			var JointVenture = Core.byId("JointVenture").getSelectedKey();
			var CostCenter = Core.byId("CostCenter").getSelectedKey();
			var EvaluationGroup4 = Core.byId("EvaluationGroup4Id").getSelectedKey();
			var get_nbv = Core.byId("get_nbv_checkbox").getSelected() ? "X" : "";
			var AssetClass = Core.byId("AssetClass_id").getSelectedItems();
			var plant = Core.byId("Plant").getSelectedKey();
			var PSC_ID = Core.byId("PSC_id").getValue();
			wbsNo == '' && (Core.Posid = '');
			if(CompanyCode == "") {
				MessageBox.information(Core.i18n.getText("CompanyCodeMandatoryTxt"));
				return false;
			} else if(AssetClass.length == 0) {
				MessageBox.information(Core.i18n.getText("AsserClassMandatoryTxt"));
				return false;
			} else {
				Core.DataLoadProgress.open();
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
					if(wbsNo.includes(".")) {
						var data = "Posid eq '".concat(wbsNo).concat("'");
					} else {
						var data = "Posid eq '".concat(Core.Posid).concat("'");
					}
					EntityInputs.push(data);
				}
				/*if(pipp_Asset != "") {
					var data = "Anln1 eq '".concat(pipp_Asset).concat("'");
					EntityInputs.push(data);
				}*/
				if(ReportingDate != "") {
					var data = "Rdate eq '".concat(Core.DateFormat_yyyymmdd.format(new Date(ReportingDate))).concat("'");
					EntityInputs.push(data);
				}
				if(PSC_ID != "") {
					var data = "Zzpsc eq '".concat(PSC_ID).concat("'");
					EntityInputs.push(data);
				}
				if(JointVenture != "") {
					var data = "Vname eq '".concat(JointVenture).concat("'");
					EntityInputs.push(data);
				}
				if(CostCenter != "") {
					var data = "Kostl eq '".concat(CostCenter).concat("'");
					EntityInputs.push(data);
				}
				if(EvaluationGroup4 != "") {
					var data = "Ord44 eq '".concat(EvaluationGroup4).concat("'");
					EntityInputs.push(data);
				}
				if(get_nbv != "") {
					var data = "Getnbv eq '".concat(get_nbv).concat("'");
					EntityInputs.push(data);
				}
				// Initialize an empty array to store asset class filter conditions
				var AssetClassArray = [];
				// Loop through the SearchAssetClass array
				for(var i = 0; i < AssetClass.length; i++) {
					// Construct a filter condition for each asset class and push it to the AssetClassArray
					var data = "Anlkl eq '".concat(AssetClass[i].mProperties.key).concat("'");
					AssetClassArray.push(data);
				}
				// Check if there are any asset class filter conditions
				if(AssetClassArray.length > 0) {
					var AssetClassString = AssetClassArray.toString();
					AssetClassString = AssetClassString.split(',').join(' or ');
					AssetClassString = "(" + AssetClassString + ")";
					EntityInputs.push(AssetClassString);
				}
				var EntityValue = "GetProjPIPReqSet?$expand=EtProjPIPData,EtpipLongtext";
				if(EntityInputs.length > 0) {
					EntityInputs = EntityInputs.toString();
					EntityInputs = EntityInputs.split(',').join(' and ');
					EntityInputs = encodeURIComponent(EntityInputs);
					EntityValue = "GetProjPIPReqSet?$filter=" + EntityInputs + "&$expand=EtProjPIPData,EtpipLongtext";
				}
				Core.that.checkConnection();
				if(Core.B_isonLine == false) {
					MessageBox.warning(Core.i18n.getText("msgoffline"));
					return false;
				}
				setTimeout(function() {
					var Ageing_Report_Model = new sap.ui.model.odata.ODataModel(Core.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
					Ageing_Report_Model.read(EntityValue, null, null, false, function(oData, response) {
						if(oData.results.length != 0) {
							var Report_Data = oData.results[0].EtProjPIPData.results;
							var EtpipLongtext = oData.results[0].EtpipLongtext.results;
							var EtpipLongtext_length = EtpipLongtext.length;
							function get_Long_Text(Posid, Tdid) {
							    var description = '';
							    for (var i = 0; i < EtpipLongtext_length; i++) {
							        if (EtpipLongtext[i].Tdname === Posid && EtpipLongtext[i].Tdid === Tdid) {
							            description += EtpipLongtext[i].Tdline + "\n";
							        }
							    }
							    return description;
							}
							Report_Data.map(function(x) {
								x.Answt = Core.formatter.formatAmount(x.Answt);
								x.Prjcost = Core.formatter.formatAmount(x.Prjcost);
								x.Rprjcost = Core.formatter.formatAmount(x.Rprjcost);
								x.Wert1 = Core.formatter.formatAmount(x.Wert1);
								x.Yepcost = Core.formatter.formatAmount(x.Yepcost);
								x.Pwf05 = Core.formatter.formatAmount(x.Pwf05);
								x.Pwf06 = Core.formatter.formatAmount(x.Pwf06);
								x.Pipctprog = get_Long_Text(x.Posid, 'Z002');
								x.Pipremarks = get_Long_Text(x.Posid, 'Z003');
							})
							var Report_Model = new JSONModel(Report_Data);
							Report_Model.iSizeLimit = Report_Data.length;
							Core.that.getView().byId("Pip_Ageing_Report_Table").setModel(Report_Model);
							Core.that.getView().byId("App_Title").setText(Core.i18n.getText("ApplicationTitle") + " (" + Report_Data.length + ")")
						} else {
							Core.that.getView().byId("Pip_Ageing_Report_Table").setModel(Core.that.Empty_Model);
							Core.that.getView().byId("App_Title").setText(Core.i18n.getText("ApplicationTitle"));
						}
						Core.PIP_Report_Search.close();
						Core.DataLoadProgress.close();
					}, function(oError) {
						Core.DataLoadProgress.close();
						var errMessage = oError.response.statusText;
						var MessageText = JSON.parse(oError.response.body).error.message.value;
						MessageBox.error(errMessage + "  (" + MessageText + ")");
					});
				}, 500);
			}
		},
		ClearData: function() {
			var view = Core.that.getView();
			view.byId("Pip_Ageing_Report_Table").setModel(this.Empty_Model);
		},
		onlyAlphabets: function(oEvent) {
			var regex = /^[A-Za-z]+$/;
			var input = oEvent.getSource().getValue();
			if(!input.match(regex) && input != "") {
				var Msg = Core.i18n.getText("OnlyAlphabetsText");
				MessageBox.information(Msg);
				oEvent.getSource().setValue("");
			}
		},
		AssetValueHelp: function(oEvent) {
			Core.F4_AssetSearch.open();
			this.ClearBtnPress();
			Core.byId("AssetSearchPage").setExpanded(true);
			var EtCompanyCode = Core.A_MasterDataForF4Helps.EtCompanyCode.results;
			var EtPlants = Core.A_MasterDataForF4Helps.EtPlants.results;
			var EtCostCenter = Core.A_MasterDataForF4Helps.EtCostCenter.results;
			var EtAssetClass = Core.A_MasterDataForF4Helps.EtAssetClass.results;
			var EtLocation = Core.A_MasterDataForF4Helps.EtLocation.results;
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
			Core.F4_AssetSearch.close();
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
			var AssetTitle = Core.i18n.getText("AssetSearchTitle");
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
				var Msg = Core.i18n.getText("CompanyCodeMandatoryTxt");
				MessageBox.information(Msg);
			} else if(AssetClass == "") {
				var Msg = Core.i18n.getText("AsserClassMandatoryTxt");
				MessageBox.information(Msg);
			} else {
				Core.DataLoadProgress.open();
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
				Core.that.checkConnection();
				if(Core.B_isonLine == false) {
					MessageBox.warning(Core.i18n.getText("msgoffline"));
					return false;
				}
				setTimeout(function() {
					var getData = new sap.ui.model.odata.ODataModel(Core.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
					getData.setHeaders({
						"muser": Core.O_Login_user.Muser
					});
					getData.read(EntityValue, null, null, false, function(oData, response) {
						var DataJson = new JSONModel([]);
						DataJson.iSizeLimit = 10000;
						var AssetTitle = Core.i18n.getText("AssetSearchTitle");
						if(oData.results.length == 0) {
							var Msg = Core.i18n.getText("NoDataMsg");
							MessageBox.information(Msg);
							Core.byId("AssetTableId").setModel(DataJson);
							Core.byId("AssetSearchTitleId").setText(AssetTitle);
						} else {
							DataJson.setData(oData.results[0].EtAssetSearch.results);
							Core.byId("AssetTableId").setModel(DataJson);
							var Depc_arr = oData.results[0].EtAssetAnlb.results;
							var Depc_arrlen = Depc_arr.length;
							Core.byId("AssetSearchTitleId").setText(AssetTitle + " (" + oData.results[0].EtAssetSearch.results.length + ")");
						}
						Core.DataLoadProgress.close();
					}, function(oError) {
						Core.DataLoadProgress.close();
						console.log("Error in Search SearchIpset");
						var errMessage = oError.response.statusText;
						var MessageText = JSON.parse(oError.response.body).error.message.value;
						MessageBox.error(errMessage + "  (" + MessageText + ")");
					});
				}, 1000);
			}
		},
		AddAssetPress: function() {
			var AssetTable = Core.byId("AssetTableId");
			var SelectedContext = AssetTable.getSelectedIndices();
			var SelectedContextLength = SelectedContext.length;
			if(SelectedContextLength == 0) {
				MessageBox.information(Core.i18n.getText("selectRecord"));
				return false;
			} else if(SelectedContextLength > 1) {
				MessageBox.information(Core.i18n.getText("selectRecordOnlyOne"));
				return false;
			} else {
				var AssetTableData = AssetTable.getContextByIndex(AssetTable.getSelectedIndices()[0]).getObject();
				Core.Bukrs = AssetTableData.Bukrs;
				Core.Anln2 = AssetTableData.Anln2;
				Core.byId("Asset_id").setValue(AssetTableData.Anln1);
				Core.F4_AssetSearch.close();
			}
		},
		Clear_Serach: function() {
			Core.byId("CompanyCode").setSelectedKey();
			Core.byId("AssetClass_id").setSelectedItems([]);
			Core.byId("Plant").setSelectedKey();
			Core.byId("ReportingDate_id").setValue();
			Core.byId("PSC_id").setValue();
			Core.byId("WBSNoId").setValue();
			Core.byId("ProjNoId").setValue();
			Core.byId("Asset_id").setValue();
			Core.byId("CostCenter").setSelectedKey("");
			Core.byId("JointVenture").setSelectedKey("");
			Core.byId("EvaluationGroup4Id").setSelectedKey("");
			Core.byId("get_nbv_checkbox").setSelected(true);
		},
		WBSNoValueHelp: function(oEvent) {
			var id = oEvent.getSource().getId();
			Core.F4_WbsNoSearch.open();
			Core.byId("WbsNoSearchPageId").setExpanded(true);
			this.ClearWbsPress();
		},
		WbsNoClose: function() {
			Core.F4_WbsNoSearch.close();
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
			var Title = Core.i18n.getText("SearchWbsNoTitle");
			Core.byId("SearchWbsNoTitleId").setText(Title);
		},
		GetWbsPress: function() {
			var Project = Core.byId("WbsProjectId").getValue();
			var ProjectName = Core.byId("WbsProjectNameId").getValue();
			var WBSNo = Core.byId("WbsWBSNoId").getValue();
			var WbsName = Core.byId("WbsWbsNameId").getValue();
			Core.DataLoadProgress.open();
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
			Core.that.checkConnection();
			if(Core.B_isonLine == false) {
				MessageBox.warning(Core.i18n.getText("msgoffline"));
				return false;
			}
			setTimeout(function() {
				var getData = new sap.ui.model.odata.ODataModel(Core.Service_URL.getServiceUrl("ZEMT_AMAPP_SRV/"), true);
				getData.setHeaders(Obj);
				getData.read(EntityValue, null, null, false, function(oData, response) {
					var DataJson = new JSONModel([]);
					DataJson.iSizeLimit = 10000;
					var Title = Core.i18n.getText("SearchWbsNoTitle");
					if(oData.results.length == 0) {
						var Msg = Core.i18n.getText("NoDataMsg");
						MessageBox.information(Msg);
						Core.byId("WbsTableId").setModel(DataJson);
						Core.byId("SearchWbsNoTitleId").setText(Title);
					} else {
						DataJson.setData(oData.results[0].EtWbsSearch.results);
						Core.byId("WbsTableId").setModel(DataJson);
						Core.byId("SearchWbsNoTitleId").setText(Title + " (" + oData.results[0].EtWbsSearch.results.length + ")");
					}
					Core.DataLoadProgress.close();
				}, function(oError) {
					Core.DataLoadProgress.close();
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
				var Msg = Core.i18n.getText("selectRecord");
				MessageBox.information(Msg);
				return false;
			} else {
				var Data = WbsTable.getContextByIndex(WbsTable.getSelectedIndices()[0]).getObject();
				Core.Post1 = Data.Post1;
				Core.Posid = Data.Posid;
				Core.byId("ProjNoId").setValue(Data.Pspid);
				Core.byId("WBSNoId").setValue(Data.Poski);
				Core.F4_WbsNoSearch.close();
			}
		},
		UpdateRequest_Close: function() {
			Core.F4_Update_Request.close();
		},
		// Change event for DatePicker
		changeDateHandler: function(oEvent) {
			var Date = oEvent.getParameter("value");
			var F4_view = Core;
			var view = this.getView();
			if(view.byId(Core.OpenedDate_id) != undefined) {
				view.byId(Core.OpenedDate_id).setValue(Date);
			} else if(F4_view.byId(Core.OpenedDate_id) != undefined) {
				F4_view.byId(Core.OpenedDate_id).setValue(Date);
			}
		},
		// Global Datepicker
		openDatePicker: function(oEvent) {
			var view_id = oEvent.mParameters.id.lastIndexOf("-");
			view_id = oEvent.mParameters.id.slice(view_id + 1, 100);
			Core.OpenedDate_id = view_id;
			this.getView().byId("HiddenDP").setValue(new Date());
			this.getView().byId("HiddenDP").openBy(oEvent.getSource().getDomRef());
		},
		Numeric_livechange: function(oEvent) {
			var id = oEvent.oSource.sId.split("--")[1];
			var inputvalue = Core.byId(id).getValue();
			var value = inputvalue.replace(/[^0-9\.]/g, '');
			if(id == "Validto_yearid" || id == "Validfrom_yearid") {
				this.getView().byId(id).setDOMValue(value.substring(0, 4));
			} else {
				this.getView().byId(id).setDOMValue(value.substring(0, 3));
			}
		},
		Close_Update_Request_Search: function() {
			Core.PIP_Report_Search.close();
		},
		Search_Records: function() {
			Core.PIP_Report_Search.open();
		},
		createColumnConfig: function() {
			var aCols = [],
				Label = '',
				property = '',
				type = EdmType.String,
				width = '';
			var Columns = Core.that.getView().byId("Pip_Ageing_Report_Table").getColumns();
			var BindingInfos = Core.that.getView().byId("Pip_Ageing_Report_Table").getRows();
			for(var i = 0; i < Columns.length; i++) {
				if(Columns[i].mProperties.visible == false) {
					continue;
				}
				var obj = {};
				Label = Columns[i].mAggregations.label.mProperties.text.split('\t')[0].trim();
				width = Columns[i].getWidth();
				property = Columns[i].mAggregations.template.mBindingInfos;
				if(property.title) {
					property = property.title.parts[0].path;
				} else {
					if(property.text.parts[0] && property.text.parts[1]) {
						property = property.text.parts[0].path + "-" + property.text.parts[1].path;
					} else {
						property = property.text.parts[0].path;
					}
				}
				obj.label = Label;
				obj.property = property;
				obj.type = type;
				obj.width = width;
				aCols.push(obj);
			}
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
		onCostCenter_ValueHelpRequest: function(oEvent) {
			Core.OPened_CostCenter_id = oEvent.oSource.sId;
			var sInputValue = oEvent.getSource().getValue();
			var EtCompanyCode = Core.A_MasterDataForF4Helps.EtCompanyCode.results;
			var CompanyCode = Core.byId("CompanyCode").getSelectedKey();
			var list = Core.byId("select_CostCenter_list").getBinding("items");
			var len;
			if(Core.OPened_CostCenter_id.includes('xmlview')) {
				Core.OPened_CostCenter_id = oEvent.oSource.sId.split("--")[1];
			}
			if(EtCompanyCode.length > 1) {
				var aFilters = [];

				function ApplyFilter(CoCd) {
					var arr = Core.A_MasterDataForF4Helps.EtCostCenter.results.filter(x => x.Bukrs === CoCd);
					return arr;
				}
				if(Core.OPened_CostCenter_id == "CostCenter") {
					var arr = ApplyFilter(CompanyCode);
					Core.byId("select_CostCenter_list").setModel(Core.that.sModel(arr));
				}
			}
			len = list.aIndices.length;
			Core.F4_CostCenter.open();
			Core.byId("select_CostCenter_list-searchField").setValue();
			Core.byId("select_CostCenter_list-dialog-title").setText(`${Core.i18n.getText("CostCenter")} (${len})`);
			// this.onCostCenter_Search();
		},
		onCostCenter_Search: function(oEvent) {
			var query = oEvent.getParameters().value; // Core.byId("selct_CostCenter_list-searchField").getValue();
			// //oEvent.getParameter('value');
			var list = Core.byId("select_CostCenter_list");
			if(list != undefined) {
				var binding = list.getBinding("items");
				if(!query) {
					binding.filter([]);
				} else {
					binding.filter([new sap.ui.model.Filter([
						new sap.ui.model.Filter("Kostl", sap.ui.model.FilterOperator.Contains, query),
						new sap.ui.model.Filter("Ktext", sap.ui.model.FilterOperator.Contains, query),
						new sap.ui.model.Filter("Customfield", sap.ui.model.FilterOperator.Contains, query),
					], false)])
				}
				Core.byId("select_CostCenter_list-dialog-title").setText(`${Core.i18n.getText("CostCenter")} (${binding.aIndices.length})`);
			}
		},
		onCostCenter_DialogClose: function(oEvent) {
			var aItem = oEvent.getParameter("selectedItem");
			var aContext = oEvent.getSource().getBinding("items");
			if(aItem) {
				aItem = aItem.getBindingContext().getObject();
				if(this.getView().byId(Core.OPened_CostCenter_id) != undefined) {
					this.getView().byId(Core.OPened_CostCenter_id).setSelectedKey(aItem.Kostl);
				} else {
					Core.byId(Core.OPened_CostCenter_id).setSelectedKey(aItem.Kostl);
				}
			}
			aContext != undefined && aContext.filter([]);
			if(oEvent.getSource().mProperties.text == "Clear") {
				var id = Core.OPened_CostCenter_id;
				var v = Core.that.byId(id);
				var c = Core.byId(id);
				if(v != undefined) {
					if(id == "CostCenter") {}
					v.setSelectedKey();
				} else if(c != undefined) {
					c.setSelectedKey();
				}
			}
			Core.F4_CostCenter._oDialog.close();
		},
		on_Current_Progress_Remarks_View : function(oEvent){
			
		}
	});
});